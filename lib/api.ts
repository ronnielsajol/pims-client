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
		body: body ? JSON.stringify(body) : undefined,
	});

	const data = await res.json();
	if (!res.ok) throw new Error(data.error || "API error");
	return data;
}
