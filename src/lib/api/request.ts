// ─── Backward Compatible HTTP Client ───────────────────────
// Provides the same interface as the original http object
// while delegating to the new shared api client.
// New code should import from "#/shared/api/client" directly.

import { apiFetch } from "#/shared/api/client";

interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: unknown;
	authenticated?: boolean;
}

function requestBase<T>(
	url: string,
	options: RequestOptions & { isUpload?: boolean; superadmin?: boolean } = {},
): Promise<T> {
	const {
		authenticated = false,
		superadmin = false,
		isUpload = false,
		body,
		...rest
	} = options;

	const fetchOptions: Parameters<typeof apiFetch>[1] = {
		...rest,
		superadmin,
	};

	if (body !== undefined && !isUpload) {
		fetchOptions.body = JSON.stringify(body);
	} else if (body instanceof FormData) {
		fetchOptions.body = body;
	}

	return apiFetch<T>(url, fetchOptions);
}

export const http = {
	get<T>(url: string, authenticated = false): Promise<T> {
		return requestBase<T>(url, { method: "GET", authenticated });
	},

	post<T>(url: string, body: unknown, authenticated = false): Promise<T> {
		return requestBase<T>(url, { method: "POST", body, authenticated });
	},

	put<T>(url: string, body: unknown, authenticated = false): Promise<T> {
		return requestBase<T>(url, { method: "PUT", body, authenticated });
	},

	patch<T>(url: string, body: unknown, authenticated = false): Promise<T> {
		return requestBase<T>(url, { method: "PATCH", body, authenticated });
	},

	delete<T>(url: string, authenticated = false): Promise<T> {
		return requestBase<T>(url, { method: "DELETE", authenticated });
	},

	upload<T>(
		url: string,
		formData: FormData,
		authenticated = false,
	): Promise<T> {
		return requestBase<T>(url, {
			method: "POST",
			body: formData,
			authenticated,
			isUpload: true,
		});
	},

	superadmin: {
		get<T>(url: string): Promise<T> {
			return requestBase<T>(url, {
				method: "GET",
				authenticated: true,
				superadmin: true,
			});
		},
		post<T>(url: string, body?: unknown): Promise<T> {
			return requestBase<T>(url, {
				method: "POST",
				body,
				authenticated: true,
				superadmin: true,
			});
		},
		patch<T>(url: string, body?: unknown): Promise<T> {
			return requestBase<T>(url, {
				method: "PATCH",
				body,
				authenticated: true,
				superadmin: true,
			});
		},
		delete<T>(url: string): Promise<T> {
			return requestBase<T>(url, {
				method: "DELETE",
				authenticated: true,
				superadmin: true,
			});
		},
	},
} as const;
