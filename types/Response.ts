import { User } from "./User";

export interface Response {
	success: boolean;
	message: string;
	data: { user: User };
}
