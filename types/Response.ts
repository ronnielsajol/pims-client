import { User } from "./User";

export interface Response {
	success: boolean;
	message: string;
	data: { token: string; user: User };
}
