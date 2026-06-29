// ─── Backward Compatibility ────────────────────────────────
// New code should import from "#/shared/types/api".

export {
	ApiError as ApiRequestError,
	isApiError as isApiRequestError,
} from "#/shared/types/api";
