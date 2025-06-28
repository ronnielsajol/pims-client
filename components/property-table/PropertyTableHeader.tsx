import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

interface ColumnDefinition {
	key: string;
	label: string;
	className?: string;
	isVisible: (userRole?: string) => boolean;
}

const defaultColumnDefinitions: ColumnDefinition[] = [
	{
		key: "id",
		label: "ID",
		className: "w-[50px] text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "productNumber",
		label: "Product Number",
		className: "w-1/12 text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "description",
		label: "Description",
		className: "w-1/12 text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "quantity",
		label: "Quantity",
		className: "w-1/12 text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "value",
		label: "Value",
		className: "w-1/12 text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "serialNumber",
		label: "Serial Number",
		className: "w-1/8 text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "assignedTo",
		label: "Assigned To",
		className: "text-muted-foreground",
		isVisible: (userRole) => userRole === "admin" || userRole === "master_admin" || userRole === "property_custodian",
	},
	{
		key: "department",
		label: "Department",
		className: "text-muted-foreground",
		isVisible: (userRole) => userRole !== "staff" && userRole !== "property_custodian",
	},
	{
		key: "location",
		label: "Location",
		className: "text-muted-foreground",
		isVisible: (userRole) => userRole === "property_custodian",
	},
	{
		key: "actions",
		label: "Actions",
		className: "text-right pr-4 text-muted-foreground",
		isVisible: (userRole) => userRole === "admin" || userRole === "master_admin" || userRole === "property_custodian",
	},
];

const staffColumnDefinitions: ColumnDefinition[] = [
	{
		key: "id",
		label: "ID",
		className: "basis-[50px] min-w-[50px] max-w-[50px] text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "productNumber",
		label: "Product Number",
		className: "min-w-[150px] text-muted-foreground",
		isVisible: () => true,
	},
	{
		key: "description",
		label: "Description",
		className: "min-w-[200px] text-muted-foreground",
		isVisible: () => true,
	},

	...defaultColumnDefinitions.slice(3).map((col) => ({ ...col, className: "min-w-[120px] text-muted-foreground" })),
];

export default function PropertyTableHeader({ userRole }: { userRole?: string }) {
	const columnDefinitions = useMemo(() => {
		if (userRole === "staff") {
			return staffColumnDefinitions;
		}
		return defaultColumnDefinitions;
	}, [userRole]);
	// ---

	// Now we filter the chosen set of columns for visibility
	const visibleColumns = useMemo(
		() => columnDefinitions.filter((col) => col.isVisible(userRole)),
		[columnDefinitions, userRole]
	);

	return (
		<TableHeader>
			<TableRow className='bg-muted/50'>
				{visibleColumns.map((col) => (
					<TableHead key={col.key} className={col.className}>
						{col.label}
					</TableHead>
				))}
			</TableRow>
		</TableHeader>
	);
}
