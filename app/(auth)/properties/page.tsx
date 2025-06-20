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
			// Fetch assigned properties
			const propsRes = await apiFetch<{ success: boolean; data: Property[] }>(
				"/properties?includeAssignments=true",
				"GET",
				undefined,
				token
			);
			setProperties(propsRes.data);

			// Fetch users depending on role
			if (user.role === "property_custodian") {
				// Custodian sees staff
				const usersRes = await apiFetch<{ success: boolean; data: User[] }>("/users?roles=staff", "GET", undefined, token);
				setUsers(usersRes.data);
			} else if (user.role === "admin" || user.role === "master_admin") {
				// Admins see custodians
				const usersRes = await apiFetch<{ success: boolean; data: User[] }>(
					"/users?roles=property_custodian",
					"GET",
					undefined,
					token
				);
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
			<div className='max-xl:p-1 laptop:p-5 desktop:p-8 w-full'>
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
