"use client";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ApiError, Property, User } from "@/types";
import { useRef, useState, Dispatch, SetStateAction, useMemo } from "react";
import { toast } from "sonner";
import { apiFetch, apiFetchWithStatus } from "@/lib/api";
import PropertyTableHeader from "./PropertyTableHeader";
import PropertyTableBody from "./PropertyTableBody";
import { Skeleton } from "../ui/skeleton";

interface PropertyTableState {
	user: User | null;
	properties: Property[];
	users: User[];
	addMode: boolean;
	setAddMode: (mode: boolean) => void;
	fetchProperties: () => Promise<void>;
	isLoading?: boolean;
}

interface ColumnDefinition {
	key: string;
	label: string;
	className?: string;
	isVisible: (userRole?: string) => boolean;
}

const columnDefinitions: ColumnDefinition[] = [
	{ key: "id", label: "ID", className: "w-[50px]", isVisible: () => true },
	{ key: "productNumber", label: "Product Number", className: "w-1/12", isVisible: () => true },
	{ key: "description", label: "Description", className: "w-1/12", isVisible: () => true },
	{ key: "quantity", label: "Quantity", className: "w-1/12", isVisible: () => true },
	{ key: "value", label: "Value", className: "w-1/12", isVisible: () => true },
	{ key: "serialNumber", label: "Serial Number", className: "w-1/8", isVisible: () => true },
	{
		key: "assignedTo",
		label: "Assigned To",
		isVisible: (role) => ["admin", "master_admin", "property_custodian"].includes(role ?? ""),
	},
	{ key: "department", label: "Department", isVisible: (role) => !["staff", "property_custodian"].includes(role ?? "") },
	{ key: "location", label: "Location", isVisible: (role) => role === "property_custodian" },
	{
		key: "actions",
		label: "Actions",
		className: "w-[120px]",
		isVisible: (role) => ["admin", "master_admin", "property_custodian"].includes(role ?? ""),
	},
];

