// src/lib/swagger.ts
// Phase 9: OpenAPI 3.0 documentation via swagger-jsdoc + swagger-ui-express.
//
// ACCESS CONTROL:
//   /api/v1/docs and /api/v1/docs.json are protected by adminsAuth.
//   Only users with role=ADMIN or SuperAdmins may access documentation.
//   Candidates and Recruiters receive 403 Forbidden.
//   Unauthenticated requests receive 401 Unauthorized.
//
// USAGE:
//   Run the dev server and visit http://localhost:3000/api/v1/docs
//   Authenticate via the Authorize button using your admin access token.

import crypto from "crypto";
import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "@/config";
import logger from "@/lib/winston";
import { adminsAuth } from "@/middleware/adminsAuth";

// ─── OpenAPI definition ────────────────────────────────────────────────────────

const definition: swaggerJsdoc.OAS3Definition = {
	openapi: "3.0.3",
	info: {
		title: "Job Board API",
		version: "1.0.0",
		description: [
			"A full-featured job board REST API.",
			"",
			"**Authentication:** Most endpoints require a Bearer access token.",
			"Use `POST /auth/login` or `POST /auth/login/company` to obtain tokens.",
			"Pass the access token in the `Authorization: Bearer <token>` header.",
			"",
			"**Pagination:** All list endpoints use cursor-based pagination.",
			"Pass `cursor` (the `nextCursor` from a previous response) to get the next page.",
		].join("\n"),
		contact: {
			name: "API Support",
			email: "support@yourdomain.com",
		},
		license: {
			name: "ISC",
		},
	},
	servers: [
		{
			url: `http://localhost:${config.PORT}/api/v1`,
			description: "Development server",
		},
		{
			url: `${config.APP_URL}/api/v1`,
			description: "Production server",
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				description: 'Paste your access token here (without "Bearer " prefix)',
			},
		},
		schemas: {
			// ─── Common ───────────────────────────────────────────────────────────

			PaginatedMeta: {
				type: "object",
				properties: {
					nextCursor: { type: "string", nullable: true },
					hasNextPage: { type: "boolean" },
				},
			},

			Error: {
				type: "object",
				properties: {
					message: { type: "string" },
				},
				required: ["message"],
			},

			ValidationError: {
				type: "object",
				properties: {
					status: { type: "string", example: "fail" },
					errors: {
						type: "array",
						items: {
							type: "object",
							properties: {
								field: { type: "string" },
								message: { type: "string" },
							},
						},
					},
				},
			},

			// ─── Auth ─────────────────────────────────────────────────────────────

			RegisterUserRequest: {
				type: "object",
				required: ["userName", "firstName", "lastName", "email", "password"],
				properties: {
					userName: {
						type: "string",
						minLength: 3,
						maxLength: 30,
						example: "johndoe",
					},
					firstName: { type: "string", example: "John" },
					lastName: { type: "string", example: "Doe" },
					email: {
						type: "string",
						format: "email",
						example: "john@example.com",
					},
					password: { type: "string", minLength: 8, example: "Secret123" },
					role: {
						type: "string",
						enum: ["RECRUITER", "CANDIDATE"],
						default: "CANDIDATE",
					},
					phone: { type: "string", example: "+2348012345678" },
					companyId: { type: "string", format: "uuid" },
				},
			},

			LoginRequest: {
				type: "object",
				required: ["email", "password"],
				properties: {
					email: { type: "string", format: "email" },
					password: { type: "string" },
				},
			},

			LoginUserResponse: {
				type: "object",
				properties: {
					accessToken: { type: "string" },
					user: {
						type: "object",
						properties: {
							userName: { type: "string" },
							email: { type: "string" },
							role: { type: "string" },
						},
					},
				},
			},

			// ─── Job ──────────────────────────────────────────────────────────────

			JobSummary: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					slug: { type: "string" },
					location: { type: "string", nullable: true },
					locationType: {
						type: "string",
						enum: ["REMOTE", "ONSITE", "HYBRID"],
					},
					salaryMin: { type: "integer", nullable: true },
					salaryMax: { type: "integer", nullable: true },
					currency: { type: "string" },
					status: {
						type: "string",
						enum: ["DRAFT", "OPEN", "CLOSED", "EXPIRED"],
					},
					experienceLevel: {
						type: "string",
						enum: ["JUNIOR", "MID", "SENIOR", "LEAD"],
					},
					expiresAt: { type: "string", format: "date-time", nullable: true },
					createdAt: { type: "string", format: "date-time" },
					company: {
						type: "object",
						properties: {
							id: { type: "string" },
							name: { type: "string" },
							logoUrl: { type: "string", nullable: true },
							slug: { type: "string" },
						},
					},
					tags: {
						type: "array",
						items: {
							type: "object",
							properties: {
								tag: {
									type: "object",
									properties: {
										name: { type: "string" },
										slug: { type: "string" },
									},
								},
							},
						},
					},
				},
			},

			CreateJobRequest: {
				type: "object",
				required: ["title", "description"],
				properties: {
					title: { type: "string", minLength: 3, maxLength: 150 },
					description: { type: "string", minLength: 50 },
					location: { type: "string" },
					locationType: {
						type: "string",
						enum: ["REMOTE", "ONSITE", "HYBRID"],
					},
					salaryMin: { type: "integer", minimum: 0 },
					salaryMax: { type: "integer", minimum: 0 },
					currency: { type: "string", default: "USD" },
					experienceLevel: {
						type: "string",
						enum: ["JUNIOR", "MID", "SENIOR", "LEAD"],
					},
					tags: { type: "array", items: { type: "string" }, maxItems: 15 },
					expiresAt: { type: "string", format: "date-time" },
				},
			},

			// ─── Application ──────────────────────────────────────────────────────

			ApplicationStatus: {
				type: "string",
				enum: ["PENDING", "REVIEWED", "SHORTLISTED", "ACCEPTED", "REJECTED"],
			},

			UpdateApplicationStatusRequest: {
				type: "object",
				required: ["status"],
				properties: {
					status: { $ref: "#/components/schemas/ApplicationStatus" },
					rejectionReason: { type: "string", maxLength: 1000 },
				},
			},

			// ─── Notification ─────────────────────────────────────────────────────

			Notification: {
				type: "object",
				properties: {
					id: { type: "string" },
					type: { type: "string" },
					message: { type: "string" },
					metadata: { type: "object", nullable: true },
					isRead: { type: "boolean" },
					createdAt: { type: "string", format: "date-time" },
				},
			},
		},
	},
	security: [{ bearerAuth: [] }],
	tags: [
		{ name: "Auth", description: "User and company authentication" },
		{ name: "Users", description: "User profile management" },
		{ name: "Companies", description: "Company profile and team management" },
		{ name: "Jobs", description: "Job listing and management" },
		{ name: "Applications", description: "Job application lifecycle" },
		{ name: "Notifications", description: "In-app notification centre" },
		{ name: "Tags", description: "Job tag taxonomy" },
		{ name: "Admin", description: "Platform administration (ADMIN role only)" },
		{
			name: "SuperAdmin",
			description: "SuperAdmin operations (SuperAdmin JWT only)",
		},
	],
};

