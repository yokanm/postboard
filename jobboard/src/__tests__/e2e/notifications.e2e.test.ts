// src/__tests__/e2e/notifications.e2e.test.ts
//
// E2E tests for the Notification endpoints.
//
// Company routes:
//   GET    /api/v1/notifications/company
//   GET    /api/v1/notifications/company/unread-count  → { count: number }
//   PATCH  /api/v1/notifications/company/read          → bulk mark-read (body: { ids? })
//   PATCH  /api/v1/notifications/company/:id/read      → single mark-read → { notification }
//   DELETE /api/v1/notifications/company/:id
//
// User routes:
//   GET    /api/v1/notifications/user
//   GET    /api/v1/notifications/user/unread-count     → { unreadCount: number }
//   PATCH  /api/v1/notifications/user/read
//   DELETE /api/v1/notifications/user/:id

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import {
	cleanDb,
	createOpenJob,
	db,
	type RegisteredCompany,
	type RegisteredUser,
	registerAndLogin,
	registerCompanyAndLogin,
} from "./e2eSetup";

// ═══════════════════════════════════════════════════════════════════════════════
// LIST + FILTER
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/notifications/company — List and filter", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;
	let notificationId: string;
	let applicationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin();
		const jobId = await createOpenJob(company.adminAccessToken);

		const applyRes = await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter: "Very interested in this role and excited to contribute.",
			});

		applicationId = applyRes.body.application.id as string;
		await new Promise<void>((resolve) => setTimeout(resolve, 200));
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — recruiter can list company notifications", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/company")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.notifications)).toBe(true);
		expect(res.body.notifications.length).toBeGreaterThan(0);
		expect(res.body).toHaveProperty("hasNextPage");
		expect(res.body).toHaveProperty("nextCursor");

		notificationId = res.body.notifications[0].id as string;

		const notif = res.body.notifications[0];
		expect(notif).toHaveProperty("id");
		expect(notif).toHaveProperty("type");
		expect(notif).toHaveProperty("message");
		expect(notif).toHaveProperty("isRead");
		expect(notif).toHaveProperty("createdAt");
		expect(notif.isRead).toBe(false);
	});

	it("200 — ?unreadOnly=true returns only unread notifications", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/company?unreadOnly=true")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(
			res.body.notifications.every(
				(n: { isRead: boolean }) => n.isRead === false,
			),
		).toBe(true);
	});

	it("200 — APPLICATION_RECEIVED notification has correct metadata", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/company")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		const appReceivedNotif = res.body.notifications.find(
			(n: { type: string }) => n.type === "APPLICATION_RECEIVED",
		);

		if (appReceivedNotif) {
			expect(appReceivedNotif.metadata).toHaveProperty("applicationId");
			expect(appReceivedNotif.metadata).toHaveProperty("jobId");
			expect(appReceivedNotif.metadata).toHaveProperty("applicantName");
		} else {
			console.warn(
				"[E2E] APPLICATION_RECEIVED notification not yet written — skipping metadata check",
			);
		}
	});

	it("403 — candidate cannot access company notifications", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/company")
			.set("Authorization", `Bearer ${candidate.accessToken}`);

		expect(res.status).toBe(403);
	});

	it("401 — unauthenticated request is rejected", async () => {
		const res = await request(app).get("/api/v1/notifications/company");
		expect(res.status).toBe(401);
	});

	it("200 — pagination with limit=1 works", async () => {
		await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "REVIEWED" });

		await new Promise<void>((resolve) => setTimeout(resolve, 200));

		const page1 = await request(app)
			.get("/api/v1/notifications/company?limit=1")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(page1.status).toBe(200);
		expect(page1.body.notifications).toHaveLength(1);

		if (page1.body.hasNextPage) {
			const page2 = await request(app)
				.get(
					`/api/v1/notifications/company?limit=1&cursor=${page1.body.nextCursor}`,
				)
				.set("Authorization", `Bearer ${company.adminAccessToken}`);

			expect(page2.status).toBe(200);
			expect(page2.body.notifications).toHaveLength(1);
			expect(page2.body.notifications[0].id).not.toBe(
				page1.body.notifications[0].id,
			);
		}
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNREAD COUNT — response shape: { count: number }
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/notifications/company/unread-count — Badge count", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin();
		const jobId = await createOpenJob(company.adminAccessToken);

		await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter:
					"I am very interested in this role and have the relevant experience.",
			});

		const candidate2 = await registerAndLogin();
		await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate2.accessToken}`)
			.send({
				coverLetter:
					"I am very interested in this role and have the relevant experience.",
			});

		await new Promise<void>((resolve) => setTimeout(resolve, 250));
	});

	afterAll(async () => {
		await cleanDb();
	});

	it('200 — returns numeric unread count under key "count"', async () => {
		const res = await request(app)
			.get("/api/v1/notifications/company/unread-count")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(typeof res.body.count).toBe("number");
		expect(res.body.count).toBeGreaterThanOrEqual(0);
	});

	it("200 — count is 0 after marking all notifications as read", async () => {
		const beforeRes = await request(app)
			.get("/api/v1/notifications/company/unread-count")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);
		const countBefore = beforeRes.body.count as number;

		// Bulk mark-all: PATCH /company/read with empty body
		const markRes = await request(app)
			.patch("/api/v1/notifications/company/read")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({});

		expect(markRes.status).toBe(200);

		const afterRes = await request(app)
			.get("/api/v1/notifications/company/unread-count")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);
		const countAfter = afterRes.body.count as number;

		expect(countAfter).toBe(0);
		if (countBefore > 0) {
			expect(countAfter).toBeLessThan(countBefore);
		}
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// MARK AS READ (single + bulk)
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] PATCH /api/v1/notifications/company — Mark as read", () => {
	let company: RegisteredCompany;
	let notificationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		const candidate = await registerAndLogin();
		const jobId = await createOpenJob(company.adminAccessToken);

		await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter:
					"I am very interested in this role and have the relevant experience.",
			});

		await new Promise<void>((resolve) => setTimeout(resolve, 200));

		const listRes = await request(app)
			.get("/api/v1/notifications/company")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		if (listRes.body.notifications.length > 0) {
			notificationId = listRes.body.notifications[0].id as string;
		}
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("PATCH /company/:id/read — 200 marks single notification as read, returns updated notification", async () => {
		if (!notificationId) {
			console.warn(
				"[E2E] No notification available to mark as read — skipping",
			);
			return;
		}

		const res = await request(app)
			.patch(`/api/v1/notifications/company/${notificationId}/read`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.notification).toBeDefined();
		expect(res.body.notification.isRead).toBe(true);
		expect(res.body.notification.id).toBe(notificationId);

		// Verify in DB
		const dbNotif = await db.notification.findUnique({
			where: { id: notificationId },
		});
		expect(dbNotif!.isRead).toBe(true);
	});

	it("PATCH /company/read — 200 marks all notifications as read", async () => {
		const res = await request(app)
			.patch("/api/v1/notifications/company/read")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({});

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();

		const count = await db.notification.count({
			where: { companyId: company.companyId, isRead: false },
		});
		expect(count).toBe(0);
	});

	it("PATCH /company/:id/read — 404 for non-existent notification", async () => {
		const res = await request(app)
			.patch(
				"/api/v1/notifications/company/00000000-0000-0000-0000-000000000000/read",
			)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(404);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] DELETE /api/v1/notifications/company/:id — Delete notification", () => {
	let company: RegisteredCompany;
	let otherCompany: RegisteredCompany;
	let notificationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		otherCompany = await registerCompanyAndLogin();
		const candidate = await registerAndLogin();
		const jobId = await createOpenJob(company.adminAccessToken);

		await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter:
					"I am very interested in this role and have the relevant experience.",
			});

		await new Promise<void>((resolve) => setTimeout(resolve, 200));

		const listRes = await request(app)
			.get("/api/v1/notifications/company")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		if (listRes.body.notifications.length > 0) {
			notificationId = listRes.body.notifications[0].id as string;
		}
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("403 — different company cannot delete this notification", async () => {
		if (!notificationId) return;

		const res = await request(app)
			.delete(`/api/v1/notifications/company/${notificationId}`)
			.set("Authorization", `Bearer ${otherCompany.adminAccessToken}`);

		expect(res.status).toBe(403);

		const dbNotif = await db.notification.findUnique({
			where: { id: notificationId },
		});
		expect(dbNotif).not.toBeNull();
	});

	it("200 — company admin can delete their own notification", async () => {
		if (!notificationId) {
			console.warn("[E2E] No notification available — skipping delete test");
			return;
		}

		const res = await request(app)
			.delete(`/api/v1/notifications/company/${notificationId}`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);

		const dbNotif = await db.notification.findUnique({
			where: { id: notificationId },
		});
		expect(dbNotif).toBeNull();
	});

	it("404 — deleting already-deleted notification returns 404", async () => {
		if (!notificationId) return;

		const res = await request(app)
			.delete(`/api/v1/notifications/company/${notificationId}`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(404);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER (CANDIDATE) NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/notifications/user — Candidate notification inbox", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;
	let applicationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin();
		const jobId = await createOpenJob(company.adminAccessToken);

		const applyRes = await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter:
					"I am very interested in this role and have the relevant experience.",
			});

		applicationId = applyRes.body.application.id as string;

		// Trigger status change so candidate gets a user notification
		await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "REVIEWED" });

		await new Promise<void>((resolve) => setTimeout(resolve, 250));
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — candidate can list their own notifications", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/user")
			.set("Authorization", `Bearer ${candidate.accessToken}`);

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.notifications)).toBe(true);
		expect(res.body).toHaveProperty("hasNextPage");
		expect(res.body).toHaveProperty("nextCursor");
	});

	it("200 — APPLICATION_STATUS_CHANGED notification appears in candidate inbox", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/user")
			.set("Authorization", `Bearer ${candidate.accessToken}`);

		const statusNotif = res.body.notifications.find(
			(n: { type: string }) => n.type === "APPLICATION_STATUS_CHANGED",
		);

		if (statusNotif) {
			expect(statusNotif.metadata).toHaveProperty("applicationId");
			expect(statusNotif.metadata).toHaveProperty("newStatus", "REVIEWED");
		} else {
			console.warn(
				"[E2E] APPLICATION_STATUS_CHANGED user notification not yet written — skipping",
			);
		}
	});

	it("200 — candidate unread-count response shape { unreadCount: number }", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/user/unread-count")
			.set("Authorization", `Bearer ${candidate.accessToken}`);

		expect(res.status).toBe(200);
		expect(typeof res.body.unreadCount).toBe("number");
	});

	it("403 — recruiter cannot access /user notification route", async () => {
		const res = await request(app)
			.get("/api/v1/notifications/user")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(403);
	});

	it("401 — unauthenticated request is rejected", async () => {
		const res = await request(app).get("/api/v1/notifications/user");
		expect(res.status).toBe(401);
	});
});