export default function PropertyTable({ state }: { state: PropertyTableState }) {
	const { user, properties, users, fetchProperties, addMode, setAddMode } = state;
	const userRole = user?.role;

	const [selectedUser, setSelectedUser] = useState<{ [propertyId: number]: string }>({});
	const [assignMode, setAssignMode] = useState<{ [propertyId: number]: boolean }>({});
	const [openDialog, setOpenDialog] = useState<number | null>(null);
	const [openUserSelect, setOpenUserSelect] = useState<{ [propertyId: number]: boolean }>({});
	const [pendingReassign, setPendingReassign] = useState<{ propertyId: number; newUserId: string } | null>(null);
	const [newProperty, setNewProperty] = useState({
		propertyNo: "",
		description: "",
		quantity: "",
		value: "",
		serialNo: "",
	});
	const [addLoading, setAddLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [editMode, setEditMode] = useState<{ [propertyId: number]: boolean }>({});
	const [editValues, setEditValues] = useState<{
		[propertyId: number]: {
			propertyNo: string;
			description: string;
			quantity: string;
			value: string;
			serialNo: string;
		};
	}>({});
	const addRowRef = useRef<HTMLTableRowElement | null>(null);
	const [printingId, setPrintingId] = useState<number | null>(null);

	const handleAssign = async (propertyId: number, overrideConfirm = false) => {
		const userId = selectedUser[propertyId];
		if (!userId) return toast.warning("Please select a user");

		const property = properties.find((p) => p.id === propertyId);
		const isReassigning = !!property?.assignedTo;
		const currentlyAssignedUser = users.find((u) => u.name === property?.assignedTo);

		if (isReassigning && !overrideConfirm) {
			if (userId !== String(currentlyAssignedUser?.id)) {
				setPendingReassign({ propertyId, newUserId: userId });
				setOpenDialog(propertyId);
				return;
			} else {
				return toast.warning("This property is already assigned to this user.");
			}
		}

		const toastId = toast.loading(`${isReassigning ? "Submitting request" : "Assigning property"}...`);
		try {
			const { data, status } = await apiFetchWithStatus<{ message?: string }>("/properties/assign", "POST", {
				userId,
				propertyId,
			});

			if (status === 201 || status === 200) {
				toast.success("Property assigned successfully!", { id: toastId });
				await fetchProperties();
			} else if (status === 202) {
				toast.success(data.message || "Request submitted for approval!", { id: toastId });
			}

			setAssignMode((prev) => ({ ...prev, [propertyId]: false }));
			setPendingReassign(null);
			fetchProperties();
		} catch (err) {
			console.error("Assign error:", err);
			const errorMessage = (err as ApiError).message || "Failed to complete the assignment request.";
			toast.error(errorMessage, { id: toastId });
		}
	};

	const handleSaveEdit = async (propertyId: number) => {
		const values = editValues[propertyId];
		if (!values?.propertyNo || !values?.description || !values?.quantity || !values?.serialNo || !values?.value) return;

		const toastId = toast.loading("Updating property...");

		try {
			await apiFetch(`/properties/update/${propertyId}`, "PATCH", { property: values });
			toast.success("Property updated!", { id: toastId });
			setEditMode((prev) => ({ ...prev, [propertyId]: false }));
			fetchProperties();
		} catch (err) {
			const error = err as ApiError;

			if (error.status === 409) {
				toast.error(error.message || "This property number already exists.", { id: toastId });
			} else {
				toast.error(error.message || "Failed to update property.", { id: toastId });
			}
		}
	};

	const handleDelete = async (propertyId: number, confirmed: boolean) => {
		const toastId = toast.loading("Deleting property...");
		setDeleteLoading(true);

		try {
			const res = await apiFetch<{ requiresConfirmation?: boolean; message?: string }>(
				`/properties/${propertyId}`,
				"DELETE",
				{ confirmed }
			);

			if (res.requiresConfirmation && !confirmed) {
				toast.warning(res.message || "This property is assigned. Confirmation is required to delete.");
				return;
			}

			toast.success("Property deleted successfully", {
				id: toastId,
			});
			await fetchProperties();
		} catch (err) {
			const error = err as ApiError;
			toast.error(error.message || "Failed to delete property");
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleLocationUpdate = async (propertyId: number, newLocation: string) => {
		const toastId = toast.loading("Updating location...");
		try {
			await apiFetch(
				`/properties/${propertyId}/location-detail`,
				"PATCH",
				{ property: { location_detail: newLocation } } // Ensure backend handles this field
			);
			toast.success("Location updated!", { id: toastId });
			await fetchProperties(); // Refresh data
		} catch (err) {
			const error = err as ApiError; //
			toast.error(error.message || "Failed to update location.", { id: toastId });
			console.error("Location update error:", error);
		}
	};

	const allAvailableLocations = useMemo(() => {
		const locations = properties
			.map((p) => p.location_detail)
			.filter((loc): loc is string => typeof loc === "string" && loc.trim() !== ""); // Filter out empty or undefined
		return [...new Set(locations)].sort(); // Unique and sorted
	}, [properties]);

	const handleCreatePrintJob = async (propertyId: number) => {
		setPrintingId(propertyId);
		const toastId = toast.loading("Adding property to print queue...");

		try {
			await apiFetch("/print-jobs/create", "POST", { propertyId: propertyId });

			toast.success("Property successfully added to print queue!", { id: toastId });
		} catch (err) {
			const error = err as ApiError;

			if (error.status === 409) {
				toast.error(error.message || "This property is already in the print queue.", { id: toastId });
			} else {
				toast.error(error.message || "Failed to add property to queue.", { id: toastId });
			}
			console.error("Create print job error:", err);
		} finally {
			setPrintingId(null);
		}
	};

	const visibleColumns = useMemo(() => columnDefinitions.filter((col) => col.isVisible(userRole)), [userRole]);

	const SkeletonRow = () => (
		<TableRow>
			{visibleColumns.map((col) => (
				<TableCell key={col.key}>
					<Skeleton className='h-5 w-full rounded-md' />
				</TableCell>
			))}
		</TableRow>
	);

	return (
		<Table className='w-full table-auto'>
			<PropertyTableHeader userRole={userRole} />
			{state.isLoading ? (
				<>
					<TableBody>
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
					</TableBody>
				</>
			) : (
				<PropertyTableBody
					properties={properties}
					users={users}
					userRole={userRole}
					fetchProperties={fetchProperties}
					addMode={addMode}
					setAddMode={setAddMode as Dispatch<SetStateAction<boolean>>} // Cast to satisfy PropertyTableBodyProps
					selectedUser={selectedUser}
					setSelectedUser={setSelectedUser}
					assignMode={assignMode}
					setAssignMode={setAssignMode}
					openDialog={openDialog}
					setOpenDialog={setOpenDialog}
					openUserSelect={openUserSelect}
					setOpenUserSelect={setOpenUserSelect}
					pendingReassign={pendingReassign}
					setPendingReassign={setPendingReassign}
					newProperty={newProperty}
					setNewProperty={setNewProperty}
					addLoading={addLoading}
					setAddLoading={setAddLoading}
					deleteLoading={deleteLoading}
					editMode={editMode}
					setEditMode={setEditMode}
					editValues={editValues}
					setEditValues={setEditValues}
					handleAssign={handleAssign as (propertyId: number, overrideConfirm?: boolean | undefined) => Promise<void>} // Cast to satisfy PropertyTableBodyProps
					handleSaveEdit={handleSaveEdit}
					handleDelete={handleDelete}
					addRowRef={addRowRef}
					allAvailableLocations={allAvailableLocations}
					handleLocationUpdate={handleLocationUpdate}
					handleCreatePrintJob={handleCreatePrintJob}
					printingId={printingId}
				/>
			)}
		</Table>
	);
}
