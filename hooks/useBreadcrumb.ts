import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
	label: string;
	href: string;
	isCurrentPage?: boolean;
}

const routeLabels: Record<string, string> = {
	dashboard: "Dashboard",
	property_custodians: "Property Custodians",
	add: "Add New",
	edit: "Edit",
	staffs: "Staffs",
	properties: "Properties",
	admins: "Admins",
	approvals: "Approvals",
	details: "Details",
};

const formatLabel = (segment: string): string => {
	return routeLabels[segment] || segment.replace(/\_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const useBreadcrumb = (): BreadcrumbItem[] => {
	const pathname = usePathname();

	return useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs: BreadcrumbItem[] = [];

		if (pathname === "/" || pathname === "/dashboard") {
			breadcrumbs.push({
				label: "Dashboard",
				href: "/dashboard",
				isCurrentPage: true,
			});
			return breadcrumbs;
		}

		// Always start with Dashboard
		breadcrumbs.push({
			label: "Dashboard",
			href: "/dashboard",
			isCurrentPage: false,
		});

		let currentPath = "";
		const nonNumericSegments: { segment: string; index: number; path: string }[] = [];

		segments.forEach((segment, index) => {
			currentPath += `/${segment}`;

			if (!isNaN(Number(segment))) {
				return;
			}

			nonNumericSegments.push({
				segment,
				index,
				path: currentPath,
			});
		});

		nonNumericSegments.forEach((item, index) => {
			const isLast = index === nonNumericSegments.length - 1;

			breadcrumbs.push({
				label: formatLabel(item.segment),
				href: item.path,
				isCurrentPage: isLast,
			});
		});

		return breadcrumbs;
	}, [pathname]);
};
