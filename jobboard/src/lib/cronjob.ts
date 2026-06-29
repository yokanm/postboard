import { CronJob } from "cron";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { enqueueJobExpiredEmail } from "@/queues";

export const startExpireJobsCron = (): void => {
	// Every day at 00:05 server time — gives a 5-minute buffer after midnight
	const job = new CronJob("5 0 * * *", async () => {
		try {
			// PATCH (BUG-8): added `company` include so we have the email address
			// and display name required by enqueueJobExpiredEmail().
			const expiring = await prisma.job.findMany({
				where: {
					status: "OPEN",
					deletedAt: null,
					expiresAt: { lt: new Date() },
				},
				select: {
					id: true,
					companyId: true,
					title: true,
					company: {
						select: { email: true, name: true },
					},
				},
			});

			if (expiring.length === 0) return;

			// Batch-expire in a transaction alongside notification writes
			await prisma.$transaction([
				prisma.job.updateMany({
					where: { id: { in: expiring.map((j) => j.id) } },
					data: { status: "EXPIRED" },
				}),
				// Create one JOB_EXPIRED notification per job (company dashboard inbox)
				...expiring.map((j) =>
					prisma.notification.create({
						data: {
							type: "JOB_EXPIRED",
							message: `Job "${j.title}" has expired and is no longer visible to candidates.`,
							metadata: { jobId: j.id, jobTitle: j.title },
							companyId: j.companyId,
						},
					}),
				),
			]);

			logger.info(`Cron: expired ${expiring.length} job(s)`, {
				jobIds: expiring.map((j) => j.id),
			});

			// PATCH (BUG-7): was missing entirely.
			// Enqueue one expiry notification email per expired job.
			// Promise.allSettled so a single enqueue failure doesn't abort the rest.
			const results = await Promise.allSettled(
				expiring.map((j) =>
					enqueueJobExpiredEmail(
						j.company.email,
						j.company.name,
						j.id,
						j.title,
						j.companyId,
					),
				),
			);

			const failed = results.filter((r) => r.status === "rejected");
			if (failed.length > 0) {
				logger.error(
					`Cron: ${failed.length} job-expired email(s) failed to enqueue`,
					{
						errors: failed.map((r) =>
							r.status === "rejected"
								? r.reason instanceof Error
									? r.reason.message
									: String(r.reason)
								: null,
						),
					},
				);
			}
		} catch (error) {
			logger.error("Cron: expireJobs failed", error);
		}
	});

	job.start();
	logger.info("Cron: expireJobs scheduled (daily at 00:05)");
};
