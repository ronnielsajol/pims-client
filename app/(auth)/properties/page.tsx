"use client";
import { useEffect, useState } from "react";
import { apiFetch, apiFetchFile } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Property, User } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PropertyTable from "@/components/property-table/PropertyTable";
import { PlusCircle, FileDown } from "lucide-react";

export default function PropertiesPage() {
	const { token, user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [addMode, setAddMode] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

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

	const handleGenerateReport = async () => {
		if (!token) return;
		setIsGenerating(true);
		try {
			// Use the new helper function to fetch the file blob
			const blob = await apiFetchFile("/properties/report", "GET", undefined, token);

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `PIMS_Inventory_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Report generation failed:", error);
			const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
			alert(`Failed to generate report: ${errorMessage}`);
		} finally {
			setIsGenerating(false);
		}
	};

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
			<div className='max-xl:p-0.5 laptop:p-5 desktop:p-8 w-full'>
				<div
					className={cn(
						"flex w-full max-xl:flex-col max-xl:mb-2 max-xl:gap-4",
						user?.role === "staff" ? "justify-start" : "justify-between"
					)}>
					<h2 className='text-2xl font-bold mb-4 max-xl:mb-0 max-xl:text-3xl'>All Properties</h2>
					<div className='flex items-center max-xl:w-full max-xl:justify-stretch gap-2'>
						{(user?.role === "admin" || user?.role === "master_admin" || user?.role === "property_custodian") && (
							<Button
								className='text-muted-foreground max-xl:flex-1 max-xl:w-full max-xl:text-xl max-xl:py-5 '
								variant='outline'
								onClick={handleGenerateReport}
								disabled={isGenerating}>
								<FileDown className='mr-1 h-4 w-4' />
								{isGenerating ? "Generating..." : "Generate Report"}
							</Button>
						)}

						{(user?.role === "admin" || user?.role === "master_admin") && (
							<Button
								className='bg-green-500 cursor-pointer hover:bg-green-600 max-xl:flex-1 max-xl:w-full max-xl:text-xl max-xl:py-5 '
								onClick={() => setAddMode(true)}
								disabled={addMode}>
								<PlusCircle className='mr-1 h-4 w-4' />
								Add Property
							</Button>
						)}
					</div>
				</div>
				<div className='rounded border shadow-md'>
					<PropertyTable state={propertyTableState} />
				</div>
			</div>
		</ProtectedRoute>
	);
}
