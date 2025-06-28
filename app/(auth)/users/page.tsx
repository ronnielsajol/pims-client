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
import { PageBreadcrumb } from "@/components/PageBreadCrumb";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const UsersPage = () => {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const router = useRouter();

	useEffect(() => {
		if (!user) return;
		if (user?.role === "staff") return;
		apiFetch<{ success: boolean; data: User[] }>("/users?roles=staff", "GET", undefined)
			.then((res) => {
				setUsers(res.data);
			})
			.catch((err) => console.log(err.message));
	}, [user]);

	return (
		<ProtectedRoute>
			<div className='max-xl:p-0.5 laptop:p-5 desktop:p-8 w-full'>
				<div className='flex justify-between w-full max-xl:flex-col max-xl:gap-4 mb-4'>
					<PageBreadcrumb />
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
					<Table className='table-auto'>
						<TableHeader>
							<TableRow className='bg-muted/50'>
								<TableHead className='w-[50px] text-muted-foreground'>ID</TableHead>
								<TableHead className='w-3xs text-muted-foreground'>Name</TableHead>
								<TableHead className='w-3xs text-muted-foreground'>Email</TableHead>
								<TableHead className='w-36 text-muted-foreground text-center'>Department</TableHead>
								<TableHead className='text-muted-foreground text-end'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((u) => (
								<TableRow key={u.id} className='hover:bg-muted/50'>
									<TableCell className='font-medium'>{u.id}</TableCell>
									<TableCell className='font-medium'>{u.name}</TableCell>
									<TableCell className=''>{u.email}</TableCell>
									<TableCell className={cn("text-center", !u.department && "text-black/40 font-medium text-sm ")}>
										{u.department ? (
											<Badge variant={"outline"} className='font-normal py-1 px-4 rounded-3xl bg-blue-100 text-blue-800 border-transparent'>
												{u.department}
											</Badge>
										) : (
											"Unassigned"
										)}
									</TableCell>
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
