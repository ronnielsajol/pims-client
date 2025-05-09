"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Property, User } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Check, LoaderCircle, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";

export default function PropertiesPage() {
	const { token, user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<{ [propertyId: number]: string }>({});
	const [assignMode, setAssignMode] = useState<{ [propertyId: number]: boolean }>({});
	const [openDialog, setOpenDialog] = useState<number | null>(null);
	const [pendingReassign, setPendingReassign] = useState<{ propertyId: number; newUserId: string } | null>(null);
	const [addMode, setAddMode] = useState(false);
	const [newProperty, setNewProperty] = useState({ name: "", description: "" });
	const [addLoading, setAddLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const router = useRouter();

	const fetchProperties = async () => {
		if (!token || !user) return;

		try {
			if (user.role === "staff") {
				const res = await apiFetch<{ success: boolean; message: string; data: Property[] }>(
					`/properties/staff/${user.id}`,
					"GET",
					undefined,
					token
				);
				setProperties(res.data);
			} else {
				const propsRes = await apiFetch<{ success: boolean; data: Property[] }>(
					"/properties/all?includeAssignments=true",
					"GET",
					undefined,
					token
				);
				setProperties(propsRes.data);

				const usersRes = await apiFetch<{ success: boolean; data: User[] }>("/users/staff", "GET", undefined, token);
				setUsers(usersRes.data);
			}
		} catch (error) {
			console.error("Failed to fetch properties or users:", error);
		}
	};

	useEffect(() => {
		fetchProperties();
	}, [token, user]);

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
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className={cn("flex w-full", user?.role === "staff" ? "justify-start" : "justify-between")}>
					<h2 className='text-2xl font-bold mb-4'>All Properties</h2>
					{(user?.role === "admin" || user?.role === "master_admin") && (
						<Button className='bg-green-500 cursor-pointer hover:bg-green-600' onClick={() => setAddMode(true)} disabled={addMode}>
							<PlusCircle className='mr-1 h-4 w-4' />
							Add Property
						</Button>
					)}
				</div>
				<div className='rounded border shadow-md'>
					<Table className='overflow-hidden '>
						<TableHeader>
							<TableRow className='bg-muted/50 '>
								<TableHead className='w-[50px] text-muted-foreground'>ID</TableHead>
								<TableHead className='w-3/12 text-muted-foreground'>Product Name</TableHead>
								<TableHead className='w-3/12 text-muted-foreground'>Description</TableHead>
								<TableHead className='w-[100px] text-muted-foreground'>QR Code</TableHead>
								{(user?.role === "admin" || user?.role === "master_admin") && (
									<>
										<TableHead className='w-[400px] text-muted-foreground'>Assigned To</TableHead>
										<TableHead className='text-right pr-4 text-muted-foreground'>Actions</TableHead>
									</>
								)}
							</TableRow>
						</TableHeader>
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
										<TableCell className='font-medium'>{p.name}</TableCell>
										<TableCell className=''>{p.description}</TableCell>
										<TableCell className='p-0 py-2'>
											<div className='relative w-20 h-20'>
												{p.qrCode && <Image src={p.qrCode} alt='QR' fill className='object-contain' />}
											</div>
										</TableCell>
										<TableCell>
											{(user?.role === "admin" || user?.role === "master_admin") && (
												<div className='max-w-[300px]'>
													{assignMode[p.id] ? (
														<div className='flex gap-2 items-center'>
															<select
																className='p-2 border rounded'
																value={selectedUser[p.id] || ""}
																onChange={(e) => {
																	const newUserId = e.target.value;
																	setSelectedUser((prev) => ({ ...prev, [p.id]: newUserId }));
																}}>
																<option value=''>Select Staff</option>
																{users.map((u) => (
																	<option key={u.id} value={u.id}>
																		{u.name}
																	</option>
																))}
															</select>
															<Button
																className='bg-green-600 hover:bg-white hover:text-green-600 text-white hover:border-green-600 border-2 cursor-pointer'
																onClick={() => handleAssign(p.id)}>
																<Check strokeWidth={3} />
															</Button>
															<Button
																className='bg-red-600 hover:bg-white hover:text-red-600 text-white hover:border-red-600 border-2 cursor-pointer'
																onClick={() =>
																	setAssignMode((prev) => ({
																		...prev,
																		[p.id]: false,
																	}))
																}>
																<X strokeWidth={3} />
															</Button>

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

										{(user?.role === "admin" || user?.role === "master_admin") && (
											<TableCell className='pr-4'>
												<div className='h-full flex gap-2 items-center'>
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
													<Button
														variant={"outline"}
														className='border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
														onClick={() => router.push(`/properties/edit/${p.id}`)}>
														Edit{" "}
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
												</div>
											</TableCell>
										)}
									</motion.tr>
								))}
								{addMode && (
									<motion.tr
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										transition={{ duration: 0.3 }}>
										<TableCell>-</TableCell>
										<TableCell>
											<input
												type='text'
												value={newProperty.name}
												onChange={(e) => setNewProperty((prev) => ({ ...prev, name: e.target.value }))}
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
										<TableCell colSpan={3}>
											<div className='flex gap-2'>
												<Button
													className='bg-green-600 text-white'
													disabled={addLoading}
													onClick={async () => {
														setAddLoading(true);
														try {
															await apiFetch("/properties/add", "POST", newProperty, token ?? "");
															toast.success("Property added!");
															setNewProperty({ name: "", description: "" });
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
					</Table>
				</div>
			</div>
		</ProtectedRoute>
	);
}
