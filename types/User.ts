export type Role = "staff" | "admin" | "master_admin" | "property_custodian";

export interface User {
	id: number;
	name: string;
	email: string;
	role: Role;
}
