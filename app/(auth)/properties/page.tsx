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
import { Check, X } from "lucide-react";
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

export default function PropertiesPage() {
	const { token, user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<{ [propertyId: number]: string }>({});
	const [assignMode, setAssignMode] = useState<{ [propertyId: number]: boolean }>({});
	const [openDialog, setOpenDialog] = useState<number | null>(null);
	const [pendingReassign, setPendingReassign] = useState<{ propertyId: number; newUserId: string } | null>(null);

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
		}
	};
	return (
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className={cn("flex w-full", user?.role === "staff" ? "justify-start" : "justify-between")}>
					<h2 className='text-2xl font-bold mb-4'>All Properties</h2>
					{(user?.role === "admin" || user?.role === "master_admin") && (
						<Button
							className='bg-green-600 cursor-pointer hover:bg-green-700'
							onClick={() => {
								router.push("/properties/add");
							}}>
							Add Property
						</Button>
					)}
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[50px]'>ID</TableHead>
							<TableHead className='w-3/12'>Name</TableHead>
							<TableHead className='w-3/12'>Description</TableHead>
							<TableHead className='w-[100px]'>QR Code</TableHead>
							{(user?.role === "admin" || user?.role === "master_admin") && (
								<>
									<TableHead className='w-[300px]'>Assigned To</TableHead>
									<TableHead>Actions</TableHead>
								</>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{properties.map((p) => (
							<TableRow key={p.id}>
								<TableCell className='font-medium '>{p.id}</TableCell>
								<TableCell className='font-medium'>{p.name}</TableCell>
								<TableCell className=''>{p.description}</TableCell>
								<TableCell className='p-0 py-2'>
									{" "}
									{p.qrCode && <Image src={p.qrCode} alt='QR' className='w-20 h-20' width={100} height={100} />}
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
														className='bg-green-600 group hover:bg-white hover:text-green-600 text-white hover:border-green-600 border-2 cursor-pointer'
														onClick={() => handleAssign(p.id)}>
														<Check strokeWidth={3} />
													</Button>
													<Button
														className='bg-red-600 group hover:bg-white hover:text-red-600 text-white hover:border-red-600 border-2 cursor-pointer'
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
																			// Proceed to assignment with confirmation override
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
												<div className='flex gap-2 items-center'>
													<p className='text-sm text-muted-foreground'>{p.assignedTo}</p>
													<Button
														variant='ghost'
														onClick={() => {
															setSelectedUser((prev) => ({
																...prev,
																[p.id]: String(users.find((u) => u.name === p.assignedTo)?.id ?? ""),
															}));
															setAssignMode((prev) => ({ ...prev, [p.id]: true }));
														}}
														className='transition-none'>
														Reassign
													</Button>
												</div>
											) : (
												<Button
													className='cursor-pointer'
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
									<TableCell className=''>
										<div className='h-full flex gap-2 items-center'>
											<Button
												variant={"outline"}
												className='border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 cursor-pointer'
												onClick={() => router.push(`/properties/edit/${p.id}`)}>
												Edit{" "}
											</Button>
											<Dialog>
												<DialogTrigger asChild>
													<Button variant='outline' className='border-red-500 text-red-500 hover:text-white hover:bg-red-500 cursor-pointer'>
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
															Confirm
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</ProtectedRoute>
	);
}
