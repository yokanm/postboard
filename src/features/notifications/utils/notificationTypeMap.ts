export interface NotificationTypeConfig {
	label: string;
	color: string;
}

export const notificationTypeMap: Record<string, NotificationTypeConfig> = {
	APPLICATION_RECEIVED: {
		label: "Application Received",
		color: "text-(--primary)",
	},
	APPLICATION_STATUS_CHANGED: {
		label: "Status Update",
		color: "text-(--tertiary)",
	},
	JOB_POSTED: {
		label: "Job Posted",
		color: "text-(--live)",
	},
	JOB_EXPIRED: {
		label: "Job Expired",
		color: "text-(--destructive)",
	},
	SYSTEM_ALERT: {
		label: "System Alert",
		color: "text-(--error)",
	},
};

export function getNotificationTypeConfig(
	type: string,
): NotificationTypeConfig {
	return (
		notificationTypeMap[type] ?? {
			label: type
				.replace(/_/g, " ")
				.toLowerCase()
				.replace(/\b\w/g, (c) => c.toUpperCase()),
			color: "text-(--body)",
		}
	);
}
