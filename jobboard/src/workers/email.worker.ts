// src/workers/email.worker.ts
// BullMQ worker that consumes from 'email-queue' and sends emails via Resend.
//
// DESIGN:
//   - One worker processes jobs concurrently (concurrency: 5)
//   - Each job type maps to a typed handler function
//   - On permanent failure (after all retries) the job moves to the DLQ
//   - Bull Board (Phase 7 monitoring) reads queue stats from the same Redis connection
//
// TO START:
//   Run this file separately from the main API process:
//     npx ts-node -r tsconfig-paths/register src/workers/email.worker.ts
//   OR add it as a second Dockerfile CMD / docker-compose service (Phase 9).

import "dotenv/config";
import { type Job, Worker } from "bullmq";
import config from "@/config";
import { sendEmail } from "@/lib/email";
import { createBullConnection } from "@/lib/redis";
import logger from "@/lib/winston";

import type {
	ApplicationReceivedEmailJob,
	ApplicationStatusChangedEmailJob,
	EmailJobData,
	JobExpiredEmailJob,
} from "@/types";

// ─── Email templates ───────────────────────────────────────────────────────────

const applicationReceivedHtml = (d: ApplicationReceivedEmailJob) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1a1a1a">
  <h2>New Application Received</h2>
  <p>Hi ${d.recruiterName},</p>
  <p><strong>${d.applicantName}</strong> has applied for the position <strong>"${d.jobTitle}"</strong>.</p>
  <a href="${config.FRONTEND_URL}/recruiter/applications/${d.applicationId}"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1D9E75;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
    Review Application
  </a>
  <p style="color:#666;font-size:13px">Log in to your recruiter dashboard to review all applications.</p>
</body>
</html>
`;

const applicationStatusChangedHtml = (d: ApplicationStatusChangedEmailJob) => {
	const statusMessages: Record<string, string> = {
		REVIEWED: "Your application has been reviewed by the hiring team.",
		SHORTLISTED:
			"Congratulations! You have been shortlisted for the next stage.",
		ACCEPTED: "Congratulations! Your application has been accepted.",
		REJECTED:
			"Unfortunately, your application was not selected to move forward.",
	};

	return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1a1a1a">
  <h2>Application Update</h2>
  <p>Hi ${d.candidateName},</p>
  <p>Your application for <strong>"${d.jobTitle}"</strong> has been updated.</p>
  <p><strong>Status: ${d.newStatus}</strong></p>
  <p>${statusMessages[d.newStatus] ?? ""}</p>
  ${d.rejectionReason ? `<p style="color:#666;font-size:13px">Feedback: ${d.rejectionReason}</p>` : ""}
  <a href="${config.FRONTEND_URL}/candidate/applications"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1D9E75;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
    View My Applications
  </a>
</body>
</html>
`;
};

const jobExpiredHtml = (d: JobExpiredEmailJob) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;color:#1a1a1a">
  <h2>Job Listing Expired</h2>
  <p>Hi ${d.companyName} team,</p>
  <p>Your job listing <strong>"${d.jobTitle}"</strong> has expired and is no longer visible to candidates.</p>
  <a href="${config.FRONTEND_URL}/recruiter/jobs/${d.jobId}"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1D9E75;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
    Repost Job
  </a>
  <p style="color:#666;font-size:13px">You can reopen or repost this listing from your dashboard.</p>
</body>
</html>
`;

// ─── Job handlers ─────────────────────────────────────────────────────────────

const handlers: Record<string, (data: EmailJobData) => Promise<void>> = {
	"application-received": async (data) => {
		const d = data as ApplicationReceivedEmailJob;
		await sendEmail({
			to: d.to,
			subject: `New application: ${d.applicantName} for "${d.jobTitle}"`,
			html: applicationReceivedHtml(d),
		});
	},

	"application-status-changed": async (data) => {
		const d = data as ApplicationStatusChangedEmailJob;
		await sendEmail({
			to: d.to,
			subject: `Application update: ${d.jobTitle} — ${d.newStatus}`,
			html: applicationStatusChangedHtml(d),
		});
	},

	"job-expired": async (data) => {
		const d = data as JobExpiredEmailJob;
		await sendEmail({
			to: d.to,
			subject: `Your job listing "${d.jobTitle}" has expired`,
			html: jobExpiredHtml(d),
		});
	},
};

// ─── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker<EmailJobData>(
	"email-queue",
	async (job: Job<EmailJobData>) => {
		const handler = handlers[job.name];

		if (!handler) {
			logger.warn("[WORKER] unknown job name — skipping", {
				jobName: job.name,
				jobId: job.id,
			});
			return;
		}

		logger.info("[WORKER] processing job", {
			jobName: job.name,
			jobId: job.id,
			to: job.data.to,
		});

		await handler(job.data);

		logger.info("[WORKER] email sent", {
			jobName: job.name,
			jobId: job.id,
			to: job.data.to,
		});
	},
	{
		connection: createBullConnection,
		concurrency: 5,
	},
);

// ─── Worker lifecycle ──────────────────────────────────────────────────────────

worker.on("completed", (job) => {
	logger.info("[WORKER] job completed", {
		jobId: job.id,
		jobName: job.name,
		attempts: job.attemptsMade,
	});
});

worker.on("failed", (job, err) => {
	logger.error("[WORKER] job failed", {
		jobId: job?.id,
		jobName: job?.name,
		attempts: job?.attemptsMade,
		error: err instanceof Error ? err.message : String(err),
		stack: err instanceof Error ? err.stack : undefined,
	});
});

worker.on("error", (err) => {
	logger.error("[WORKER] worker-level error", {
		error: err instanceof Error ? err.message : String(err),
		stack: err instanceof Error ? err.stack : undefined,
	});
});

logger.info('Email worker started — listening on "email-queue"');

// Graceful shutdown
const shutdown = async () => {
	await worker.close();
	logger.info("Email worker: shut down gracefully");
	process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
