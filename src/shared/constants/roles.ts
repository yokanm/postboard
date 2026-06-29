import type {
	ApplicationStatus,
	ErrorCode,
	ExperienceLevel,
	JobStatus,
	LocationType,
	UserRole,
} from "#/shared/types/api";

export const ROLES: Record<UserRole, string> = {
	CANDIDATE: "Candidate",
	RECRUITER: "Recruiter",
	ADMIN: "Company Admin",
	SUPERADMIN: "Super Admin",
};

export const ROLE_LABELS: Record<UserRole, string> = {
	CANDIDATE: "Job Seeker",
	RECRUITER: "Recruiter",
	ADMIN: "Administrator",
	SUPERADMIN: "Super Administrator",
};

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
	"JUNIOR",
	"MID",
	"SENIOR",
	"LEAD",
];

export const LOCATION_TYPES: LocationType[] = ["REMOTE", "ONSITE", "HYBRID"];

export const JOB_STATUSES: JobStatus[] = ["DRAFT", "OPEN", "CLOSED"];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
	"PENDING",
	"REVIEWED",
	"SHORTLISTED",
	"ACCEPTED",
	"REJECTED",
];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	VALIDATION_ERROR: "Please check your input and try again.",
	UNAUTHORIZED: "Please log in to continue.",
	FORBIDDEN: "You don't have permission to perform this action.",
	NOT_FOUND: "The requested resource was not found.",
	CONFLICT: "This action conflicts with the current state.",
	RATE_LIMITED: "Too many requests. Please try again later.",
	GONE: "This resource is no longer available.",
	INTERNAL_ERROR: "Something went wrong. Please try again.",
	UNKNOWN_ERROR: "An unexpected error occurred.",
};

export const PAGINATION = {
	DEFAULT_LIMIT: 20,
	MAX_LIMIT: 50,
	ADMIN_MAX_LIMIT: 100,
} as const;
