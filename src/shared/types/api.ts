// ─── API Response Envelopes ─────────────────────────────────

export interface ApiSuccessResponse<T> {
	data: T;
}

export interface ApiPaginatedResponse<T> {
	data: T[];
	meta: {
		nextCursor: string | null;
		hasNextPage: boolean;
	};
}

export interface ApiMessageResponse {
	message: string;
}

export interface ApiErrorDetail {
	field: string;
	message: string;
}

export interface ApiErrorBody {
	error: {
		code: ErrorCode;
		message: string;
		details?: ApiErrorDetail[];
	};
}

export type ErrorCode =
	| "VALIDATION_ERROR"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "RATE_LIMITED"
	| "GONE"
	| "INTERNAL_ERROR"
	| "UNKNOWN_ERROR";

export class ApiError extends Error {
	public readonly code: ErrorCode;
	public readonly status: number;
	public readonly details?: ApiErrorDetail[];

	constructor(
		message: string,
		status: number,
		code: ErrorCode,
		details?: ApiErrorDetail[],
	) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

// ─── Role Types ────────────────────────────────────────────

export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN" | "SUPERADMIN";

// ─── Auth DTOs ─────────────────────────────────────────────

export interface LoginInput {
	email: string;
	password: string;
}

export interface RegisterInput {
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: UserRole;
	phone?: string;
}

export interface LoginResponse {
	user: {
		id: string;
		userName: string;
		email: string;
		role: UserRole;
	};
	accessToken: string;
}

export interface RegisterCompanyInput {
	name: string;
	email: string;
	password: string;
	website?: string;
	industry?: string;
	size?: string;
}

export interface CurrentUser {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	role: UserRole;
	isVerified: boolean;
	companyId: string | null;
	createdAt: string;
}

export interface UserProfile {
	id: string;
	bio: string | null;
	resumeUrl: string | null;
	linkedinUrl: string | null;
	githubUrl: string | null;
	skills: string[];
	location: string | null;
}

export interface RefreshTokenResponse {
	accessToken: string;
}

// ─── Job DTOs ──────────────────────────────────────────────

export type LocationType = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevel = "JUNIOR" | "MID" | "SENIOR" | "LEAD";
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface JobSummary {
	id: string;
	title: string;
	companyId: string;
	companyName: string;
	locationType: LocationType;
	experienceLevel: ExperienceLevel;
	salaryMin: number | null;
	salaryMax: number | null;
	currency: string;
	tags: string[];
	status: JobStatus;
	createdAt: string;
	updatedAt: string;
}

export interface JobDetail extends JobSummary {
	description: string;
	postedBy: {
		id: string;
		firstName: string;
		lastName: string;
	};
}

export interface CreateJobInput {
	title: string;
	description: string;
	locationType: LocationType;
	experienceLevel: ExperienceLevel;
	salaryMin?: number;
	salaryMax?: number;
	currency?: string;
	tags?: string[];
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface UpdateJobStatusInput {
	status: JobStatus;
}

export interface ListJobsParams {
	cursor?: string;
	limit?: number;
	search?: string;
	locationType?: LocationType;
	experienceLevel?: ExperienceLevel;
	salaryMin?: number;
	salaryMax?: number;
	tags?: string;
}

// ─── Application DTOs ──────────────────────────────────────

export type ApplicationStatus =
	| "PENDING"
	| "REVIEWED"
	| "SHORTLISTED"
	| "ACCEPTED"
	| "REJECTED";

export interface ApplicationSummary {
	id: string;
	jobId: string;
	candidateId: string;
	candidateName: string;
	status: ApplicationStatus;
	coverLetter: string | null;
	resumeUrl: string | null;
	createdAt: string;
}

export interface ApplicationDetail extends ApplicationSummary {
	jobTitle: string;
	companyName: string;
}

export interface UpdateApplicationStatusInput {
	status: ApplicationStatus;
	note?: string;
}

export interface ListApplicationsParams {
	cursor?: string;
	limit?: number;
	status?: ApplicationStatus;
}

// ─── Company DTOs ──────────────────────────────────────────

export interface CompanyProfile {
	id: string;
	name: string;
	slug: string;
	email: string;
	logoUrl: string | null;
	website: string | null;
	industry: string | null;
	size: string | null;
	isVerified: boolean;
	createdAt: string;
}

export interface UpdateCompanyInput {
	name?: string;
	website?: string;
	industry?: string;
	size?: string;
}

export interface TeamMember {
	id: string;
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	joinedAt: string;
}

export interface InviteMemberInput {
	email: string;
	role: "RECRUITER" | "CANDIDATE";
}

export interface UpdateMemberRoleInput {
	role: "ADMIN" | "RECRUITER" | "CANDIDATE";
}

export interface CompanyAnalytics {
	jobs: Record<string, number>;
	applications: Record<string, number>;
	conversionRates: Record<string, number>;
	applicationsPerJob: Array<{ jobId: string; title: string; count: number }>;
	recruiterActivity: Array<{
		recruiterId: string;
		name: string;
		actions: number;
	}>;
}

export interface RecruiterAnalytics {
	jobsCreated: number;
	jobsPublished: number;
	applications: Record<string, number>;
	recentActivity: Array<{ action: string; timestamp: string }>;
}

export interface AuditLogEntry {
	id: string;
	actorId: string;
	actorName: string;
	action: string;
	targetId: string;
	targetType: string;
	details: string | null;
	createdAt: string;
}

// ─── Notification DTOs ─────────────────────────────────────

export interface Notification {
	id: string;
	type: string;
	title: string;
	body: string;
	read: boolean;
	metadata: Record<string, unknown> | null;
	createdAt: string;
}

export interface MarkNotificationsReadInput {
	ids?: string[];
}

// ─── Admin DTOs ────────────────────────────────────────────

export interface AdminStats {
	users: { total: number };
	companies: { total: number };
	jobs: { total: number; open: number };
	applications: { total: number; pending: number };
	notifications: { total: number; unread: number };
	generatedAt: string;
}

export interface AdminUser {
	id: string;
	userName: string;
	email: string;
	role: UserRole;
	isVerified: boolean;
	companyId: string | null;
	companyName: string | null;
	createdAt: string;
}

export interface AdminCompany {
	id: string;
	name: string;
	email: string;
	isVerified: boolean;
	ownerName: string | null;
	jobCount: number;
	createdAt: string;
}

export interface AdminJob {
	id: string;
	title: string;
	companyName: string;
	status: JobStatus;
	applicationCount: number;
	createdAt: string;
}

// ─── SuperAdmin DTOs ───────────────────────────────────────

export interface SuperAdminLoginResponse {
	message: string;
	accessToken: string;
	refreshToken: string;
	admin: SuperAdminUser;
}

export interface SuperAdminUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
}

export interface SuperAdminStats {
	companies: { total: number; verified: number };
	users: { total: number; candidates: number; recruiters: number };
	jobs: { total: number; open: number };
	applications: { total: number };
}

export interface SuperAdminCompany {
	id: string;
	name: string;
	email: string;
	isVerified: boolean;
	ownerName: string | null;
	jobCount: number;
	userCount: number;
	createdAt: string;
}

export interface SuperAdminJob {
	id: string;
	title: string;
	companyId: string;
	companyName: string;
	status: JobStatus;
	applicationCount: number;
	createdAt: string;
}

export interface SecurityEvent {
	id: string;
	companyId: string | null;
	actorId: string | null;
	eventType: string;
	severity: string;
	metadata: Record<string, unknown> | null;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
}

// ─── Tag DTOs ──────────────────────────────────────────────

export interface ListTagsParams {
	q?: string;
	limit?: number;
}
