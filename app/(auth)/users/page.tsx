"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UsersPage = () => {
	const { token, user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const router = useRouter();

	useEffect(() => {
		if (!token) return;
		if (user?.role === "staff") return;
		apiFetch<{ success: boolean; data: User[] }>("/users?roles=staff", "GET", undefined, token ?? "")
			.then((res) => {
				setUsers(res.data);
			})
			.catch((err) => console.log(err.message));
	}, [token]);

	return (
		<ProtectedRoute>
			<div className='max-xl:p-1 laptop:p-5 desktop:p-8 w-full'>
				<div className='flex justify-between w-full'>
					<h2 className='text-2xl font-bold mb-4'>All Staff</h2>
					<Button
						className='bg-green-500 cursor-pointer hover:bg-green-600'
						onClick={() => {
							router.push("/users/add");
						}}>
						<PlusCircle className='mr-1 h-4 w-4' />
						Create New Account
					</Button>
				</div>
				<div className='rounded border shadow-md'>
					<Table>
						<TableHeader>
							<TableRow className='bg-muted/50'>
								<TableHead className='w-[100px] text-muted-foreground'>ID</TableHead>
								<TableHead className='text-muted-foreground'>Name</TableHead>
								<TableHead className='text-muted-foreground'>Email</TableHead>
								<TableHead className='text-muted-foreground'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((u) => (
								<TableRow key={u.id} className='hover:bg-muted/50'>
									<TableCell className='font-medium'>{u.id}</TableCell>
									<TableCell className='font-medium'>{u.name}</TableCell>
									<TableCell className=''>{u.email}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default UsersPage;
