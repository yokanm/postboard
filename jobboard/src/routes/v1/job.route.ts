// src/routes/v1/job.route.ts
import { Router } from "express";
import {
	applyToJob,
	getMyApplications,
	listApplications,
	updateApplicationStatus,
	withdrawApplication,
} from "@/controller/v1/jobs/application";
import {
	createJob,
	deleteJob,
	getJob,
	listJobs,
	updateJob,
	updateJobStatus,
} from "@/controller/v1/jobs/job";
import { applyLimiter, jobListLimiter } from "@/lib/express_rate_limit";
import { resumeUpload } from "@/lib/multer";
import { authMiddleware } from "@/middleware/authentication";
import {
	authorize,
	authorizeCompany,
	requireVerifiedUser,
} from "@/middleware/authorization";
import { withValidation } from "@/middleware/expressValidates";
import { validateUUID } from "@/middleware/validateUUID";
import {
	applyToJobRules,
	updateApplicationStatusRules,
} from "@/validators/application.expressvalidator";
import {
	createJobRules,
	listJobsQueryRules,
	updateJobRules,
	updateJobStatusRules,
} from "@/validators/Job.expressvalidator";

const router = Router();

// ─── Public job routes ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /job:
 *   get:
 *     tags: [Jobs]
 *     summary: List jobs (public)
 *     description: |
 *       Returns a paginated list of open jobs. No authentication required.
 *       Supports cursor-based pagination and filtering by location, type, experience level, salary, and tags.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Cursor from previous response `nextCursor` for pagination
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search on title and description
 *       - in: query
 *         name: locationType
 *         schema: { type: string, enum: [REMOTE, ONSITE, HYBRID] }
 *       - in: query
 *         name: experienceLevel
 *         schema: { type: string, enum: [JUNIOR, MID, SENIOR, LEAD] }
 *       - in: query
 *         name: salaryMin
 *         schema: { type: integer }
 *       - in: query
 *         name: salaryMax
 *         schema: { type: integer }
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Comma-separated tag slugs e.g. `nodejs,typescript`
 *     responses:
 *       200:
 *         description: Paginated job list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/JobSummary' }
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 */
router.get("/", jobListLimiter, withValidation(listJobsQueryRules), listJobs);

// ─── Candidate: own applications ──────────────────────────────────────────────

