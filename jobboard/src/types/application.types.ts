// src/types/application.types.ts
//
// Job application lifecycle types — candidate submission, recruiter review,
// and status machine inputs/outputs.

import type { Nullable } from "./common.types";
import type {
	ApplicationStatusType,
	ExperienceLevelType,
	JobStatusType,
	LocationTypeType,
} from "./enums";
import type { ApplicantSummary } from "./user.types";

// ─── Service input types ──────────────────────────────────────────────────────

export type ApplyInput = {
	coverLetter?: string;
	/** Direct URL if the candidate provides one in the request body */
	resumeUrl?: string;
	/** Raw file buffer from multer memoryStorage — takes priority over resumeUrl */
	fileBuffer?: Buffer;
};

export type ListApplicationsInput = {
	cursor?: string;
	limit?: string;
	/** Filter by application status */
	status?: string;
};

export type UpdateApplicationStatusInput = {
	status: ApplicationStatusType;
	/** Required when status is REJECTED */
	rejectionReason?: string;
};

// ─── Service return shapes ────────────────────────────────────────────────────

/**
 * Full application returned immediately after submission.
 * Includes job and user summaries for confirmation display.
 */
export type ApplicationSubmitted = {
	id: string;
	jobId: string;
	userId: string;
	coverLetter: Nullable<string>;
	resumeUrl: Nullable<string>;
	status: ApplicationStatusType;
	createdAt: Date;
	job: {
		id: string;
		title: string;
		companyId: string;
	};
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
};

/**
 * Returned after PATCH /applications/:id/status.
 * Lean shape — client already has the full application.
 */
export type ApplicationStatusUpdated = {
	id: string;
	status: ApplicationStatusType;
	rejectionReason: Nullable<string>;
	updatedAt: Date;
};

/**
 * Application row in the recruiter's list (GET /jobs/:id/applications).
 * Includes nested applicant with partial profile.
 */
export type ApplicationListItem = {
	id: string;
	jobId: string;
	coverLetter: Nullable<string>;
	resumeUrl: Nullable<string>;
	status: ApplicationStatusType;
	rejectionReason: Nullable<string>;
	createdAt: Date;
	updatedAt: Date;
	user: ApplicantSummary;
};

/**
 * Application row in the candidate's own history (GET /user/current/applications).
 * Includes the job with company summary — no other applicant's data.
 */
export type MyApplicationItem = {
	id: string;
	coverLetter: Nullable<string>;
	resumeUrl: Nullable<string>;
	status: ApplicationStatusType;
	rejectionReason: Nullable<string>;
	createdAt: Date;
	updatedAt: Date;
	job: {
		id: string;
		title: string;
		slug: string;
		status: JobStatusType;
		locationType: LocationTypeType;
		experienceLevel: ExperienceLevelType;
		company: {
			id: string;
			name: string;
			logoUrl: Nullable<string>;
		};
	};
};
