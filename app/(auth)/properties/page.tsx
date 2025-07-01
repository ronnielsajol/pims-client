"use client";
import { useState } from "react";
import { apiFetch, apiFetchFile } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PropertyTable from "@/components/property-table/PropertyTable";
import { PlusCircle, FileDown } from "lucide-react";
import { PageBreadcrumb } from "@/components/PageBreadCrumb";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";

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

	const [addMode, setAddMode] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const {
		status,
		data: propertiesResponse,
		isLoading: isLoadingProperties,
	} = useQuery({
		queryKey: ["properties", currentPage],
		queryFn: async () => {
			console.log("Status: ", status);
			const res = await apiFetch<PaginatedResponse>(`/properties?page=${currentPage}&pageSize=10`);
			return res;
		},
	});

	const pageCount = propertiesResponse?.meta.pageCount || 0;

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

	const renderPaginationItems = () => {
		const items = [];
		const siblingCount = 1; // How many pages to show on each side of the current page
		const totalPageNumbers = siblingCount + 5; // The total numbers to show with ellipsis

		// Always show first page
		items.push(
			<PaginationItem key={1}>
				<PaginationLink
					href='#'
					onClick={(e) => {
						e.preventDefault();
						handlePageChange(1);
					}}
					isActive={currentPage === 1}>
					1
				</PaginationLink>
			</PaginationItem>
		);

		if (pageCount > totalPageNumbers) {
			const startPage = Math.max(2, currentPage - siblingCount);
			const endPage = Math.min(pageCount - 1, currentPage + siblingCount);

			if (startPage > 2) {
				items.push(
					<PaginationItem key='start-ellipsis'>
						<PaginationEllipsis />
					</PaginationItem>
				);
			}

			for (let i = startPage; i <= endPage; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							href='#'
							onClick={(e) => {
								e.preventDefault();
								handlePageChange(i);
							}}
							isActive={currentPage === i}>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}

			if (endPage < pageCount - 1) {
				items.push(
					<PaginationItem key='end-ellipsis'>
						<PaginationEllipsis />
					</PaginationItem>
				);
			}
		} else {
			for (let i = 2; i < pageCount; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							href='#'
							onClick={(e) => {
								e.preventDefault();
								handlePageChange(i);
							}}
							isActive={currentPage === i}>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}
		}

		// Always show last page if more than 1 page
		if (pageCount > 1) {
			items.push(
				<PaginationItem key={pageCount}>
					<PaginationLink
						href='#'
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(pageCount);
						}}
						isActive={currentPage === pageCount}>
						{pageCount}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
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
						<PropertyTable currentPage={currentPage} addMode={addMode} setAddMode={setAddMode} />
					</div>

					<div className='w-full flex justify-start max-xl:justify-center'>
						{pageCount > 1 && (
							<div className='mt-4'>
								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												href='#'
												onClick={(e) => {
													e.preventDefault();
													handlePageChange(currentPage - 1);
												}}
												className={currentPage === 1 || isLoadingProperties ? "pointer-events-none opacity-50" : undefined}
											/>
										</PaginationItem>

										{renderPaginationItems()}

										<PaginationItem>
											<PaginationNext
												href='#'
												onClick={(e) => {
													e.preventDefault();
													handlePageChange(currentPage + 1);
												}}
												className={currentPage === pageCount || isLoadingProperties ? "pointer-events-none opacity-50" : undefined}
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
