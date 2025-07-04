"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Users, CheckCheck } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	Pie,
	PieChart,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Define the shape of the data returned by our API endpoint
interface RecentActivity {
	type: string;
	description: string;
	userName: string;
	timestamp: string;
}

interface AdminStatsData {
	totalProperties: number;
	totalAssetValue: number;
	totalUsers: number;
	pendingApprovals: number;
	propertiesByDepartment: { department: string; count: number }[];
	assetsByCategory: { category: string; count: number }[];
	recentActivity: RecentActivity[];
}

// Define colors for the pie chart slices
const PIE_CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981"];

// Define the chart configuration for recharts
const chartConfig = {
	properties: {
		label: "Properties",
		color: "hsl(var(--chart-1))",
	},
};

// Helper function to format recent activity text

export default function AdminDashboard() {
	const { user } = useAuth();

	// --- Data Fetching with React Query ---
	const {
		data: stats,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["adminDashboardStats"],
		queryFn: async () => {
			const response = await apiFetch<{ success: boolean; data: AdminStatsData }>("/dashboard/admin-stats");
			return response.data;
		},
		enabled: !!user && (user.role === "admin" || user.role === "master_admin"),
	});

	// --- Loading State: Render Skeletons ---
	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='grid grid-cols-1 xl:grid-cols-2 desktop:grid-cols-4 gap-6'>
					<Skeleton className='h-32' />
					<Skeleton className='h-32' />
					<Skeleton className='h-32' />
					<Skeleton className='h-32' />
				</div>
				<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
					<Skeleton className='h-80' />
					<Skeleton className='h-80' />
				</div>
			</div>
		);
	}

	// --- Error State ---
	if (error) {
		return <div className='text-red-500'>Failed to load dashboard data. Please try again later.</div>;
	}

	// --- Success State: Render Dashboard with Live Data ---
	return (
		<div className='space-y-6'>
			{/* Statistics Cards */}
			<div
				className={cn(
					"grid grid-cols-1 xl:grid-cols-2 desktop:grid-cols-4 gap-6",
					user?.role === "admin" && "desktop:grid-cols-3"
				)}>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Properties</CardTitle>
						<Package className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.totalProperties.toLocaleString() || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Asset Value</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(stats?.totalAssetValue || 0)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Active Users</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.totalUsers || 0}</div>
					</CardContent>
				</Card>

				{/* Only show Pending Approvals card to Master Admins */}
				{user?.role === "master_admin" && (
					<Card className='border-l-4 border-l-[#800000]'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-[#800000]'>Pending Approvals</CardTitle>
							<CheckCheck className='h-4 w-4 text-[#800000]' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-[#800000]'>{stats?.pendingApprovals || 0}</div>
							<p className='text-xs text-muted-foreground mb-3'>Requires immediate attention</p>
							<Button asChild size='sm' className='w-full bg-[#800000] hover:bg-red-900'>
								<Link href='/approvals'>Review Now</Link>
							</Button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Charts and Activity Section */}
			<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
				<Card className=''>
					<CardHeader>
						<CardTitle>Properties by Department</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig} className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={stats?.propertiesByDepartment || []}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='department' tick={{ fontSize: 12 }} angle={-45} textAnchor='end' height={60} />
									<Tooltip content={<ChartTooltipContent />} />
									<Bar dataKey='count' fill='#800000' radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card className=''>
					<CardHeader>
						<CardTitle>Assets by Category</CardTitle>
					</CardHeader>
					<CardContent className='flex justify-center'>
						<ChartContainer config={chartConfig} className='h-[300px] w-full max-w-lg'>
							<ResponsiveContainer width='100%' height='100%'>
								<PieChart>
									<Pie
										data={stats?.assetsByCategory || []}
										cx='50%'
										cy='50%'
										outerRadius={100}
										dataKey='count'
										nameKey='category'
										label={({ name, percent }) => `${name} ${(percent || 0 * 100).toFixed(0)}%`}>
										{(stats?.assetsByCategory || []).map((entry, index) => (
											<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
										))}
									</Pie>
									<Tooltip content={<ChartTooltipContent />} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
