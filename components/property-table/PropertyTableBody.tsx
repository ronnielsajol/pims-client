// components/property-table/PropertyTableBody.tsx
"use client";
import { motion } from "motion/react";
import { TableBody, TableCell } from "@/components/ui/table";

import { Property, User } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, Dispatch, SetStateAction, RefObject } from "react";
import { Badge } from "@/components/ui/badge";
import PropertyTableActionsCell from "./PropertyTableActionsCell";
import PropertyTableAddRow from "./PropertyTableAddRow";
import EditableTextCell from "./cells/EditableTextCell";
import UserSelectionCell from "./cells/UserSelectionCell";
import LocationSelectionCell from "./cells/LocationSelectionCell";

export interface PropertyTableBodyProps {
	properties: Property[];
	users: User[];
	userRole: string | undefined;
	addMode: boolean;
	setAddMode: Dispatch<SetStateAction<boolean>>;

	// UI State and Setters from parent
	selectedUser: { [propertyId: number]: string };
	setSelectedUser: Dispatch<SetStateAction<{ [propertyId: number]: string }>>;
	assignMode: { [propertyId: number]: boolean };
	setAssignMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	openDialog: number | null;
	setOpenDialog: Dispatch<SetStateAction<number | null>>;
	openUserSelect: { [propertyId: number]: boolean };
	setOpenUserSelect: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	pendingReassign: { propertyId: number; newUserId: string } | null;
	setPendingReassign: Dispatch<SetStateAction<{ propertyId: number; newUserId: string } | null>>;
	newProperty: { propertyNo: string; description: string; quantity: string; value: string; serialNo: string };
	setNewProperty: Dispatch<
		SetStateAction<{ propertyNo: string; description: string; quantity: string; value: string; serialNo: string }>
	>;
	editMode: { [propertyId: number]: boolean };
	setEditMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	editValues: { [propertyId: number]: Partial<Property> };
	setEditValues: Dispatch<SetStateAction<{ [propertyId: number]: Partial<Property> }>>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	allAvailableLocations: string[];

	// Handlers from parent (which now wrap mutations)
	handleAssign: (propertyId: number, overrideConfirm?: boolean) => void;
	handleSaveEdit: (propertyId: number, values: Partial<Property>) => void;
	handleDelete: (propertyId: number, confirmed: boolean) => void;
	handleSaveNewProperty: () => void;
	handleLocationUpdate: (propertyId: number, newLocation: string) => Promise<void>;
	handleCreatePrintJob: (propertyId: number) => void;
	handleDisplayData: (propertyId: number) => void;

	// Loading states from parent's mutations
	isAssigning: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	isAdding: boolean;
	isSendingToDisplay: boolean;

	isUpdatingLocation: boolean;
	isCreatingPrintJob: boolean;
}

