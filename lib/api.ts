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

export async function apiFetchWithStatus<T>(
	url: string,
	method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
	body?: Record<string, unknown>,
	token?: string
): Promise<{ data: T; status: number }> {
	// <--- Changed return type

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		},
		...(body && { body: JSON.stringify(body) }),
	});

	const responseBody = await res.json();

	if (!res.ok) {
		const error: ApiError = new Error(responseBody.message || "Unknown error");
		error.status = res.status;
		error.error = responseBody.error;
		throw error;
	}

	// Returns an object with both the data and the status
	return {
		data: responseBody,
		status: res.status,
	};
}

export async function apiFetchFile(
	url: string,
	method: "GET" | "POST" = "GET",
	body?: Record<string, unknown>,
	token?: string
): Promise<Blob> {
	// It's guaranteed to return a Blob
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
		method,
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
			...(body && { "Content-Type": "application/json" }),
		},
		...(body && { body: JSON.stringify(body) }),
	});

	if (!res.ok) {
		// If the request fails, the server likely still sent a JSON error message.
		const errorBody = await res.json();
		const error: ApiError = new Error(errorBody.message || "File download failed");
		error.status = res.status;
		error.error = errorBody.error;
		throw error;
	}

	// Instead of res.json(), we return the response as a raw blob.
	return res.blob();
}
