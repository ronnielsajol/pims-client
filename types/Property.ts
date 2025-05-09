export interface Property {
	id: number;
	name: string;
	description: string;
	qrCode?: string;
	createdAt?: string;
	updatedAt?: string;
	assignedTo?: string;
	isNew?: boolean;
}
