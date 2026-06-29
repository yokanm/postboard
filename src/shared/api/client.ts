// ─── Centralized API Client ────────────────────────────────
// All HTTP communication goes through apiFetch().
// No direct fetch() calls in components or hooks.

import { env } from "#/lib/env";
import { ApiError, type ApiErrorBody } from "#/shared/types/api";
import { useAuthStore } from "#/stores/auth-store";
import { useSuperAdminAuthStore } from "#/stores/superadmin-auth-store";

// ─── Types ─────────────────────────────────────────────────

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
	body?: BodyInit | null;
	timeout?: number;
	superadmin?: boolean;
}

interface QueueItem {
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}

// ─── Refresh Queue (prevents concurrent refresh calls) ─────

let isRefreshing = false;
let refreshQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
	refreshQueue.forEach((item) => {
		if (error) {
			item.reject(error);
		} else if (token !== null) {
			item.resolve(token);
		}
	});
	refreshQueue = [];
}

async function attemptRefresh(superadmin: boolean): Promise<string> {
	const url = superadmin
		? `${env.apiUrl}/superadmin/refresh`
		: `${env.apiUrl}/auth/refresh-token`;

	const response = await fetch(url, {
		method: "POST",
		credentials: "include",
		headers: { Accept: "application/json" },
	});

	if (!response.ok) {
		throw new ApiError("Token refresh failed", response.status, "UNAUTHORIZED");
	}

	const data = (await response.json()) as { data: { accessToken: string } };
	return data.data.accessToken;
}

// ─── Main Fetch Function ───────────────────────────────────

