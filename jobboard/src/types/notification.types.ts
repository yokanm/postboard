// src/types/notification.types.ts  — PHASE 8 ADDITIONS
// Add these to the existing notification.types.ts file.
// The full updated file is shown here.

// ─── Notification DB payload types ────────────────────────────────────────────

export type ApplicationReceivedPayload = {
	companyId: string;
	jobId: string;
	jobTitle: string;
	applicantName: string;
	applicationId: string;
};

export type ApplicationStatusChangedPayload = {
	companyId: string;
	jobId: string;
	jobTitle: string;
	applicationId: string;
	candidateName: string;
	newStatus: string;
	rejectionReason?: string | null;
};

// ─── Phase 8: User-targeted notification payload ───────────────────────────────

export type UserNotificationPayload = {
	userId: string;
	type: string;
	message: string;
	metadata?: Record<string, unknown>;
};

// ─── Notification DB row ───────────────────────────────────────────────────────

export type NotificationRow = {
	id: string;
	type: string;
	message: string;
	metadata: NotificationMetadata | null;
	isRead: boolean;
	companyId: string | null;
	userId: string | null;
	createdAt: Date;
};

export type NotificationMetadata =
	| ApplicationReceivedMetadata
	| ApplicationStatusChangedMetadata
	| JobPostedMetadata
	| JobExpiredMetadata
	| SystemAlertMetadata;

export type ApplicationReceivedMetadata = {
	jobId: string;
	applicationId: string;
	applicantName: string;
};

export type ApplicationStatusChangedMetadata = {
	jobId: string;
	applicationId: string;
	candidateName: string;
	newStatus: string;
	rejectionReason?: string;
};

export type JobPostedMetadata = { jobId: string; jobTitle: string };
export type JobExpiredMetadata = { jobId: string; jobTitle: string };
export type SystemAlertMetadata = { message: string };

// ─── Admin audit log ──────────────────────────────────────────────────────────

export type AuditLogEntry = {
	id: string;
	actorId: string;
	action: string;
	targetType: string;
	targetId: string;
	metadata: Record<string, unknown> | null;
	createdAt: Date;
};

export type AuditAction =
	| "DELETE_JOB"
	| "DELETE_USER"
	| "DELETE_COMPANY"
	| "CHANGE_ROLE"
	| "REMOVE_TEAM_MEMBER"
	| "FORCE_CLOSE_JOB"
	| "REJECT_APPLICATION"
	| "BULK_EXPIRE_JOBS";

export type AuditTargetType = "USER" | "JOB" | "COMPANY" | "APPLICATION";

// ─── BullMQ email job data ─────────────────────────────────────────────────────

export type EmailJobData =
	| ApplicationReceivedEmailJob
	| ApplicationStatusChangedEmailJob
	| JobExpiredEmailJob;

export type ApplicationReceivedEmailJob = {
	type: "application-received";
	to: string;
	recruiterName: string;
	applicantName: string;
	jobTitle: string;
	jobId: string;
	applicationId: string;
	companyId: string;
};

export type ApplicationStatusChangedEmailJob = {
	type: "application-status-changed";
	to: string;
	candidateName: string;
	jobTitle: string;
	newStatus: string;
	rejectionReason?: string;
	jobId: string;
	applicationId: string;
	companyId: string;
};

export type JobExpiredEmailJob = {
	type: "job-expired";
	to: string;
	companyName: string;
	jobTitle: string;
	jobId: string;
	companyId: string;
};
