import type { ApplicationStatus as JobAppStatus } from "@/features/jobs/types";

export type ApplicationStatus = JobAppStatus;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
	PENDING: "Applied",
	REVIEWED: "Under Review",
	SHORTLISTED: "Shortlisted",
	REJECTED: "Rejected",
	ACCEPTED: "Hired",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
	PENDING: "text-(--amber)",
	REVIEWED: "text-(--blue)",
	SHORTLISTED: "text-(--purple)",
	REJECTED: "text-(--destructive)",
	ACCEPTED: "text-(--green)",
};

export interface RecruiterAnalytics {
	jobsCreated: number;
	jobsPublished: number;
	applications: {
		total: number;
		pending: number;
		reviewed: number;
		shortlisted: number;
		rejected: number;
		accepted: number;
	};
	recentActivity: Array<{
		id: string;
		type: string;
		message: string;
		createdAt: string;
	}>;
}

export interface RecruiterNotification {
	id: string;
	title: string;
	message: string;
	isRead: boolean;
	type: string;
	link: string | null;
	createdAt: string;
}
