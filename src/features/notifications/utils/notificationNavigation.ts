import type { NotificationMetadata, NotificationType } from "../types";

interface NavigationTarget {
	to: string;
	params?: Record<string, string>;
}

export function getNotificationNavigation(
	type: NotificationType,
	metadata: NotificationMetadata | null,
): NavigationTarget | null {
	if (!metadata) return null;

	switch (type) {
		case "APPLICATION_RECEIVED": {
			const m = metadata as import("../types").ApplicationReceivedMetadata;
			return {
				to: "/candidate/applications/$applicationId",
				params: { applicationId: m.applicationId },
			};
		}
		case "APPLICATION_STATUS_CHANGED": {
			const m = metadata as import("../types").ApplicationStatusChangedMetadata;
			return {
				to: "/candidate/applications/$applicationId",
				params: { applicationId: m.applicationId },
			};
		}
		case "JOB_POSTED":
		case "JOB_EXPIRED": {
			const m = metadata as
				| import("../types").JobPostedMetadata
				| import("../types").JobExpiredMetadata;
			return {
				to: "/jobs/$jobId",
				params: { jobId: m.jobId },
			};
		}
		case "SYSTEM_ALERT":
			return null;
	}
}
