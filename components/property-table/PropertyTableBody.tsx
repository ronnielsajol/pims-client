"use client";
import { AnimatePresence, motion } from "framer-motion";
import { TableBody, TableCell } from "@/components/ui/table";
import {
	Dialog,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Property, User } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Check, ChevronsUpDown, LoaderCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useEffect, Dispatch, SetStateAction, RefObject } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

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
						<TableCell className='p-0 py-2'>
							<div className='relative w-20 h-20'>
								{p.qrCode && (
									<Image
										src={p.qrCode}
										alt='QR'
										fill
										className={cn("object-contain transition-opacity duration-200 ease-out", editMode[p.id] && " opacity-40")}
									/>
								)}
							</div>
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
										<Badge variant='outline' className='font-normal text-muted-foreground py-1 px-4 rounded-3xl-'>
											{p.assignedTo}{" "}
										</Badge>
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

						{(userRole === "admin" || userRole === "master_admin") && (
							<TableCell className='pr-4'>
								<div className='h-full flex gap-2 items-center justify-end'>
									{editMode[p.id] ? (
										<>
											<Button
												variant='outline'
												className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
												onClick={() => handleSaveEdit(p.id)}>
												Save
											</Button>
											<Button
												variant='outline'
												className='border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'
												onClick={() => setEditMode((prev) => ({ ...prev, [p.id]: false }))}>
												Cancel
											</Button>
										</>
									) : (
										<>
											{assignMode[p.id] ? (
												<>
													<Button
														className='border-green-200 bg-transparent text-green-500 hover:text-green-700 hover:bg-green-100 border-2 cursor-pointer transition-colors duration-200 ease-out'
														onClick={() => handleAssign(p.id)}>
														<Check strokeWidth={3} />
													</Button>
													<Button
														className='border-red-200 bg-transparent text-red-500 hover:text-red-700 hover:bg-red-100 border-2 cursor-pointer transition-colors duration-300 ease-out'
														onClick={() =>
															setAssignMode((prev) => ({
																...prev,
																[p.id]: false,
															}))
														}>
														<X strokeWidth={3} />
													</Button>
												</>
											) : (
												<>
													{p.assignedTo && (
														<Button
															variant='outline'
															onClick={() => {
																setSelectedUser((prev) => ({
																	...prev,
																	[p.id]: String(users.find((u) => u.name === p.assignedTo)?.id ?? ""),
																}));
																setAssignMode((prev) => ({ ...prev, [p.id]: true }));
															}}
															className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
															Reassign
														</Button>
													)}
													<Button
														variant='outline'
														onClick={() => {
															setEditValues((prev) => ({
																...prev,
																[p.id]: {
																	propertyNo: p.propertyNo,
																	description: p.description,
																	quantity: p.quantity,
																	value: p.value,
																	serialNo: p.serialNo,
																},
															}));
															setEditMode((prev) => ({ ...prev, [p.id]: true }));
														}}
														className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
														Edit
													</Button>
													<Dialog>
														<DialogTrigger asChild>
															<Button variant='outline' className='border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'>
																Delete
															</Button>
														</DialogTrigger>
														<DialogContent className='xl:max-w-md'>
															<DialogHeader>
																<DialogTitle>Are you sure?</DialogTitle>
																<DialogDescription>
																	{p?.assignedTo
																		? "This property is currently assigned. Do you still want to delete it?"
																		: "Do you want to delete this property?"}
																</DialogDescription>
															</DialogHeader>
															<DialogFooter>
																<DialogClose asChild>
																	<Button variant='outline' className='cursor-pointer'>
																		Cancel
																	</Button>
																</DialogClose>
																<Button variant='destructive' className='cursor-pointer' onClick={() => handleDelete(p.id, true)}>
																	{deleteLoading ? <LoaderCircle className='animate-spin h-5 w-5 mx-auto' /> : "Confirm"}
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>
												</>
											)}
										</>
									)}
								</div>
							</TableCell>
						)}
						{userRole === "property_custodian" && (
							<TableCell className='pr-4'>
								<div className='h-full flex gap-2 items-center justify-end'>
									{assignMode[p.id] ? (
										// Render confirmation and cancel buttons when in assign mode
										<>
											<Button
												className='border-green-200 bg-transparent text-green-500 hover:text-green-700 hover:bg-green-100 border-2 cursor-pointer transition-colors duration-200 ease-out'
												onClick={() => handleAssign(p.id)}>
												<Check strokeWidth={3} />
											</Button>
											<Button
												className='border-red-200 bg-transparent text-red-500 hover:text-red-700 hover:bg-red-100 border-2 cursor-pointer transition-colors duration-300 ease-out'
												onClick={() =>
													setAssignMode((prev) => ({
														...prev,
														[p.id]: false,
													}))
												}>
												<X strokeWidth={3} />
											</Button>
										</>
									) : (
										// Render the "Reassign" button only if the property has an assignee
										<>
											{p.assignedTo && (
												<Button
													variant='outline'
													onClick={() => {
														setSelectedUser((prev) => ({
															...prev,
															[p.id]: String(users.find((u) => u.name === p.assignedTo)?.id ?? ""),
														}));
														setAssignMode((prev) => ({ ...prev, [p.id]: true }));
													}}
													className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'>
													Reassign
												</Button>
											)}
										</>
									)}
								</div>
							</TableCell>
						)}
					</motion.tr>
				))}
				{addMode && (
					<motion.tr
						ref={addRowRef}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 10 }}
						transition={{ duration: 0.3 }}>
						<TableCell>-</TableCell>
						<TableCell>
							<input
								type='text'
								value={newProperty.propertyNo}
								onChange={(e) => setNewProperty((prev) => ({ ...prev, propertyNo: e.target.value }))}
								className='p-2 h-8 border rounded w-full'
								placeholder='Property name'
							/>
						</TableCell>
						<TableCell>
							<textarea
								value={newProperty.description}
								onChange={(e) => setNewProperty((prev) => ({ ...prev, description: e.target.value }))}
								className='p-2 h-8 border rounded w-full'
								placeholder='Description'
							/>
						</TableCell>
						<TableCell>
							<input
								type='text'
								value={newProperty.quantity}
								onChange={(e) => setNewProperty((prev) => ({ ...prev, quantity: e.target.value }))}
								className='p-2 h-8 border rounded w-full'
								placeholder='Quantity'
							/>
						</TableCell>
						<TableCell>
							<input
								type='text'
								value={newProperty.value}
								onChange={(e) => setNewProperty((prev) => ({ ...prev, value: e.target.value }))}
								className='p-2 h-8 border rounded w-full'
								placeholder='Value'
							/>
						</TableCell>
						<TableCell>
							<input
								type='text'
								value={newProperty.serialNo}
								onChange={(e) => setNewProperty((prev) => ({ ...prev, serialNo: e.target.value }))}
								className='p-2 h-8 border rounded w-full'
								placeholder='Serial Number'
							/>
						</TableCell>
						<TableCell colSpan={3}>
							<div className='flex gap-2'>
								<Button
									className='bg-green-600 text-white hover:bg-green-700	'
									disabled={addLoading}
									onClick={async () => {
										setAddLoading(true);
										try {
											await apiFetch("/properties/add", "POST", { property: newProperty }, token ?? "");
											toast.success("Property added!");
											setNewProperty({ propertyNo: "", description: "", quantity: "", value: "", serialNo: "" });
											setAddMode(false);
											fetchProperties();
										} catch (err) {
											toast.error("Failed to add property");
											console.error("Add error:", err);
										} finally {
											setAddLoading(false);
										}
									}}>
									{addLoading ? "Adding..." : "Save"}
								</Button>
								<Button variant='outline' onClick={() => setAddMode(false)}>
									Cancel
								</Button>
							</div>
						</TableCell>
					</motion.tr>
				)}
			</AnimatePresence>
		</TableBody>
	);
}
