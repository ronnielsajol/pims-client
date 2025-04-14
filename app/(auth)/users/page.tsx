"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const UsersPage = () => {
	const { token, user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const router = useRouter();

	useEffect(() => {
		if (!token) return;
		if (user?.role === "staff") return;
		apiFetch<{ success: boolean; data: User[] }>("/users/staff", "GET", undefined, token ?? "")
			.then((res) => {
				setUsers(res.data);
			})
			.catch((err) => console.log(err.message));
	}, [token]);

	return (
		<ProtectedRoute>
			<div className='p-8 w-full'>
				<div className='flex justify-between w-full'>
					<h2 className='text-2xl font-bold mb-4'>All User</h2>
					<Button
						className='bg-green-600 cursor-pointer hover:bg-green-500'
						onClick={() => {
							router.push("/users/add");
						}}>
						Create New User
					</Button>
				</div>
				<ul className='space-y-2'>
					{users.map((u) => (
						<li key={u.id} className='p-4 border rounded'>
							<p className='font-semibold'>{u.name}</p>
							<p>{u.email}</p>
						</li>
					))}
				</ul>
			</div>
		</ProtectedRoute>
	);
};

export default UsersPage;
