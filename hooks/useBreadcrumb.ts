import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
	label: string;
	href: string;
	isCurrentPage?: boolean;
}

const routeLabels: Record<string, string> = {
	dashboard: "Dashboard", // Fixed typo: was "dashbard"
	property_custodians: "Property Custodians",
	add: "Add New",
	edit: "Edit",
	staffs: "Staffs",
	properties: "Properties",
	admins: "Admins",
	approvals: "Approvals",
};

export const useBreadcrumb = (): BreadcrumbItem[] => {
	const pathname = usePathname();

	return useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs: BreadcrumbItem[] = [];

		// Handle root/dashboard case - return empty array to hide breadcrumb
		// Or return single item to show "Dashboard" only
		if (pathname === "/" || pathname === "/dashboard") {
			// Option 1: Hide breadcrumb completely on dashboard
			// return [];

			// Option 2: Show "Dashboard" only (current behavior)
			breadcrumbs.push({
				label: "Dashboard",
				href: "/dashboard",
				isCurrentPage: true,
			});
			return breadcrumbs;
		}

		// Always add home/dashboard as first breadcrumb (not current page)
		breadcrumbs.push({
			label: "Dashboard",
			href: "/dashboard",
			isCurrentPage: false,
		});

		// Build breadcrumbs from path segments
		let currentPath = "";
		segments.forEach((segment, index) => {
			currentPath += `/${segment}`;
			const isLast = index === segments.length - 1;

			breadcrumbs.push({
				label: routeLabels[segment] || segment.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
				href: currentPath,
				isCurrentPage: isLast,
			});
		});

		return breadcrumbs;
	}, [pathname]);
};
