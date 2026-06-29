export type NotificationType =
	| "APPLICATION_RECEIVED"
	| "APPLICATION_STATUS_CHANGED"
	| "JOB_POSTED"
	| "JOB_EXPIRED"
	| "SYSTEM_ALERT";

export interface NotificationItem {
	id: string;
	type: NotificationType;
	message: string;
	metadata: NotificationMetadata | null;
	isRead: boolean;
	createdAt: string;
}

export interface NotificationListResponse {
	notifications: NotificationItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface UnreadCountResponse {
	unreadCount: number;
}

export interface CompanyUnreadCountResponse {
	count: number;
}

export interface MarkReadResponse {
	message: string;
}

export type NotificationMetadata =
	| ApplicationReceivedMetadata
	| ApplicationStatusChangedMetadata
	| JobPostedMetadata
	| JobExpiredMetadata
	| SystemAlertMetadata;

export interface ApplicationReceivedMetadata {
	jobId: string;
	applicationId: string;
	applicantName: string;
}

export interface ApplicationStatusChangedMetadata {
	jobId: string;
	applicationId: string;
	candidateName: string;
	newStatus: string;
	rejectionReason?: string;
}

export interface JobPostedMetadata {
	jobId: string;
	jobTitle: string;
}

export interface JobExpiredMetadata {
	jobId: string;
	jobTitle: string;
}

export interface SystemAlertMetadata {
	message: string;
}

export interface MarkReadPayload {
	ids?: string[];
}
