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
import { PageBreadcrumb } from "@/components/PageBreadCrumb";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
interface PaginatedResponse {
	success: boolean;
	data: Property[];
	meta: {
		page: number;
		pageSize: number;
		pageCount: number;
		totalCount: number;
	};
}

export default function PropertiesPage() {
	const { user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [addMode, setAddMode] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const [pageCount, setPageCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const fetchProperties = async (page: number) => {
		if (!user) return;
		setIsLoading(true);

		try {
			// Fetch assigned properties
			const propsRes = await apiFetch<PaginatedResponse>(`/properties?page=${page}&pageSize=10`);
			setProperties(propsRes.data);
			setPageCount(propsRes.meta.pageCount);
			setCurrentPage(propsRes.meta.page);

			// Fetch users depending on role
			if (user.role === "property_custodian") {
				// Custodian sees staff
				const usersRes = await apiFetch<{ success: boolean; data: User[] }>("/users?roles=staff", "GET", undefined);
				setUsers(usersRes.data);
			} else if (user.role === "admin" || user.role === "master_admin") {
				// Admins see custodians
				const usersRes = await apiFetch<{ success: boolean; data: User[] }>(
					"/users?roles=property_custodian",
					"GET",
					undefined
				);
				setUsers(usersRes.data);
			}
		} catch (error) {
			console.error("Failed to fetch properties or users:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchProperties(currentPage);
		}
	}, [user, currentPage]);

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= pageCount) {
			setCurrentPage(newPage);
		}
	};

	const handleGenerateReport = async () => {
		if (!user) return;
		setIsGenerating(true);
		try {
			// Use the new helper function to fetch the file blob
			const blob = await apiFetchFile("/properties/report", "GET", undefined);

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
		user,
		properties,
		users,
		addMode,
		setAddMode,
		fetchProperties: () => fetchProperties(currentPage),
		isLoading,
	};
	return (
		<ProtectedRoute>
			<div className='max-xl:p-0.5 laptop:p-5 desktop:p-8 w-full'>
				<div
					className={cn(
						"flex w-full max-xl:flex-col max-xl:mb-2 max-xl:gap-4 mb-4",
						user?.role === "staff" ? "justify-start" : "justify-between"
					)}>
					<PageBreadcrumb />
					<div className='flex items-center max-xl:w-full max-xl:justify-stretch gap-2'>
						{(user?.role === "admin" || user?.role === "master_admin" || user?.role === "property_custodian") && (
							<Button
								className='text-muted-foreground max-xl:flex-1 max-xl:w-full'
								variant='outline'
								onClick={handleGenerateReport}
								disabled={isGenerating}>
								<FileDown className='mr-1 h-4 w-4' />
								{isGenerating ? "Generating..." : "Generate Report"}
							</Button>
						)}

						{(user?.role === "admin" || user?.role === "master_admin") && (
							<Button
								className='bg-green-500 cursor-pointer hover:bg-green-600 max-xl:flex-1 max-xl:w-full'
								onClick={() => setAddMode(true)}
								disabled={addMode}>
								<PlusCircle className='mr-1 h-4 w-4' />
								Add Property
							</Button>
						)}
					</div>
				</div>
				<div className=''>
					<div className='rounded border shadow-md'>
						<PropertyTable state={propertyTableState} />
					</div>

					<div className='w-full flex justify-start max-xl:justify-center'>
						{pageCount > 1 && (
							<div className='mt-4'>
								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												href='#'
												onClick={(e: React.MouseEvent) => {
													e.preventDefault();
													handlePageChange(currentPage - 1);
												}}
												className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
											/>
										</PaginationItem>

										{Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNumber) => (
											<PaginationItem key={pageNumber}>
												<PaginationLink
													href='#'
													onClick={(e: React.MouseEvent) => {
														e.preventDefault();
														handlePageChange(pageNumber);
													}}
													isActive={pageNumber === currentPage}>
													{pageNumber}
												</PaginationLink>
											</PaginationItem>
										))}

										<PaginationItem>
											<PaginationNext
												href='#'
												onClick={(e: React.MouseEvent) => {
													e.preventDefault();
													handlePageChange(currentPage + 1);
												}}
												className={currentPage === pageCount ? "pointer-events-none opacity-50" : undefined}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
