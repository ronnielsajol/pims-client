"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatePresence, motion } from "motion/react";

const PropertyCustodiansPage = () => {
	const { token, user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [addMode, setAddMode] = useState(false);

	const addRowRef = useRef<HTMLTableRowElement>(null);

	useEffect(() => {
		if (!token) return;
		if (user?.role === "staff") return;
		apiFetch<{ success: boolean; data: User[] }>("/users?roles=property_custodian", "GET", undefined, token ?? "")
			.then((res) => {
				setUsers(res.data);
			})
			.catch((err) => console.log(err.message));
	}, [token]);

	return (
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className='flex justify-between w-full'>
					<h2 className='text-2xl font-bold mb-4'>All Property Custodian</h2>
					<Button
						className='bg-green-600 cursor-pointer hover:bg-green-500'
						onClick={() => {
							setAddMode(true);
							if (addRowRef.current) {
								addRowRef.current.scrollIntoView({ behavior: "smooth" });
							}
						}}
						disabled={addMode}>
						<PlusCircle className='mr-1 h-4 w-4' />
						Create New Account
					</Button>
				</div>
				<div className='rounded border shadow-md'>
					<Table>
						<TableHeader>
							<TableRow className='bg-muted/50 '>
								<TableHead className='w-[50px] text-muted-foreground'>ID</TableHead>
								<TableHead className='w-3/12 text-muted-foreground'>Name</TableHead>
								<TableHead className='w-3/12 text-muted-foreground'>Email</TableHead>
								<TableHead className='w-3/12 text-muted-foreground'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className=''>
							<AnimatePresence>
								{users.map((u) => (
									<motion.tr
										className='hover:bg-muted/50'
										key={u.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.3 }}>
										<TableCell className='font-medium pl-4'>{u.id}</TableCell>
										<TableCell className='font-medium'>{u.name}</TableCell>
										<TableCell className=''>{u.email}</TableCell>
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
										<TableCell></TableCell>
										<TableCell className='font-medium'>New</TableCell>
										<TableCell className=''>New</TableCell>
									</motion.tr>
								)}
							</AnimatePresence>
						</TableBody>
					</Table>
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default PropertyCustodiansPage;
