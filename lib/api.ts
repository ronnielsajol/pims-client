import { ApiError } from "@/types";

export async function apiFetch<T>(
	url: string,
	method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
	body?: Record<string, unknown>
): Promise<T> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
		method,
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",

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
	body?: Record<string, unknown>
): Promise<{ data: T; status: number }> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
		method,
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		...(body && { body: JSON.stringify(body) }),
	});

	if (!res.ok) {
		let errorBody = { message: `Request failed with status ${res.status}` };
		try {
			errorBody = await res.json();
		} catch {}

		const error: ApiError = new Error(errorBody.message || "An unknown error occurred");
		error.status = res.status;
		error.error = (errorBody as ApiError).error; // Cast to any to access potential .error property
		throw error;
	}

	const contentType = res.headers.get("content-type");
	let data: T;

	if (contentType && contentType.includes("application/json")) {
		data = await res.json();
	} else {
		data = {} as T;
	}

	return {
		data,
		status: res.status,
	};
}

export async function apiFetchFile(
	url: string,
	method: "GET" | "POST" = "GET",
	body?: Record<string, unknown>
): Promise<Blob> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
		method,
		headers: {
			...(body && { "Content-Type": "application/json" }),
		},
		credentials: "include",
		...(body && { body: JSON.stringify(body) }),
	});

	if (!res.ok) {
		let errorBody = { message: `File download failed with status ${res.status}` };
		try {
			errorBody = await res.json();
		} catch {}

		const error: ApiError = new Error(errorBody.message || "An unknown error occurred during file download");
		error.status = res.status;
		error.error = (errorBody as ApiError).error;
		throw error;
	}

	// This part remains the same, as it correctly handles the file data
	return res.blob();
}
