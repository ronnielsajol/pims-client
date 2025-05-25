import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PropertyTableHeader({ userRole }: { userRole?: string }) {
	return (
		<TableHeader>
			<TableRow className='bg-muted/50 '>
				<TableHead className='w-[50px] text-muted-foreground'>ID</TableHead>
				<TableHead className='w-1/6 text-muted-foreground'>Product Number</TableHead>
				<TableHead className='w-1/12 text-muted-foreground'>Description</TableHead>
				<TableHead className='w-1/12 text-muted-foreground'>Quantiy</TableHead>
				<TableHead className='w-1/12 text-muted-foreground'>Value</TableHead>
				<TableHead className='w-1/8 text-muted-foreground'>Serial Number</TableHead>
				<TableHead className='w-[100px] text-muted-foreground'>QR Code</TableHead>
				{(userRole === "admin" || userRole === "master_admin" || userRole === "property_custodian") && (
					<>
						<TableHead className='w-[400px] text-muted-foreground'>Assigned To</TableHead>
						<TableHead className='text-right pr-4 text-muted-foreground'>Actions</TableHead>
					</>
				)}
			</TableRow>
		</TableHeader>
	);
}
