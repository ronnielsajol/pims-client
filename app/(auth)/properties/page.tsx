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

export default function PropertiesPage() {
	const { token, user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<{ [propertyId: number]: string }>({});
	const [assignMode, setAssignMode] = useState<{ [propertyId: number]: boolean }>({});
	const router = useRouter();

	useEffect(() => {
		if (!token || !user) return;

		if (user.role === "staff") {
			apiFetch<{ success: boolean; message: string; data: Property[] }>(`/properties/${user.id}`, "GET", undefined, token)
				.then((res) => setProperties(res.data))
				.catch((err) => console.error(err.message));
		} else {
			apiFetch<{ success: boolean; data: Property[] }>("/properties/all?includeAssignments=true", "GET", undefined, token)
				.then((res) => setProperties(res.data))
				.catch((err) => console.error(err.message));

			apiFetch<{ success: boolean; data: User[] }>("/users/staff", "GET", undefined, token)
				.then((res) => setUsers(res.data))
				.catch((err) => console.error(err.message));
		}
	}, [token, user]);

	const handleAssign = async (propertyId: number) => {
		const userId = selectedUser[propertyId];
		if (!userId) return alert("Please select a user");

		try {
			await apiFetch("/properties/assign", "POST", { userId, propertyId }, token ?? "");
			alert("Property assigned!");
		} catch (err) {
			console.error("Assign error:", err);
			alert("Failed to assign property");
		}
	};

	return (
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className={cn("flex w-full", user?.role === "staff" ? "justify-start" : "justify-between")}>
					<h2 className='text-2xl font-bold mb-4'>All Properties</h2>
					{(user?.role === "admin" || user?.role === "master_admin") && (
						<Button
							className='bg-green-600 cursor-pointer hover:bg-green-500'
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
							<TableHead>QR Code</TableHead>
							<TableHead>Assign To</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{properties.map((p) => (
							<TableRow key={p.id}>
								<TableCell className='font-medium '>{p.id}</TableCell>
								<TableCell className='font-medium'>{p.name}</TableCell>
								<TableCell className=''>{p.description}</TableCell>
								<TableCell className=''>
									{" "}
									{p.qrCode && <Image src={p.qrCode} alt='QR' className='w-24 h-24 mt-2' width={100} height={100} />}
								</TableCell>
								<TableCell>
									{(user?.role === "admin" || user?.role === "master_admin") && (
										<div>
											{p.assignedTo ? (
												<p className='text-sm text-muted-foreground'>{p.assignedTo}</p>
											) : assignMode[p.id] ? (
												<div className='flex gap-2 items-center'>
													<select
														className='p-2 border rounded'
														value={selectedUser[p.id] || ""}
														onChange={(e) => setSelectedUser((prev) => ({ ...prev, [p.id]: e.target.value }))}>
														<option value=''>Select Staff</option>
														{users.map((u) => (
															<option key={u.id} value={u.id}>
																{u.name}
															</option>
														))}
													</select>
													<Button
														className='bg-green-600 group hover:bg-white hover:text-green-600 text-white hover:border-green-600 border-2 cursor-pointer '
														onClick={() => {
															handleAssign(p.id);
															setAssignMode((prev) => ({ ...prev, [p.id]: false }));
														}}>
														<Check className='' strokeWidth={3} />
													</Button>
													<Button
														className='bg-red-600 group hover:bg-white hover:text-red-600 text-white hover:border-red-600 border-2 cursor-pointer '
														onClick={() =>
															setAssignMode((prev) => ({
																...prev,
																[p.id]: false,
															}))
														}>
														<X className='' strokeWidth={3} />
													</Button>
												</div>
											) : (
												<Button
													className='cursor-pointer'
													variant='outline'
													size='sm'
													onClick={() => setAssignMode((prev) => ({ ...prev, [p.id]: true }))}>
													Assign
												</Button>
											)}
										</div>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</ProtectedRoute>
	);
}