const paths: Record<string, unknown> = {};

const options: swaggerJsdoc.Options = {
	definition: { ...definition, paths },
	// Scan every route file — the JSDoc @openapi blocks live there.
	// Controller files are also scanned in case any annotations were added there.
	apis: [
		"./src/routes/v1/*.ts",
		"./src/routes/v1/**/*.ts",
		"./src/controller/v1/**/*.ts",
	],
};

export const swaggerSpec = swaggerJsdoc(options);

// ─── Mount helper ─────────────────────────────────────────────────────────────
//
// Both the Swagger UI routes and the raw JSON spec endpoint are guarded by
// adminsAuth. The middleware runs before swagger-ui-express so
// unauthenticated requests never reach the spec handler.

export const mountSwagger = (app: Express): void => {
	// Protect the interactive UI
	app.use(
		"/api/v1/docs",
		adminsAuth,
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			customSiteTitle: "Job Board API Docs",
			customCss: ".swagger-ui .topbar { display: none }",
			swaggerOptions: {
				persistAuthorization: true,
				tryItOutEnabled: true,
				requestInterceptor: (request: Record<string, unknown>) => {
					(request.headers as Record<string, string>)["x-request-id"] =
						crypto.randomUUID();
					return request;
				},
			},
		}),
	);

	// Protect the raw JSON spec (used by code generators / Postman)
	app.get("/api/v1/docs.json", adminsAuth, (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerSpec);
	});

	logger.info("Swagger: docs mounted at /api/v1/docs (admin-only)");
};
