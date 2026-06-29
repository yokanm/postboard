import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import type {
	ApplicationReceivedPayload,
	ApplicationStatusChangedPayload,
} from "@/types/notification.types";
import type { NotificationType } from "../../generated/prisma/client";

// Re-export so Phase 7 workers can import arg types from here
export type { ApplicationReceivedPayload, ApplicationStatusChangedPayload };

// ─── APPLICATION_RECEIVED ─────────────────────────────────────────────────────

export const notifyApplicationReceived = async (
	payload: ApplicationReceivedPayload,
): Promise<void> => {
	try {
		await prisma.notification.create({
			data: {
				type: "APPLICATION_RECEIVED" as NotificationType,
				message: `New application from ${payload.applicantName} for "${payload.jobTitle}"`,
				metadata: {
					jobId: payload.jobId,
					applicationId: payload.applicationId,
					applicantName: payload.applicantName,
				},
				companyId: payload.companyId,
			},
		});
		logger.debug("Notification: APPLICATION_RECEIVED", {
			applicationId: payload.applicationId,
		});
	} catch (error) {
		logger.error("notifyApplicationReceived error", error);
	}
};

// ─── APPLICATION_STATUS_CHANGED ───────────────────────────────────────────────

export const notifyApplicationStatusChanged = async (
	payload: ApplicationStatusChangedPayload,
): Promise<void> => {
	try {
		await prisma.notification.create({
			data: {
				type: "APPLICATION_STATUS_CHANGED" as NotificationType,
				message: `Application from ${payload.candidateName} for "${payload.jobTitle}" is now ${payload.newStatus}`,
				metadata: {
					jobId: payload.jobId,
					applicationId: payload.applicationId,
					candidateName: payload.candidateName,
					newStatus: payload.newStatus,
					...(payload.rejectionReason && {
						rejectionReason: payload.rejectionReason,
					}),
				},
				companyId: payload.companyId,
			},
		});
		logger.debug("Notification: APPLICATION_STATUS_CHANGED", {
			applicationId: payload.applicationId,
			status: payload.newStatus,
		});
	} catch (error) {
		logger.error("notifyApplicationStatusChanged error", error);
	}
};

// ─── JOB_POSTED ───────────────────────────────────────────────────────────────
// Called from createJobService when a job transitions to OPEN status.
// Optional — useful for internal dashboards and Phase 7 email summaries.

export const notifyJobPosted = async (
	companyId: string,
	jobId: string,
	jobTitle: string,
): Promise<void> => {
	try {
		await prisma.notification.create({
			data: {
				type: "JOB_POSTED" as NotificationType,
				message: `Job "${jobTitle}" is now live and accepting applications.`,
				metadata: { jobId, jobTitle },
				companyId,
			},
		});
	} catch (error) {
		logger.error("notifyJobPosted error", error);
	}
};
