"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Property, User } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PropertyTable from "@/components/property-table/PropertyTable";
import { PlusCircle } from "lucide-react";

export default function PropertiesPage() {
	const { token, user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [addMode, setAddMode] = useState(false);

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

	const propertyTableState = {
		token,
		user,
		properties,
		users,
		addMode,
		setAddMode,
		fetchProperties,
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
					<PropertyTable state={propertyTableState} />
				</div>
			</div>
		</ProtectedRoute>
	);
}
