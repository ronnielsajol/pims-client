export type Role = "staff" | "admin" | "master_admin";

export interface User {
	id: number;
	name: string;
	email: string;
	role: Role;
}
