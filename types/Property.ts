export interface Property {
	id: number;
	propertyNo: string;
	description: string;
	quantity: string;
	value: string;
	serialNo: string;
	qrCode?: string;
	category: "Annex A" | "Annex B" | "Annex C";
	createdAt?: string;
	updatedAt?: string;
	assignedTo?: string;
	location_detail?: string;
	assignedDepartment?: string;
	reassignmentStatus?: "pending" | null;
	totalValue: number;
}

export interface PropertyDetails {
	propertyId: number;
	article: string | null;
	oldPropertyNo: string | null;
	unitOfMeasure: string | null;
	acquisitionDate: string | null;
	condition: string | null;
	remarks: string | null;
	pupBranch: string | null;
	assetType: string | null;
	fundCluster: string | null;
	poNo: string | null;
	invoiceDate: string | null;
	invoiceNo: string | null;
}

export interface PropertyWithDetails extends Property {
	details: PropertyDetails | null;
}
