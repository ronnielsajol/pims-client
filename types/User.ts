export type Role = "staff" | "admin" | "master_admin";

export interface User {
	id: number;
	name: string;
	email: string;
	role: Role;
	password?: string; // optional if you're fetching users without passwords
}
