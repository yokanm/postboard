// src/types/index.ts
//
// Central type barrel. Every other file in the project imports from here —
// never directly from individual type files.
//
// ─── Two import styles are supported ──────────────────────────────────────────
//
// 1. Named import (most common — specific type, no namespace noise):
//      import type { CreateJobInput, JobSummary } from '@/types';
//
// 2. Namespace import (useful in services that use many types from one domain):
//      import type * as JobTypes from '@/types';
//      const input: JobTypes.CreateJobInput = { ... };
//
// ─── What lives where ─────────────────────────────────────────────────────────
//
//   enums.ts            — UserRoleType, JobStatusType, transition maps, role groups
//   common.types.ts     — PaginatedResult, Nullable, BaseModel, CursorPageInput, ...
//   auth.types.ts       — TokenPayload, TokenPair, RegisterUserInput, LoginInput, ...
//   user.types.ts       — UserPublic, UserWithProfile, UpdateUserInput, ...
//   company.types.ts    — CompanyProfile, UpdateCompanyInput, TeamMemberRow, ...
//   job.types.ts        — CreateJobInput, JobSummary, JobDetail, TagFull, ...
//   application.types.ts — ApplyInput, ApplicationSubmitted, MyApplicationItem, ...
//   notification.types.ts — ApplicationReceivedArgs, EmailJobData, ...
//   middleware.types.ts — AuthRequest, AuthRoles, RefreshCookieOptions, ...

// ─── Applications ─────────────────────────────────────────────────────────────
export type {
	ApplicationListItem,
	ApplicationStatusUpdated,
	ApplicationSubmitted,
	ApplyInput,
	ListApplicationsInput,
	MyApplicationItem,
	UpdateApplicationStatusInput,
} from "./application.types";
// ─── Auth ─────────────────────────────────────────────────────────────────────
export type {
	ChangePasswordInput,
	LoginCompanyResult,
	LoginInput,
	LoginUserResult,
	RegisterCompanyInput,
	RegisterCompanyResult,
	RegisterUserInput,
	RegisterUserResult,
	ResetPasswordInput,
	TokenGeneratorOpts,
	TokenPair,
	TokenPayload,
} from "./auth.types";

// ─── Common / shared ──────────────────────────────────────────────────────────
export type {
	ApiErrorResponse,
	ApiSuccessResponse,
	BaseModel,
	CursorPageInput,
	DateRangeFilter,
	FileUploadResult,
	ID,
	Maybe,
	Nullable,
	Optional,
	PaginatedResult,
	SendEmailOptions,
	SoftDelete,
	SortOrder,
	Timestamps,
} from "./common.types";
// ─── Company ──────────────────────────────────────────────────────────────────
export type {
	CompanyDetailRef,
	CompanyLogoResult,
	CompanyProfile,
	CompanyRef,
	CompanySummary,
	CompanyUpdated,
	GetCompanyProfileOpts,
	InviteTeamMemberInput,
	UpdateCompanyInput,
	UpdateTeamMemberRoleInput,
} from "./company.types";
// ─── Enums ────────────────────────────────────────────────────────────────────
export type {
	ApplicationStatusType,
	ExperienceLevelType,
	JobStatusType,
	LocationTypeType,
	NotificationTypeType,
	UserRoleType,
} from "./enums";
export {
	APPLICATION_STATUS_TRANSITIONS,
	ApplicationStatus,
	COMPANY_ADMIN_ROLES,
	COMPANY_ROLES,
	ExperienceLevel,
	JOB_STATUS_TRANSITIONS,
	JobStatus,
	LocationType,
	NotificationType,
	TEAM_READ_ROLES,
	UserRole,
} from "./enums";

// ─── Jobs & Tags ──────────────────────────────────────────────────────────────
export type {
	CreateJobInput,
	JobDetail,
	JobStatusUpdated,
	JobSummary,
	ListJobsInput,
	ListTagsInput,
	PostedByRef,
	TagFull,
	TagRef,
	TagWithCount,
	UpdateJobInput,
	UpdateJobStatusInput,
} from "./job.types";
// ─── Middleware ───────────────────────────────────────────────────────────────
export type {
	AuthRequest,
	AuthRoles,
	RefreshCookieOptions,
} from "./middleware.types";
export { REFRESH_COOKIE_MAX_AGE } from "./middleware.types";
// ─── Notifications (Phase 7) ──────────────────────────────────────────────────
export type {
	ApplicationReceivedEmailJob,
	ApplicationReceivedMetadata,
	ApplicationReceivedPayload,
	ApplicationStatusChangedEmailJob,
	ApplicationStatusChangedMetadata,
	ApplicationStatusChangedPayload,
	EmailJobData,
	JobExpiredEmailJob,
	JobExpiredMetadata,
	JobPostedMetadata,
	NotificationMetadata,
	NotificationRow,
	SystemAlertMetadata,
} from "./notification.types";
// ─── User & Profile ───────────────────────────────────────────────────────────
export type {
	ApplicantSummary,
	ResumeUploadResult,
	TeamMemberRow,
	TeamMemberSummary,
	UpdateUserInput,
	UpsertProfileInput,
	UserProfileData,
	UserPublic,
	UserSummary,
	UserUpdated,
	UserWithProfile,
} from "./user.types";
