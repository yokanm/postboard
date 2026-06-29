// ─── Enums ─────────────────────────────────────────────────

export type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
export type LocationType = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevel = "JUNIOR" | "MID" | "SENIOR" | "LEAD";
export type ApplicationStatus =
	| "PENDING"
	| "REVIEWED"
	| "SHORTLISTED"
	| "REJECTED"
	| "ACCEPTED";

// ─── Shared refs ───────────────────────────────────────────

export interface TagRef {
	name: string;
	slug: string;
}

export interface TagFull {
	id: string;
	name: string;
	slug: string;
}

export interface TagWithCount extends TagFull {
	_count: { jobs: number };
}

export interface CompanyRef {
	id: string;
	name: string;
	slug: string;
	logoUrl: string | null;
}

export interface CompanyDetailRef extends CompanyRef {
	website: string | null;
	industry: string | null;
}

export interface PostedByRef {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
}

// ─── Job shapes ─────────────────────────────────────────────

export interface VerifiableCompany {
	isVerified?: boolean;
}

export interface JobSummary {
	id: string;
	title: string;
	slug: string;
	location: string | null;
	locationType: LocationType;
	salaryMin: number | null;
	salaryMax: number | null;
	currency: string;
	status: JobStatus;
	experienceLevel: ExperienceLevel;
	expiresAt: string | null;
	createdAt: string;
	company: CompanyRef & { industry?: string | null } & VerifiableCompany;
	tags: Array<{ tag: TagRef }>;
	_count?: { applications: number };
}

export interface JobDetail {
	id: string;
	title: string;
	slug: string;
	description: string;
	location: string | null;
	locationType: LocationType;
	salaryMin: number | null;
	salaryMax: number | null;
	currency: string;
	status: JobStatus;
	experienceLevel: ExperienceLevel;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
	company: CompanyDetailRef;
	tags: Array<{ tag: TagFull }>;
	postedBy: PostedByRef;
}

// ─── Request / input types ──────────────────────────────────

export interface CreateJobInput {
	title: string;
	description: string;
	location?: string;
	locationType?: LocationType;
	experienceLevel?: ExperienceLevel;
	salaryMin?: number;
	salaryMax?: number;
	currency?: string;
	tags?: string[];
	expiresAt?: string;
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface UpdateJobStatusInput {
	status: "OPEN" | "CLOSED";
}

export interface ListJobsParams {
	cursor?: string;
	limit?: string;
	status?: string;
	locationType?: string;
	experienceLevel?: string;
	companyId?: string;
	keyword?: string;
	search?: string;
	sortBy?: "newest" | "oldest" | "salary_high" | "salary_low";
	salaryMin?: string;
	salaryMax?: string;
}

export interface ListApplicationsParams {
	cursor?: string;
	limit?: string;
	status?: string;
}

export interface ListTagsParams {
	q?: string;
	limit?: string;
}

// ─── Application shapes ─────────────────────────────────────

export interface ApplicantSummary {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		resumeUrl: string | null;
		skills: string[];
		location: string | null;
	} | null;
}

export interface ApplicationListItem {
	id: string;
	jobId: string;
	coverLetter: string | null;
	resumeUrl: string | null;
	status: ApplicationStatus;
	rejectionReason: string | null;
	createdAt: string;
	updatedAt: string;
	user: ApplicantSummary;
}

export interface MyApplicationItem {
	id: string;
	coverLetter: string | null;
	resumeUrl: string | null;
	status: ApplicationStatus;
	rejectionReason: string | null;
	createdAt: string;
	updatedAt: string;
	job: {
		id: string;
		title: string;
		slug: string;
		status: JobStatus;
		locationType: LocationType;
		experienceLevel: ExperienceLevel;
		company: {
			id: string;
			name: string;
			logoUrl: string | null;
		};
	};
}

export interface ApplicationSubmitted {
	id: string;
	jobId: string;
	userId: string;
	coverLetter: string | null;
	resumeUrl: string | null;
	status: ApplicationStatus;
	createdAt: string;
	job: { id: string; title: string; companyId: string };
	user: { id: string; firstName: string; lastName: string; email: string };
}

export interface ApplicationStatusUpdated {
	id: string;
	status: ApplicationStatus;
	rejectionReason: string | null;
	updatedAt: string;
}

export interface UpdateApplicationStatusInput {
	status: ApplicationStatus;
	rejectionReason?: string;
}

// ─── Company shapes ─────────────────────────────────────────

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
	_count: { jobs: number; users: number };
}

export interface CompanyUpdated {
	id: string;
	name: string;
	slug: string;
	email: string;
	logoUrl: string | null;
	website: string | null;
	industry: string | null;
	size: string | null;
	isVerified: boolean;
	updatedAt: string;
}

export interface UpdateCompanyInput {
	name?: string;
	website?: string;
	industry?: string;
	size?: string;
}

// ─── Paginated responses ────────────────────────────────────

export interface JobsListResponse {
	jobs: JobSummary[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface ApplicationsListResponse {
	applications: ApplicationListItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface MyApplicationsResponse {
	applications: MyApplicationItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface TagsListResponse {
	tags: TagWithCount[];
}

// ─── Apply input ────────────────────────────────────────────

export interface ApplyJobInput {
	coverLetter?: string;
	resumeUrl?: string;
}

// ─── Saved jobs (local only — no backend) ───────────────────

export interface SavedJobEntry {
	jobId: string;
	savedAt: string;
}

// ─── Admin job types ────────────────────────────────────────

export interface AdminJobListResponse {
	jobs: JobSummary[];
	nextCursor: string | null;
	hasNextPage: boolean;
}
