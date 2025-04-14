"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError, Property, User } from "@/types";

const AssignPropertyPage = () => {
	const { token, user } = useAuth();
	const [userId, setUserId] = useState("");
	const [propertyId, setPropertyId] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [properties, setProperties] = useState<Property[]>([]);

	useEffect(() => {
		if (!token) return;

		const fetchUsers = apiFetch<{ success: boolean; users: User[] }>("/users/staff", "GET", undefined, token ?? "")
			.then((res) => {
				setUsers(res.users);
			})
			.catch(console.error);
		const fetchProperties = apiFetch<{ success: boolean; data: Property[] }>(
			"/properties/all",
			"GET",
			undefined,
			token ?? ""
		)
			.then((res) => {
				setProperties(res.data);
			})
			.catch(console.error);

		Promise.all([fetchUsers, fetchProperties]);
	}, [token]);

	const handleAssign = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch("/properties/assign", "POST", { userId, propertyId }, token ?? "");
			alert("Property assigned!");
		} catch (err: unknown) {
			const error = err as ApiError;
			console.error("API Error:", error.message || error.error);
			alert(error.message || "Something went wrong");
		}
	};

	if (user?.role === "staff") {
		return <div className='p-8'>You are not authorized to assign properties.</div>;
	}

	return (
		<ProtectedRoute>
			<div className='p-8 max-w-lg mx-auto'>
				<h2 className='text-2xl font-bold mb-4'>Assign Property to Staff</h2>
				<form onSubmit={handleAssign} className='space-y-4'>
					<select value={userId} onChange={(e) => setUserId(e.target.value)} className='w-full p-2 border rounded'>
						<option value=''>Select Staff</option>
						{users.map((u: User) => (
							<option key={u.id} value={u.id}>
								{u.name} ({u.email})
							</option>
						))}
					</select>

					<select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className='w-full p-2 border rounded'>
						<option value=''>Select Property</option>
						{properties.map((p: Property) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>

					<button className='bg-blue-600 text-white px-4 py-2 rounded w-full'>Assign</button>
				</form>
			</div>
		</ProtectedRoute>
	);
};

export default AssignPropertyPage;
