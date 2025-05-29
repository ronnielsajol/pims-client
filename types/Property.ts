export interface Property {
	id: number;
	propertyNo: string;
	description: string;
	quantity: string;
	value: string;
	serialNo: string;
	qrCode?: string;
	createdAt?: string;
	updatedAt?: string;
	assignedTo?: string;
	isNew?: boolean;
	reassignmentStatus?: "pending" | null;
}
