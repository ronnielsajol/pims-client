"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Wallet, Users2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Define the shape of the data returned by the API
interface RecentProperty {
	id: number;
	propertyNo: string;
	description: string;
	delegatedTo: string | null;
	lastUpdated: string;
}

interface CustodianStatsData {
	propertiesInDepartment: number;
	valueOfAssets: number;
	staffInDepartment: number;
	recentProperties: RecentProperty[];
}

export default function CustodianDashboard() {
	const { user } = useAuth();

	const {
		data: stats,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["custodianDashboardStats", user?.id],
		queryFn: async () => {
			const response = await apiFetch<{ success: boolean; data: CustodianStatsData }>("/dashboard/custodian-stats");
			return response.data;
		},
		enabled: !!user && user.role === "property_custodian",
	});

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<Skeleton className='h-28' />
					<Skeleton className='h-28' />
					<Skeleton className='h-28' />
				</div>
				<Skeleton className='h-80' />
			</div>
		);
	}

	if (error) {
		return <div className='text-red-500 p-8'>Failed to load dashboard data. Please try again later.</div>;
	}

	return (
		<div className='space-y-6'>
			{/* Statistics Cards */}
			<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Properties in My Department</CardTitle>
						<Building className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.propertiesInDepartment || 0}</div>
						<p className='text-xs text-muted-foreground'>{user?.department} Department</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Value of My Assets</CardTitle>
						<Wallet className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(stats?.valueOfAssets || 0)}
						</div>
						<p className='text-xs text-muted-foreground'>Total asset value under management</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Staff in My Department</CardTitle>
						<Users2 className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.staffInDepartment || 0}</div>
						<p className='text-xs text-muted-foreground'>Active staff members</p>
					</CardContent>
				</Card>
			</div>

			{/* Properties Table */}
			<Card>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div>
						<CardTitle>Recently Updated Properties</CardTitle>
						<p className='text-sm text-muted-foreground mt-1'>Latest property updates in your department</p>
					</div>
					<Button asChild>
						<Link href='/properties'>View All Properties</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Property No.</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Delegated To</TableHead>
								<TableHead className='text-right'>Last Updated</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(stats?.recentProperties || []).map((property) => (
								<TableRow key={property.id} className='hover:bg-muted/50'>
									<TableCell className='font-medium'>{property.propertyNo}</TableCell>
									<TableCell>{property.description}</TableCell>
									<TableCell>{property.delegatedTo || "Unassigned"}</TableCell>
									<TableCell className='text-right'>{format(new Date(property.lastUpdated), "PP")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
