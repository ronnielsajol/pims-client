import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ColumnDefinition {
	key: string; // Unique key for React's map function
	label: string;
	className?: string;
	// Condition function to determine if the column should be rendered for a given role
	isVisible: (userRole?: string) => boolean;
}

// Define all possible columns and their visibility logic
// This array can be defined outside the component if it doesn't depend on component props/state
const columnDefinitions: ColumnDefinition[] = [
	{
		key: "id",
		label: "ID",
		className: "w-[50px] text-muted-foreground",
		isVisible: () => true, // Always visible
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
		key: "quantity", // Corrected typo from "Quantiy"
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

export default function PropertyTableHeader({ userRole }: { userRole?: string }) {
	// Filter columns based on the current userRole
	const visibleColumns = columnDefinitions.filter((col) => col.isVisible(userRole));

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