/**
 * @openapi
 * /job/my-applications:
 *   get:
 *     tags: [Jobs]
 *     summary: Get my applications (candidate)
 *     description: Returns all job applications submitted by the authenticated candidate, newest first.
 *     responses:
 *       200:
 *         description: Candidate's applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:             { type: string }
 *                       status:         { type: string, enum: [PENDING, REVIEWED, SHORTLISTED, ACCEPTED, REJECTED] }
 *                       coverLetter:    { type: string, nullable: true }
 *                       resumeUrl:      { type: string, nullable: true }
 *                       createdAt:      { type: string, format: date-time }
 *                       job:
 *                         type: object
 *                         properties:
 *                           id:      { type: string }
 *                           title:   { type: string }
 *                           slug:    { type: string }
 *                           company:
 *                             type: object
 *                             properties:
 *                               name:    { type: string }
 *                               logoUrl: { type: string, nullable: true }
 *       403:
 *         description: Only candidates can access this endpoint
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
	"/my-applications",
	authMiddleware,
	authorize(["CANDIDATE"]),
	getMyApplications,
);

// ─── Standalone application routes ────────────────────────────────────────────

/**
 * @openapi
 * /job/applications/{applicationId}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update application status
 *     description: Changes the status of a job application. Only the company that posted the job (ADMIN or RECRUITER) can update it.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateApplicationStatusRequest' }
 *           example:
 *             status: SHORTLISTED
 *     responses:
 *       200:
 *         description: Status updated. Candidate receives an in-app notification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 application: { type: object }
 *       403:
 *         description: You do not own the job this application belongs to
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/applications/:applicationId/status",
	authMiddleware,
	validateUUID("applicationId"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	withValidation(updateApplicationStatusRules),
	updateApplicationStatus,
);

/**
 * @openapi
 * /job/applications/{applicationId}:
 *   delete:
 *     tags: [Applications]
 *     summary: Withdraw application
 *     description: Candidate withdraws their own application. Only possible while status is PENDING.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Application withdrawn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       403:
 *         description: Not your application, or status is past PENDING
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/applications/:applicationId",
	authMiddleware,
	validateUUID("applicationId"),
	authorize(["CANDIDATE"]),
	withdrawApplication,
);

// ─── Single job ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /job/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get job by ID (public)
 *     description: Returns full job details including description, company info, and tags.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 job:
 *                   allOf:
 *                     - $ref: '#/components/schemas/JobSummary'
 *                     - type: object
 *                       properties:
 *                         description: { type: string }
 *                         postedBy:
 *                           type: object
 *                           properties:
 *                             userName:  { type: string }
 *                             firstName: { type: string }
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id", validateUUID("id"), getJob);

// ─── Jobs — authenticated (RECRUITER / ADMIN) ─────────────────────────────────

/**
 * @openapi
 * /job:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a job listing
 *     description: Creates a new job posted under the authenticated company. ADMIN or RECRUITER company role required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateJobRequest' }
 *           example:
 *             title: Senior Node.js Engineer
 *             description: We are looking for an experienced Node.js engineer to join our backend team. You will work on high-scale APIs serving millions of users.
 *             locationType: REMOTE
 *             experienceLevel: SENIOR
 *             salaryMin: 80000
 *             salaryMax: 120000
 *             currency: USD
 *             tags: [nodejs, typescript, postgresql]
 *     responses:
 *       201:
 *         description: Job created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 job:     { $ref: '#/components/schemas/JobSummary' }
 *       403:
 *         description: Not a company ADMIN or RECRUITER
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/",
	authMiddleware,
	authorizeCompany(["ADMIN", "RECRUITER"]),
	requireVerifiedUser,
	withValidation(createJobRules),
	createJob,
);

/**
 * @openapi
 * /job/{id}:
 *   patch:
 *     tags: [Jobs]
 *     summary: Update a job listing
 *     description: Updates job fields. Only the company that owns the job can update it.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateJobRequest' }
 *     responses:
 *       200:
 *         description: Job updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 job:     { $ref: '#/components/schemas/JobSummary' }
 *       403:
 *         description: You do not own this job
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/:id",
	authMiddleware,
	validateUUID("id"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	requireVerifiedUser,
	withValidation(updateJobRules),
	updateJob,
);

/**
 * @openapi
 * /job/{id}/status:
 *   patch:
 *     tags: [Jobs]
 *     summary: Update job status
 *     description: Changes a job's status (DRAFT → OPEN → CLOSED). Company ADMIN or RECRUITER only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [DRAFT, OPEN, CLOSED] }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       403:
 *         description: You do not own this job
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/:id/status",
	authMiddleware,
	validateUUID("id"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	requireVerifiedUser,
	withValidation(updateJobStatusRules),
	updateJobStatus,
);

/**
 * @openapi
 * /job/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: Delete a job listing
 *     description: Soft-deletes a job and closes all pending applications. Company ADMIN only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       403:
 *         description: You do not own this job
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/:id",
	authMiddleware,
	validateUUID("id"),
	authorizeCompany(["ADMIN"]),
	deleteJob,
);

// ─── Applications nested under a job ──────────────────────────────────────────

/**
 * @openapi
 * /job/{id}/apply:
 *   post:
 *     tags: [Applications]
 *     summary: Apply to a job
 *     description: |
 *       Submits a job application for the authenticated candidate.
 *       An optional resume PDF can be uploaded — if not provided, the candidate's profile resume is used.
 *       Rate limited to 5 applications per 15 minutes.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Job ID to apply to
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 description: Optional cover letter text
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Optional PDF resume override (max 5MB)
 *     responses:
 *       201:
 *         description: Application submitted. Company receives a notification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 application: { type: object }
 *       409:
 *         description: Already applied to this job
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       410:
 *         description: Job is no longer accepting applications
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         description: Too many applications in a short period
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/:id/apply",
	authMiddleware,
	validateUUID("id"),
	authorize(["CANDIDATE"]),
	applyLimiter,
	resumeUpload.single("resume"),
	withValidation(applyToJobRules),
	applyToJob,
);

/**
 * @openapi
 * /job/{id}/applications:
 *   get:
 *     tags: [Applications]
 *     summary: List applications for a job
 *     description: Returns all applications for a specific job. Only the owning company's ADMIN or RECRUITER can access this.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, REVIEWED, SHORTLISTED, ACCEPTED, REJECTED] }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated application list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:          { type: string }
 *                       status:      { type: string }
 *                       resumeUrl:   { type: string, nullable: true }
 *                       coverLetter: { type: string, nullable: true }
 *                       createdAt:   { type: string, format: date-time }
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:        { type: string }
 *                           userName:  { type: string }
 *                           firstName: { type: string }
 *                           lastName:  { type: string }
 *                           email:     { type: string }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 *       403:
 *         description: You do not own this job
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
	"/:id/applications",
	authMiddleware,
	validateUUID("id"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	listApplications,
);

export default router;
