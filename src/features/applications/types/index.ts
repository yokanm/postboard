// Application-specific types
// Backend contracts verified against Prisma schema and application service

export type ApplicationStatus =
	| "PENDING"
	| "REVIEWED"
	| "SHORTLISTED"
	| "REJECTED"
	| "ACCEPTED";

export interface ListApplicationsParams {
	cursor?: string;
	limit?: string;
	status?: string;
}

// ─── My Applications (candidate) ────────────────────────────

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
		status: string;
		locationType: string;
		experienceLevel: string;
		company: {
			id: string;
			name: string;
			logoUrl: string | null;
		};
	};
}

export interface MyApplicationsResponse {
	applications: MyApplicationItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

// ─── Job Applications (recruiter) ───────────────────────────

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

export interface ApplicationsListResponse {
	applications: ApplicationListItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

// ─── Mutations ──────────────────────────────────────────────

export interface ApplyJobInput {
	coverLetter?: string;
	resumeUrl?: string;
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

export interface UpdateApplicationStatusInput {
	status: ApplicationStatus;
	rejectionReason?: string;
}

export interface ApplicationStatusUpdated {
	id: string;
	status: ApplicationStatus;
	rejectionReason: string | null;
	updatedAt: string;
}