export async function apiFetch<T>(
	endpoint: string,
	options: ApiFetchOptions = {},
): Promise<T> {
	const {
		timeout = 30_000,
		superadmin = false,
		headers: customHeaders,
		...rest
	} = options;

	const baseUrl = env.apiUrl;
	const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

	// ── Build Headers ──────────────────────────────────────

	const headers: Record<string, string> = {
		Accept: "application/json",
		...(customHeaders as Record<string, string> | undefined),
	};

	// Automatically inject Content-Type unless body is FormData
	if (!(rest.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	// Automatically inject Authorization header
	const token = superadmin
		? useSuperAdminAuthStore.getState().accessToken
		: useAuthStore.getState().accessToken;

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	// ── Timeout Controller ─────────────────────────────────

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		let response = await fetch(url, {
			...rest,
			headers,
			credentials: "include",
			signal: controller.signal,
		});

		// ── Automatic Token Refresh on 401 ───────────────────
		if (response.status === 401 && token) {
			if (!isRefreshing) {
				isRefreshing = true;
				try {
					const newToken = await attemptRefresh(superadmin);
					isRefreshing = false;

					// Update token in store
					if (superadmin) {
						useSuperAdminAuthStore.getState().setAccessToken(newToken);
					} else {
						useAuthStore.getState().setAccessToken(newToken);
					}

					processQueue(null, newToken);

					// Retry original request with new token
					headers.Authorization = `Bearer ${newToken}`;
					response = await fetch(url, {
						...rest,
						headers,
						credentials: "include",
						signal: controller.signal,
					});
				} catch (refreshError) {
					isRefreshing = false;
					processQueue(refreshError, null);

					// Clear auth state
					if (superadmin) {
						useSuperAdminAuthStore.getState().clearAuth();
					} else {
						useAuthStore.getState().clearAuth();
					}

					if (typeof window !== "undefined") {
						const redirect = superadmin ? "/superadmin/login" : "/login";
						window.location.href = redirect;
					}

					throw refreshError;
				}
			} else {
				// Another refresh is in progress — queue this request
				const newToken = await new Promise<string>((resolve, reject) => {
					refreshQueue.push({ resolve, reject });
				});
				headers.Authorization = `Bearer ${newToken}`;
				response = await fetch(url, {
					...rest,
					headers,
					credentials: "include",
					signal: controller.signal,
				});
			}
		}

		// ── Handle Non-OK Responses ──────────────────────────
		if (!response.ok) {
			const errorBody = await parseErrorResponse(response);
			throw errorBody;
		}

		// ── Handle 204 No Content ────────────────────────────
		if (response.status === 204 || response.status === 304) {
			return undefined as unknown as T;
		}

		// ── Parse Response + Auto-Unwrap Backend Envelope ──
		// Backend wraps all success responses in { data: T } via sendSuccess().
		// Paginated responses also include { data: T[], meta: { nextCursor, hasNextPage } }.
		// Auto-unwrap data and flatten meta so callers get the expected shape.
		const json = (await response.json()) as T;

		if (
			json &&
			typeof json === "object" &&
			!Array.isArray(json) &&
			"data" in json
		) {
			const envelope = json as Record<string, unknown>;
			const { data, meta } = envelope;
			if (meta && typeof meta === "object") {
				// Paginated: flatten meta into top-level, keep data raw
				return { data, ...meta } as T;
			}
			// Single: unwrap data directly
			return data as T;
		}

		return json;
	} finally {
		clearTimeout(timeoutId);
	}
}

// ─── Error Parsing ─────────────────────────────────────────

async function parseErrorResponse(response: Response): Promise<ApiError> {
	let message = `Request failed with status ${response.status}`;
	let code: ApiErrorBody["error"]["code"] = "INTERNAL_ERROR";
	let details: ApiErrorBody["error"]["details"] | undefined;

	try {
		const body = (await response.json()) as ApiErrorBody;
		if (body.error) {
			message = body.error.message || message;
			code = body.error.code || code;
			details = body.error.details;
		}
	} catch {
		// Response body was not JSON — use defaults
	}

	return new ApiError(message, response.status, code, details);
}

// ─── Pagination Helper ────────────────────────────────────
// Maps the unwrapped paginated response array to the correct key.
// Backend sends { data: T[], meta: { nextCursor, hasNextPage } }.
// After auto-unwrap, this becomes { data: T[], nextCursor, hasNextPage }.
// This helper renames data to the expected key (e.g. "jobs", "users").

// Map backend paginated response to frontend type.
// Backend returns { data: T[], meta: { nextCursor, hasNextPage } }.
// After auto-unwrap: { data: T[], nextCursor, hasNextPage }.
// This helper renames `data` to the expected key (e.g. "jobs", "users").
export function mapPaginated<T>(
	response: {
		data: unknown[];
		nextCursor: string | null;
		hasNextPage: boolean;
	},
	key: string,
): T {
	const result = {
		[key]: response.data,
		nextCursor: response.nextCursor,
		hasNextPage: response.hasNextPage,
	};
	return result as unknown as T;
}

// ─── Convenience Methods ───────────────────────────────────

export const api = {
	get<T>(endpoint: string, options?: ApiFetchOptions): Promise<T> {
		return apiFetch<T>(endpoint, { ...options, method: "GET" });
	},

	post<T>(
		endpoint: string,
		body?: unknown,
		options?: ApiFetchOptions,
	): Promise<T> {
		return apiFetch<T>(endpoint, {
			...options,
			method: "POST",
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
	},

	put<T>(
		endpoint: string,
		body?: unknown,
		options?: ApiFetchOptions,
	): Promise<T> {
		return apiFetch<T>(endpoint, {
			...options,
			method: "PUT",
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
	},

	patch<T>(
		endpoint: string,
		body?: unknown,
		options?: ApiFetchOptions,
	): Promise<T> {
		return apiFetch<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
	},

	delete<T>(endpoint: string, options?: ApiFetchOptions): Promise<T> {
		return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
	},

	upload<T>(
		endpoint: string,
		formData: FormData,
		options?: ApiFetchOptions,
	): Promise<T> {
		return apiFetch<T>(endpoint, {
			...options,
			method: "POST",
			body: formData,
		});
	},
};
