"use client";
import { Table } from "@/components/ui/table";
import { Property, User } from "@/types";
import { useRef, useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
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
				// Don't reassign yet — just show dialog
				setPendingReassign({ propertyId, newUserId: userId });
				setOpenDialog(propertyId);
				return;
			} else {
				return toast.warning("This property is already assigned to this user.");
			}
		}

		const toastId = toast.loading(`${isReassigning ? "Reassigning" : "Assigning"} property...`);
		try {
			await apiFetch("/properties/assign", "POST", { userId, propertyId }, token ?? "");
			await fetchProperties();

			toast.success(`${isReassigning ? "Property reassigned!" : "Property assigned!"}`, { id: toastId });
			setAssignMode((prev) => ({ ...prev, [propertyId]: false }));
			setPendingReassign(null);
		} catch (err) {
			console.error("Assign error:", err);
			toast.error("Failed to assign property");
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
			/>
		</Table>
	);
}
