import { ApiError } from "@/types";

export async function apiFetch<T>(
	url: string,
	method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
	body?: Record<string, unknown>,
	token?: string
): Promise<T> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		},
		...(body && { body: JSON.stringify(body) }),
	});
	if (!res.ok) {
		const errorBody = await res.json();
		const error: ApiError = new Error(errorBody.message || "Unknown error");
		error.status = res.status;
		error.error = errorBody.error;
		throw error;
	}

	return res.json();
}
