// ─── Backward Compatibility Layer ──────────────────────────
// New code should import directly from "#/shared/api/client".
// Aggregates all old exports for existing code compatibility.

// New API — available both from here and from #/shared/api/client
export { api, apiFetch, mapPaginated } from "#/shared/api/client";
export { ApiError, isApiError } from "#/shared/types/api";
export { endpoints } from "./endpoints";
export { ApiRequestError, isApiRequestError } from "./errors";
export { http } from "./request";