export default function PropertyTableBody({
	properties,
	users,
	userRole,
	addMode,
	setAddMode,
	selectedUser,
	setSelectedUser,
	assignMode,
	setAssignMode,
	openDialog,
	setOpenDialog,
	openUserSelect,
	setOpenUserSelect,
	pendingReassign,
	setPendingReassign,
	newProperty,
	setNewProperty,
	editMode,
	setEditMode,
	editValues,
	setEditValues,
	handleAssign,
	handleSaveEdit,
	handleDelete,
	handleSaveNewProperty,
	addRowRef,
	allAvailableLocations,
	handleLocationUpdate,
	handleCreatePrintJob,

	isAssigning,
	isUpdating,
	isDeleting,
	isAdding,
	isUpdatingLocation, // eslint-disable-line @typescript-eslint/no-unused-vars
	isCreatingPrintJob,
	isSendingToDisplay,
	handleDisplayData,
}: PropertyTableBodyProps) {
	useEffect(() => {
		if (addMode && addRowRef.current) {
			addRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [addMode, addRowRef]);

	const getEditableCellProps = (
		p: Property,
		field: keyof Pick<Property, "propertyNo" | "description" | "quantity" | "value" | "serialNo" | "location_detail">
	) => {
		const isCurrentlyEditing = editMode[p.id];
		const propertyFieldValue = p[field as keyof Property];
		const editFieldValue = editValues[p.id]?.[field as keyof (typeof editValues)[number]];

		return {
			isEditing: isCurrentlyEditing,
			value: isCurrentlyEditing ? editFieldValue ?? "" : propertyFieldValue ?? "",
			originalValue: propertyFieldValue ?? "",
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				setEditValues((prev) => ({
					...prev,
					[p.id]: {
						...(prev[p.id] || {}),
						[field]: e.target.value,
					},
				})),
			placeholder: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1"),
		};
	};
	return (
		<TableBody className=''>
			{properties.map((p) => (
				<motion.tr
					layout
					className='hover:bg-muted/50'
					key={p.id}
					transition={{ duration: 0.3 }}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}>
					<TableCell className='font-medium pl-4'>{p.id}</TableCell>

					<TableCell className={cn("font-medium", editMode[p.id] && "pl-2")}>
						<EditableTextCell {...getEditableCellProps(p, "propertyNo")} />
					</TableCell>
					<TableCell className={cn("", editMode[p.id] && "pl-2")}>
						<EditableTextCell {...getEditableCellProps(p, "description")} />
					</TableCell>
					<TableCell className={cn("", editMode[p.id] && "pl-2")}>
						<EditableTextCell {...getEditableCellProps(p, "quantity")} />
					</TableCell>
					<TableCell className={cn("", editMode[p.id] && "pl-2")}>
						<EditableTextCell {...getEditableCellProps(p, "value")} />
					</TableCell>
					<TableCell className={cn("font-medium", editMode[p.id] && "pl-2")}>
						<EditableTextCell {...getEditableCellProps(p, "serialNo")} />
					</TableCell>

					{(userRole === "admin" || userRole === "master_admin" || userRole === "property_custodian") && (
						<TableCell>
							<UserSelectionCell
								userRole={userRole}
								property={p}
								isAssignMode={assignMode[p.id]}
								users={users}
								isUserSelectPopoverOpen={openUserSelect[p.id]}
								onUserSelectPopoverOpenChange={(isOpen) => setOpenUserSelect((prev) => ({ ...prev, [p.id]: isOpen }))}
								selectedUserIdInPopover={selectedUser[p.id]}
								onSelectUserInPopover={(userId) => setSelectedUser((prev) => ({ ...prev, [p.id]: userId }))}
								onSetAssignMode={() => setAssignMode((prev) => ({ ...prev, [p.id]: true }))}
								isReassignDialogOpen={openDialog === p.id}
								onReassignDialogClose={() => setOpenDialog(null)}
								pendingReassignForDialog={pendingReassign}
								onReassignDialogConfirm={() => {
									if (pendingReassign && pendingReassign.propertyId === p.id) {
										setSelectedUser((prev) => ({ ...prev, [p.id]: pendingReassign.newUserId }));
										handleAssign(p.id, true);
										setPendingReassign(null);
									}
									setOpenDialog(null);
								}}
								onReassignDialogCancel={() => {
									setPendingReassign(null);
									setOpenDialog(null);
								}}
							/>
						</TableCell>
					)}
					{/* Department Cell - Conditional rendering based on role */}
					{(userRole === "admin" || userRole === "master_admin") && (
						<TableCell>
							{p.assignedDepartment ? (
								<Badge variant={"outline"} className='font-normal py-1 px-4 rounded-3xl bg-blue-100 text-blue-800 border-transparent'>
									{p.assignedDepartment}
								</Badge>
							) : (
								""
							)}
						</TableCell>
					)}

					{/* Location Cell - Only for property_custodian */}
					{userRole === "property_custodian" && (
						<TableCell>
							<LocationSelectionCell
								propertyId={p.id}
								currentLocation={p.location_detail}
								allAvailableLocations={allAvailableLocations}
								onUpdateLocation={handleLocationUpdate}
							/>
						</TableCell>
					)}

					{/* Actions Cell - Conditional rendering based on role */}
					{(userRole === "admin" ||
						userRole === "master_admin" ||
						userRole === "property_custodian" ||
						userRole === "developer") && (
						<PropertyTableActionsCell
							isSendingToDisplay={isSendingToDisplay}
							property={p}
							users={users}
							userRole={userRole}
							editMode={editMode}
							setEditMode={setEditMode}
							editValues={editValues[p.id]}
							setEditValues={(newValues) => setEditValues((prev) => ({ ...prev, [p.id]: newValues }))}
							assignMode={assignMode}
							setAssignMode={setAssignMode}
							selectedUser={selectedUser}
							setSelectedUser={setSelectedUser}
							handleSaveEdit={() => handleSaveEdit(p.id, editValues[p.id] || {})}
							handleDelete={() => handleDelete(p.id, false)}
							handleAssign={() => handleAssign(p.id)}
							handleCreatePrintJob={() => handleCreatePrintJob(p.id)}
							handleDisplayData={() => handleDisplayData(p.id)}
							deleteLoading={isDeleting}
							isUpdating={isUpdating}
							isAssigning={isAssigning}
							isCreatingPrintJob={isCreatingPrintJob}
						/>
					)}
					{/* Render empty cell for staff for actions to maintain column alignment if "Actions" column header is present */}
				</motion.tr>
			))}
			<PropertyTableAddRow
				addMode={addMode}
				newProperty={newProperty}
				setNewProperty={setNewProperty}
				addLoading={isAdding}
				handleSaveNewProperty={handleSaveNewProperty}
				setAddMode={setAddMode}
				addRowRef={addRowRef}
			/>
		</TableBody>
	);
}
