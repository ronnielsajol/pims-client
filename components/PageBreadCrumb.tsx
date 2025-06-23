// components/PageBreadcrumb.tsx
"use client";
import { useRouter } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

interface PageBreadcrumbProps {
	className?: string;
	showOnDashboard?: boolean; // Option to show/hide on dashboard
}

export const PageBreadcrumb = ({
	className = "flex items-center px-1 max-xl:mt-4",
	showOnDashboard = true,
}: PageBreadcrumbProps) => {
	const router = useRouter();
	const breadcrumbs = useBreadcrumb();

	// Don't render if no breadcrumbs or if on dashboard and showOnDashboard is false
	if (breadcrumbs.length === 0 || (!showOnDashboard && breadcrumbs.length === 1)) {
		return null;
	}

	return (
		<Breadcrumb className={className}>
			<BreadcrumbList>
				{breadcrumbs.map((crumb, index) => (
					<div key={`${crumb.href}-${index}`} className='flex items-center font-medium '>
						<BreadcrumbItem className=''>
							{crumb.isCurrentPage ? (
								<BreadcrumbPage className='font-medium text-[#800000]'>{crumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink
									href={crumb.href}
									className='cursor-pointer hover:text-[#800000] text-[#800000]/40 '
									onClick={(e) => {
										e.preventDefault();
										router.push(crumb.href);
									}}>
									{crumb.label}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
