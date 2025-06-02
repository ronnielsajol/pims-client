"use client";
import { Table } from "@/components/ui/table";
import { ApiError, Property, User } from "@/types";
import { useRef, useState, Dispatch, SetStateAction, useMemo } from "react";
import { toast } from "sonner";
import { apiFetch, apiFetchWithStatus } from "@/lib/api";
import PropertyTableHeader from "./PropertyTableHeader";
import PropertyTableBody from "./PropertyTableBody";

interface PropertyTableState {
	token: string | null;
	user: User | null;
	properties: Property[];
	users: User[];
	addMode: boolean;
	setAddMode: (mode: boolean) => void;
	fetchProperties: () => Promise<void>;
}

export default function PropertyTable({ state }: { state: PropertyTableState }) {
	const { token, user, properties, users, fetchProperties, addMode, setAddMode } = state;
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
			const { data, status } = await apiFetchWithStatus<{ message?: string }>(
				"/properties/assign",
				"POST",
				{ userId, propertyId },
				token ?? ""
			);

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
			await apiFetch(`/properties/update/${propertyId}`, "PATCH", { property: values }, token ?? "");
			toast.success("Property updated!", { id: toastId });
			setEditMode((prev) => ({ ...prev, [propertyId]: false }));
			fetchProperties();
		} catch (error) {
			toast.error("Failed to update property.");
			console.error(error);
		}
	};

	const handleDelete = async (propertyId: number, confirmed: boolean) => {
		const toastId = toast.loading("Deleting property...");
		setDeleteLoading(true);

		try {
			const res = await apiFetch<{ requiresConfirmation?: boolean; message?: string }>(
				`/properties/${propertyId}`,
				"DELETE",
				{ confirmed },
				token ?? ""
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
			console.error("Delete error:", err);
			toast.error("Failed to delete property");
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
				{ property: { location_detail: newLocation } }, // Ensure backend handles this field
				token ?? ""
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
	return (
		<Table className='overflow-hidden '>
			<PropertyTableHeader userRole={userRole} />
			<PropertyTableBody
				properties={properties}
				users={users}
				userRole={userRole}
				token={token}
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
			/>
		</Table>
	);
}
