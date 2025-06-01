"use client";
import { AnimatePresence, motion } from "framer-motion";
import { TableBody, TableCell } from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Property, User } from "@/types";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useEffect, Dispatch, SetStateAction, RefObject } from "react";
import { Badge } from "@/components/ui/badge";
import PropertyTableActionsCell from "./PropertyTableActionsCell";
import PropertyTableAddRow from "./PropertyTableAddRow";

export interface PropertyTableBodyProps {
	properties: Property[];
	users: User[];
	userRole: string | undefined;
	token: string | null;
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
		[propertyId: number]: { propertyNo: string; description: string; quantity: string; value: string; serialNo: string };
	};
	setEditValues: Dispatch<
		SetStateAction<{
			[propertyId: number]: { propertyNo: string; description: string; quantity: string; value: string; serialNo: string };
		}>
	>;

	handleAssign: (propertyId: number, overrideConfirm?: boolean) => Promise<void>;
	handleSaveEdit: (propertyId: number) => Promise<void>;
	handleDelete: (propertyId: number, confirmed: boolean) => Promise<void>;

	addRowRef: RefObject<HTMLTableRowElement | null>;
}

export default function PropertyTableBody({
	properties,
	users,
	userRole,
	token,
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
}: PropertyTableBodyProps) {
	useEffect(() => {
		if (addMode && addRowRef.current) {
			addRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [addMode, addRowRef]);

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
							{" "}
							{editMode[p.id] ? (
								<input
									value={editValues[p.id]?.propertyNo || ""}
									onChange={(e) =>
										setEditValues((prev) => ({
											...prev,
											[p.id]: { ...prev[p.id], propertyNo: e.target.value },
										}))
									}
									className='p-2 border rounded w-full'
								/>
							) : (
								p.propertyNo
							)}
						</TableCell>
						<TableCell className={cn("", editMode[p.id] && "pl-2")}>
							{editMode[p.id] ? (
								<input
									value={editValues[p.id]?.description || ""}
									onChange={(e) =>
										setEditValues((prev) => ({
											...prev,
											[p.id]: { ...prev[p.id], description: e.target.value },
										}))
									}
									className='p-2 border rounded w-full'
								/>
							) : (
								p.description
							)}
						</TableCell>
						<TableCell className={cn("font-medium", editMode[p.id] && "pl-2")}>
							{" "}
							{editMode[p.id] ? (
								<input
									value={editValues[p.id]?.quantity || ""}
									onChange={(e) =>
										setEditValues((prev) => ({
											...prev,
											[p.id]: { ...prev[p.id], quantity: e.target.value },
										}))
									}
									className='p-2 border rounded w-full'
								/>
							) : (
								p.quantity
							)}
						</TableCell>
						<TableCell className={cn("font-medium", editMode[p.id] && "pl-2")}>
							{" "}
							{editMode[p.id] ? (
								<input
									value={editValues[p.id]?.value || ""}
									onChange={(e) =>
										setEditValues((prev) => ({
											...prev,
											[p.id]: { ...prev[p.id], value: e.target.value },
										}))
									}
									className='p-2 border rounded w-full'
								/>
							) : (
								p.value
							)}
						</TableCell>
						<TableCell className={cn("font-medium", editMode[p.id] && "pl-2")}>
							{" "}
							{editMode[p.id] ? (
								<input
									value={editValues[p.id]?.serialNo || ""}
									onChange={(e) =>
										setEditValues((prev) => ({
											...prev,
											[p.id]: { ...prev[p.id], serialNo: e.target.value },
										}))
									}
									className='p-2 border rounded w-full'
								/>
							) : (
								p.serialNo
							)}
						</TableCell>
						<TableCell>
							{userRole != "staff" && (
								<div className='max-w-[300px]'>
									{assignMode[p.id] ? (
										<div className='flex gap-2 items-center'>
											<Popover
												open={openUserSelect[p.id]}
												onOpenChange={(isOpen) => setOpenUserSelect((prev) => ({ ...prev, [p.id]: isOpen }))}>
												<PopoverTrigger asChild>
													<Button
														variant={"outline"}
														role='combobox'
														className={cn("w-[180px] justify-between", !selectedUser[p.id] && "text-gray-500")}>
														{selectedUser[p.id] ? users.find((u) => u.id === Number(selectedUser[p.id]))?.name : "Select Staff"}
														<ChevronsUpDown className='opacity-50' />
													</Button>
												</PopoverTrigger>
												<PopoverContent className='w-[180px] p-0'>
													<Command>
														<CommandInput placeholder='Search for staff...' />
														<CommandEmpty>No staff found.</CommandEmpty>
														<CommandGroup>
															{users.map((u) => (
																<CommandItem
																	key={u.id}
																	value={u.name}
																	onSelect={() => {
																		setSelectedUser((prev) => ({ ...prev, [p.id]: String(u.id) }));
																		setOpenUserSelect((prev) => ({ ...prev, [p.id]: false }));
																	}}
																	className='cursor-pointer'>
																	{u.name}
																	<Check className={cn("ml-auto text-[#800000]", selectedUser[p.id] === String(u.id) ? "opacity-100" : "opacity-0")} />
																</CommandItem>
															))}
														</CommandGroup>
													</Command>
												</PopoverContent>
											</Popover>
											<Dialog open={openDialog === p.id} onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}>
												<DialogContent className='xl:max-w-md'>
													<DialogHeader>
														<DialogTitle>Reassign Property</DialogTitle>
														<DialogDescription>
															This property is currently assigned to <strong>{p.assignedTo}</strong>. Do you want to reassign it?
														</DialogDescription>
													</DialogHeader>
													<DialogFooter className='mt-4'>
														<Button
															onClick={() => {
																if (pendingReassign) {
																	// Apply selection
																	setSelectedUser((prev) => ({
																		...prev,
																		[pendingReassign.propertyId]: pendingReassign.newUserId,
																	}));
																	handleAssign(pendingReassign.propertyId, true);
																	setPendingReassign(null);
																}
																setOpenDialog(null);
															}}
															className='bg-green-600 hover:bg-green-700 text-white'>
															Confirm
														</Button>
														<Button
															variant='outline'
															onClick={() => {
																setPendingReassign(null);
																setOpenDialog(null);
															}}>
															Cancel
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>
									) : p.assignedTo ? (
										<>
											<Badge variant='outline' className='font-normal text-muted-foreground py-1 px-4 rounded-3xl'>
												{p.assignedTo}{" "}
											</Badge>
											{p.reassignmentStatus === "pending" && (
												<Badge variant='outline' className='ml-2 border-yellow-500 text-yellow-600'>
													Pending
												</Badge>
											)}
										</>
									) : (
										<Button
											className='cursor-pointer px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
											variant='outline'
											size='sm'
											onClick={() =>
												setAssignMode((prev) => ({
													...prev,
													[p.id]: true,
												}))
											}>
											Assign
										</Button>
									)}
								</div>
							)}
						</TableCell>
						{userRole != "staff" && userRole != "property_custodian" ? (
							<TableCell>
								{p.assignedDepartment ? (
									<Badge variant={"outline"} className='font-normal py-1 px-4 rounded-3xl bg-blue-100 text-blue-800 border-transparent'>
										{p.assignedDepartment}
									</Badge>
								) : (
									""
								)}
							</TableCell>
						) : (
							""
						)}
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
						/>
					</motion.tr>
				))}
				<PropertyTableAddRow
					addMode={addMode}
					newProperty={newProperty}
					setNewProperty={setNewProperty}
					addLoading={addLoading}
					setAddLoading={setAddLoading}
					setAddMode={setAddMode}
					token={token}
					fetchProperties={fetchProperties}
					addRowRef={addRowRef}
				/>
			</AnimatePresence>
		</TableBody>
	);
}
