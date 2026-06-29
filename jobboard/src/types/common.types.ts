// src/types/common.types.ts
//
// Shared utility types used across all domains — pagination, API responses,
// generic helpers, and base model shapes.

// ─── Branded ID type ──────────────────────────────────────────────────────────
// Prevents accidentally passing a companyId where a userId is expected.
// Usage: type UserId = ID<'User'>; type CompanyId = ID<'Company'>;

export type ID<_Brand extends string = string> = string & { __brand?: _Brand };

// ─── Nullable / Optional helpers ──────────────────────────────────────────────

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// ─── Timestamps ───────────────────────────────────────────────────────────────
// Every DB model has these. Extend this interface instead of repeating fields.

export interface Timestamps {
	createdAt: Date;
	updatedAt: Date;
}

export interface SoftDelete {
	deletedAt: Date | null;
}

export interface BaseModel extends Timestamps, SoftDelete {
	id: string;
}

// ─── Cursor-based pagination ───────────────────────────────────────────────────
// All list endpoints use cursor pagination. Callers send CursorPageInput,
// services return PaginatedResult<T>.

export type CursorPageInput = {
	/** ID of the last item from the previous page */
	cursor?: string;
	/** Maximum items per page (server enforces a hard cap of 100) */
	limit?: string;
};

export type PaginatedResult<T> = {
	items: T[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

// ─── Standardised API response wrappers ───────────────────────────────────────
// Controllers always respond with one of these shapes.

export type ApiSuccessResponse<T = void> = T extends void
	? { message: string }
	: { data: T };

export type ApiErrorResponse = {
	status: "error";
	message: string;
	stack?: string; // only in non-production
};

// ─── File upload ──────────────────────────────────────────────────────────────

export type FileUploadResult = {
	url: string;
	publicId: string;
};

// ─── Email ────────────────────────────────────────────────────────────────────

export type SendEmailOptions = {
	to: string;
	subject: string;
	html: string;
};

// ─── Sort / Filter helpers ────────────────────────────────────────────────────

export type SortOrder = "asc" | "desc";

export type DateRangeFilter = {
	from?: Date;
	to?: Date;
};
