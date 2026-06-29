// src/queues/index.ts

import { Queue } from "bullmq";
import { createBullConnection } from "@/lib/redis";
import logger from "@/lib/winston";

import type {
	ApplicationReceivedPayload,
	ApplicationStatusChangedPayload,
	EmailJobData,
} from "@/types";

// ─── Email queue ───────────────────────────────────────────────────────────────

export const emailQueue = new Queue<EmailJobData>("email-queue", {
	connection: createBullConnection,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 2000,
		},
		removeOnComplete: { count: 500 },
		removeOnFail: { count: 1000 },
	},
});

// ─── Producer helpers ─────────────────────────────────────────────────────────

export const enqueueApplicationReceivedEmail = async (
	payload: ApplicationReceivedPayload & {
		recruiterEmail: string;
		recruiterName: string;
	},
): Promise<void> => {
	logger.info("[QUEUE] enqueue called", {
		type: "application-received",
		applicationId: payload.applicationId,
		to: payload.recruiterEmail,
	});

	const job = await emailQueue.add(
		"application-received",
		{
			type: "application-received",
			to: payload.recruiterEmail,
			recruiterName: payload.recruiterName,
			applicantName: payload.applicantName,
			jobTitle: payload.jobTitle,
			jobId: payload.jobId,
			applicationId: payload.applicationId,
			companyId: payload.companyId,
		} satisfies EmailJobData,
		{
			deduplication: {
				id: `app-recv:${payload.applicationId}`,
			},
		},
	);

	logger.info("[QUEUE] job added", {
		type: "application-received",
		jobId: job.id,
		applicationId: payload.applicationId,
	});
};

export const enqueueApplicationStatusEmail = async (
	payload: ApplicationStatusChangedPayload & {
		candidateEmail: string;
	},
): Promise<void> => {
	logger.info("[QUEUE] enqueue called", {
		type: "application-status-changed",
		applicationId: payload.applicationId,
		newStatus: payload.newStatus,
		to: payload.candidateEmail,
	});

	const job = await emailQueue.add(
		"application-status-changed",
		{
			type: "application-status-changed",
			to: payload.candidateEmail,
			candidateName: payload.candidateName,
			jobTitle: payload.jobTitle,
			newStatus: payload.newStatus,
			rejectionReason: payload.rejectionReason ?? undefined,
			jobId: payload.jobId,
			applicationId: payload.applicationId,
			companyId: payload.companyId,
		} satisfies EmailJobData,
		{
			deduplication: {
				id: `app-status:${payload.applicationId}:${payload.newStatus}`,
			},
		},
	);

	logger.info("[QUEUE] job added", {
		type: "application-status-changed",
		jobId: job.id,
		applicationId: payload.applicationId,
		newStatus: payload.newStatus,
	});
};

export const enqueueJobExpiredEmail = async (
	companyEmail: string,
	companyName: string,
	jobId: string,
	jobTitle: string,
	companyId: string,
): Promise<void> => {
	logger.info("[QUEUE] enqueue called", {
		type: "job-expired",
		jobId,
		to: companyEmail,
	});

	const job = await emailQueue.add(
		"job-expired",
		{
			type: "job-expired",
			to: companyEmail,
			companyName,
			jobTitle,
			jobId,
			companyId,
		} satisfies EmailJobData,
		{
			deduplication: {
				id: `job-expired:${jobId}`,
			},
		},
	);

	logger.info("[QUEUE] job added", {
		type: "job-expired",
		jobId: job.id,
		forJob: jobId,
	});
};
