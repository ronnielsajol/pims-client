// components/property-table/PropertyTableBody.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
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
	fetchProperties: () => Promise<void>;
	addMode: boolean;
	setAddMode: Dispatch<SetStateAction<boolean>>;

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
	addLoading: boolean;
	setAddLoading: Dispatch<SetStateAction<boolean>>;
	deleteLoading: boolean;
	editMode: { [propertyId: number]: boolean };
	setEditMode: Dispatch<SetStateAction<{ [propertyId: number]: boolean }>>;
	editValues: {
		[propertyId: number]: {
			propertyNo: string;
			description: string;
			quantity: string;
			value: string;
			serialNo: string;
			location_detail?: string;
		};
	};
	setEditValues: Dispatch<
		SetStateAction<{
			[propertyId: number]: {
				propertyNo: string;
				description: string;
				quantity: string;
				value: string;
				serialNo: string;
				location_detail?: string;
			};
		}>
	>;
	handleAssign: (propertyId: number, overrideConfirm?: boolean) => Promise<void>;
	handleSaveEdit: (propertyId: number) => Promise<void>;
	handleDelete: (propertyId: number, confirmed: boolean) => Promise<void>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	allAvailableLocations: string[];
	handleLocationUpdate: (propertyId: number, newLocation: string) => Promise<void>;
	handleCreatePrintJob: (propertyId: number) => Promise<void>;
	printingId: number | null;
}

export default function PropertyTableBody({
	properties,
	users,
	userRole,
	fetchProperties,
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
	addLoading,
	setAddLoading,
	deleteLoading,
	editMode,
	setEditMode,
	editValues,
	setEditValues,
	handleAssign,
	handleSaveEdit,
	handleDelete,
	addRowRef,
	allAvailableLocations,
	handleLocationUpdate,
	handleCreatePrintJob,
	printingId,
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
		<TableBody className='transition-[height] duration-700 ease-out'>
			<AnimatePresence>
				{properties.map((p) => (
					<motion.tr
						className='hover:bg-muted/50'
						key={p.id}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}>
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

						{/* Assigned To Cell - Conditional rendering based on role */}
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
						{(userRole === "admin" || userRole === "master_admin" || userRole === "property_custodian") && (
							<PropertyTableActionsCell
								property={p}
								users={users}
								userRole={userRole}
								deleteLoading={deleteLoading}
								editMode={editMode}
								setEditMode={setEditMode}
								editValues={editValues}
								setEditValues={setEditValues}
								assignMode={assignMode}
								setAssignMode={setAssignMode}
								selectedUser={selectedUser}
								setSelectedUser={setSelectedUser}
								handleSaveEdit={handleSaveEdit}
								handleDelete={handleDelete}
								handleAssign={handleAssign}
								handleCreatePrintJob={handleCreatePrintJob}
								printingId={printingId}
							/>
						)}
						{/* Render empty cell for staff for actions to maintain column alignment if "Actions" column header is present */}
					</motion.tr>
				))}
				<PropertyTableAddRow
					addMode={addMode}
					newProperty={newProperty}
					setNewProperty={setNewProperty}
					addLoading={addLoading}
					setAddLoading={setAddLoading}
					setAddMode={setAddMode}
					fetchProperties={fetchProperties}
					addRowRef={addRowRef}
				/>
			</AnimatePresence>
		</TableBody>
	);
}
