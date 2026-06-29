// src/seeds/index.ts
//
// Development / load-test seed.
// Creates: 10 companies, 50 users, 8 tags, 100 jobs, ~100 applications.
//
// Prerequisites:
//   npm install --save-dev @faker-js/faker
//
// Usage:
//   npx tsx -r tsconfig-paths/register src/seeds/index.ts
//
// Package.json shortcut:
//   "db:seed":  "tsx -r tsconfig-paths/register src/seeds/index.ts"
//   "db:reset": "npx prisma migrate reset --force && npm run db:seed"

import "dotenv/config";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import config from "@/config";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${config.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

// All seeded accounts share this password for easy testing
const SEED_PASSWORD = "Seed@Password1";

async function main() {
	console.log("🌱 Seeding database...\n");

	const hashedPassword = await argon2.hash(SEED_PASSWORD, {
		type: argon2.argon2id,
		memoryCost: 65536,
		timeCost: 3,
		parallelism: 1,
	});

	// ─── 1. Companies ───────────────────────────────────────────────────────────
	const companies = [];
	for (let i = 0; i < 10; i++) {
		const name = `${faker.company.name()} ${i}`; // suffix keeps names unique
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const company = await prisma.company.upsert({
			where: { email: `company${i}@seed.test` },
			update: {},
			create: {
				name,
				slug,
				email: `company${i}@seed.test`,
				password: hashedPassword,
				industry: faker.helpers.arrayElement([
					"Technology",
					"Finance",
					"Healthcare",
					"Education",
					"Retail",
				]),
				isVerified: i < 7, // 7 verified, 3 unverified
				website: faker.internet.url(),
				size: faker.helpers.arrayElement([
					"1-10",
					"11-50",
					"51-200",
					"201-500",
					"500+",
				]),
			},
		});
		companies.push(company);
	}
	console.log(`  ✅ ${companies.length} companies`);

	// ─── 2. Users ───────────────────────────────────────────────────────────────
	const users = [];
	for (let i = 0; i < 50; i++) {
		// i=0,1 → ADMIN; i=2..14 → RECRUITER; rest → CANDIDATE
		const role = i < 2 ? "ADMIN" : i < 15 ? "RECRUITER" : "CANDIDATE";
		const company =
			role !== "CANDIDATE" ? companies[i % companies.length] : null;

		const user = await prisma.user.upsert({
			where: { email: `user${i}@seed.test` },
			update: {},
			create: {
				email: `user${i}@seed.test`,
				password: hashedPassword,
				userName: `user_${i}`,
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				role: role as "ADMIN" | "RECRUITER" | "CANDIDATE",
				isVerified: true,
				companyId: company?.id ?? null,
			},
		});
		users.push(user);
	}
	console.log(`  ✅ ${users.length} users`);

	// ─── 3. User profiles for candidates ────────────────────────────────────────
	const candidates = users.filter((u) => u.role === "CANDIDATE");
	for (const candidate of candidates) {
		await prisma.userProfile.upsert({
			where: { userId: candidate.id },
			update: {},
			create: {
				userId: candidate.id,
				bio: faker.lorem.paragraph(),
				skills: faker.helpers.arrayElements(
					[
						"React",
						"Node.js",
						"TypeScript",
						"Python",
						"SQL",
						"Docker",
						"AWS",
						"GraphQL",
					],
					{ min: 2, max: 5 },
				),
				location: faker.location.city(),
				linkedinUrl: `https://linkedin.com/in/user${candidate.id.slice(0, 6)}`,
			},
		});
	}
	console.log(`  ✅ ${candidates.length} user profiles`);

	// ─── 4. Tags ────────────────────────────────────────────────────────────────
	const tagNames = [
		"React",
		"Node.js",
		"TypeScript",
		"Python",
		"PostgreSQL",
		"Docker",
		"AWS",
		"Remote",
	];
	const tags = await Promise.all(
		tagNames.map((name) =>
			prisma.tag.upsert({
				where: { name },
				update: {},
				create: {
					name,
					slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
				},
			}),
		),
	);
	console.log(`  ✅ ${tags.length} tags`);

	// ─── 5. Jobs ────────────────────────────────────────────────────────────────
	const recruiters = users.filter((u) => u.role === "RECRUITER");
	const jobs = [];

	for (let i = 0; i < 100; i++) {
		const company = companies[i % companies.length];
		// Recruiter must belong to the same company
		const recruiter =
			recruiters.find((r) => r.companyId === company.id) ?? recruiters[0];
		const status = faker.helpers.weightedArrayElement([
			{ weight: 6, value: "OPEN" },
			{ weight: 2, value: "CLOSED" },
			{ weight: 1, value: "DRAFT" },
			{ weight: 1, value: "EXPIRED" },
		]);

		const title = faker.person.jobTitle();
		const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`;

		const selectedTags = faker.helpers.arrayElements(tags, { min: 1, max: 4 });

		const job = await prisma.job.create({
			data: {
				title,
				slug,
				description: faker.lorem.paragraphs(3),
				companyId: company.id,
				postedById: recruiter!.id,
				status: status as "OPEN" | "CLOSED" | "DRAFT" | "EXPIRED",
				locationType: faker.helpers.arrayElement([
					"REMOTE",
					"ONSITE",
					"HYBRID",
				]),
				experienceLevel: faker.helpers.arrayElement([
					"JUNIOR",
					"MID",
					"SENIOR",
					"LEAD",
				]),
				salaryMin: faker.number.int({ min: 30000, max: 80000 }),
				salaryMax: faker.number.int({ min: 80000, max: 200000 }),
				location: faker.location.city(),
				expiresAt: faker.date.future(),
				tags: {
					create: selectedTags.map((t) => ({ tagId: t.id })),
				},
			},
		});
		jobs.push(job);
	}
	console.log(`  ✅ ${jobs.length} jobs`);

	// ─── 6. Applications ────────────────────────────────────────────────────────
	const openJobs = jobs.filter((j) => j.status === "OPEN");
	let appCount = 0;

	for (const candidate of candidates.slice(0, 25)) {
		const targetJobs = faker.helpers.arrayElements(openJobs, {
			min: 1,
			max: 5,
		});
		for (const job of targetJobs) {
			try {
				await prisma.jobApplication.upsert({
					where: { jobId_userId: { jobId: job.id, userId: candidate.id } },
					update: {},
					create: {
						jobId: job.id,
						userId: candidate.id,
						status: faker.helpers.arrayElement([
							"PENDING",
							"REVIEWED",
							"SHORTLISTED",
							"ACCEPTED",
							"REJECTED",
						]),
						coverLetter: faker.lorem.paragraph(),
					},
				});
				appCount++;
			} catch {
				// Skip duplicate constraint violations
			}
		}
	}
	console.log(`  ✅ ${appCount} applications`);

	// ─── 7. Notifications ───────────────────────────────────────────────────────
	let notifCount = 0;
	for (const company of companies.slice(0, 5)) {
		for (let n = 0; n < 5; n++) {
			await prisma.notification.create({
				data: {
					type: "APPLICATION_RECEIVED",
					message: `New application received for a job at ${company.name}`,
					metadata: { jobId: jobs[notifCount % jobs.length]?.id },
					companyId: company.id,
					isRead: n > 2,
				},
			});
			notifCount++;
		}
	}
	for (const candidate of candidates.slice(0, 10)) {
		await prisma.notification.create({
			data: {
				type: "APPLICATION_STATUS_CHANGED",
				message: "Your application status has been updated.",
				userId: candidate.id,
				isRead: false,
			},
		});
		notifCount++;
	}
	console.log(`  ✅ ${notifCount} notifications`);

	console.log("\n🎉 Seeding complete!");
	console.log(`\nLogin credentials (all accounts):`);
	console.log(`  Password:  ${SEED_PASSWORD}`);
	console.log(`  Admin:     user0@seed.test`);
	console.log(`  Recruiter: user2@seed.test`);
	console.log(`  Candidate: user15@seed.test`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
