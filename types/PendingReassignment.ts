import { Property } from "./Property";
import { User } from "./User";

export interface PendingReassignmentRequest {
	requestId: number;
	property: Property;
	fromStaff: User;
	toStaff: User;
	requestedBy: User;
	status: "pending" | "approved" | "denied";
	createdAt: string; // Dates are serialized as strings in JSON
}
