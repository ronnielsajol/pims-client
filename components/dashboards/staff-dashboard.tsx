"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AssignedItem {
	id: number;
	propertyNo: string;
	description: string;
	condition: string | null;
	dateAssigned: string;
}

interface StaffStatsData {
	assignedItemsCount: number;
	assignedItems: AssignedItem[];
}

const getConditionBadge = (condition: string | null) => {
	const safeCondition = condition?.toLowerCase() || "unknown";
	switch (safeCondition) {
		case "excellent":
			return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Excellent</Badge>;
		case "good":
			return <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>Good</Badge>;
		case "fair":
			return <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>Fair</Badge>;
		case "needs repair":
			return <Badge variant='destructive'>Needs Repair</Badge>;
		default:
			return <Badge variant='secondary'>{condition || "N/A"}</Badge>;
	}
};

export default function StaffDashboard() {
	const { user } = useAuth();

	// --- Data Fetching with React Query ---
	const {
		data: stats,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["staffDashboardStats", user?.id],
		queryFn: async () => {
			const response = await apiFetch<{ success: boolean; data: StaffStatsData }>("/dashboard/staff-stats");
			return response.data;
		},
		// Only run this query if the user is logged in and is a staff member
		enabled: !!user && user.role === "staff",
	});

	// --- Loading State: Render Skeletons ---
	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='text-center py-8'>
					<Skeleton className='h-9 w-64 mx-auto mb-2' />
					<Skeleton className='h-6 w-80 mx-auto' />
				</div>
				<div className='flex justify-center'>
					<Skeleton className='h-28 w-full max-w-md' />
				</div>
				<Card>
					<CardHeader>
						<Skeleton className='h-7 w-64' />
						<Skeleton className='h-5 w-96 mt-1' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							<Skeleton className='h-10 w-full' />
							<Skeleton className='h-10 w-full' />
							<Skeleton className='h-10 w-full' />
							<Skeleton className='h-10 w-full' />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// --- Error State ---
	if (error) {
		return <div className='text-red-500 p-8'>Failed to load your dashboard data. Please try refreshing the page.</div>;
	}

	// --- Success State: Render Dashboard with Live Data ---
	return (
		<div className='space-y-6'>
			{/* Welcome Header */}
			<div className='text-center py-8'>
				<h2 className='text-3xl font-bold text-[#800000] mb-2'>Welcome, {user?.name}!</h2>
				<p className='text-gray-600'>Here are the properties currently assigned to you</p>
			</div>

			{/* Assigned Items Card */}
			<div className='flex justify-center'>
				<Card className='w-full max-w-md'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Items Assigned to You</CardTitle>
						<ClipboardList className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.assignedItemsCount || 0}</div>
						<p className='text-xs text-muted-foreground'>Active property assignments</p>
					</CardContent>
				</Card>
			</div>

			{/* Assigned Items Table */}
			<Card>
				<CardHeader>
					<CardTitle>Your Assigned Properties</CardTitle>
					<p className='text-sm text-muted-foreground'>Click on any row to view detailed information about the property</p>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Property No.</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Condition</TableHead>
								<TableHead className='text-right'>Date Assigned</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(stats?.assignedItems || []).map((item) => (
								<TableRow key={item.id} className='hover:bg-muted/50'>
									<TableCell className='font-medium'>{item.propertyNo}</TableCell>
									<TableCell>{item.description}</TableCell>
									<TableCell>{getConditionBadge(item.condition)}</TableCell>
									<TableCell className='text-right'>{format(new Date(item.dateAssigned), "PP")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
