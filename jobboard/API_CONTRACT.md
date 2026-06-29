# POSTBOARD API Contract

> Frontend team: this is the single source of truth for all API interactions.
> Do not guess response shapes — read this document.

---

## Base URL

```
http://localhost:5000/api/v1
```

All authenticated endpoints require `Authorization: Bearer <accessToken>` header.

---

## Response Envelopes

### Success (single resource)

```json
{
  "data": { ... }
}
```

### Success (list / paginated)

```json
{
  "data": [ ... ],
  "meta": {
    "nextCursor": "uuid or null",
    "hasNextPage": true
  }
}
```

> First page: omit `cursor`. Subsequent pages: pass `?cursor=<nextCursor>` from previous response.

### Success (message-only)

```json
{
  "data": { "message": "Action completed." }
}
```

### Error

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

### Error Codes

| Code | Meaning | HTTP Status |
|---|---|---|
| `VALIDATION_ERROR` | Input failed validation | 422 |
| `UNAUTHORIZED` | Missing or invalid token | 401 |
| `FORBIDDEN` | Authenticated but not allowed | 403 |
| `NOT_FOUND` | Resource does not exist | 404 |
| `CONFLICT` | Duplicate / state conflict | 409 |
| `RATE_LIMITED` | Too many requests | 429 |
| `GONE` | Resource no longer available | 410 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Validation Error (detail)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Valid email is required" }
    ]
  }
}
```

---

## Authentication

### POST /auth/register

Register a new user account.

- **Auth**: None
- **Role**: Public
- **Body**:
  ```json
  { "userName": "johndoe", "firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "Secret123!", "role": "CANDIDATE" }
  ```
- **Response 201**: `{ data: { user: {...}, message: "Verification email sent..." } }`

### POST /auth/login

Log in as a user. Access token in body; refresh token in httpOnly cookie.

- **Auth**: None
- **Body**: `{ email, password }`
- **Response 200**: `{ data: { user: {...}, accessToken: "..." } }`
- **Set-Cookie**: `refreshToken` (httpOnly, secure, sameSite=strict, 7d)

### POST /auth/register/company

Register a new company.

- **Auth**: None
- **Body**: `{ name, email, password, website?, industry?, size? }`
- **Response 201**: `{ data: { message, companyId, userId } }`

### POST /auth/login/company

Log in as a company.

- **Auth**: None
- **Body**: `{ email, password }`
- **Response 200**: `{ data: { company: {...}, accessToken: "..." } }`
- **Set-Cookie**: `refreshToken`

### POST /auth/refresh-token

Rotate refresh token. Reads `refreshToken` cookie.

- **Auth**: Cookie
- **Response 200**: `{ data: { accessToken: "..." } }`
- **Set-Cookie**: new `refreshToken`

### POST /auth/logout

Revoke refresh token and clear cookie.

- **Auth**: Bearer token
- **Response**: 204 No Content

### POST /auth/send-verification-email

Resend email verification link.

- **Body**: `{ email }`
- **Response 200**: `{ data: { message } }`

### GET /auth/verify-email?token=xxx

Verify user email.

- **Response 200**: `{ data: { message } }`

### POST /auth/forgot-password

Request password reset link.

- **Body**: `{ email }`
- **Response 200**: `{ data: { message } }` (always — prevents email enumeration)

### POST /auth/reset-password?token=xxx

Reset password using one-time token.

- **Body**: `{ password }`
- **Response 200**: `{ data: { message } }`

### POST /auth/change-password

Change password while authenticated.

- **Auth**: Bearer token
- **Body**: `{ currentPassword, newPassword }`
- **Response 200**: `{ data: { message } }`
- **Clears**: `refreshToken` cookie

---

## Users

### GET /user/current

Get authenticated user.

- **Auth**: Bearer token
- **Roles**: CANDIDATE, RECRUITER, ADMIN
- **Response 200**: `{ data: { user: { id, userName, firstName, lastName, email, role, isVerified, phone?, createdAt } } }`

### PATCH /user/current

Update user profile fields.

- **Body**: `{ firstName?, lastName?, userName?, phone? }`
- **Response 200**: `{ data: { user: {...} } }`

### DELETE /user/current

Soft-delete own account.

- **Body**: `{ password }`
- **Response 200**: `{ data: { message } }`

### GET /user/current/profile

Get extended profile (candidate).

- **Response 200**: `{ data: { profile: { id, bio, resumeUrl, linkedinUrl, githubUrl, skills, location } } }`

### PUT /user/current/profile

Create or update profile.

- **Body**: `{ bio?, linkedinUrl?, githubUrl?, skills?, location? }`
- **Response 200**: `{ data: { profile: {...} } }`

### POST /user/current/profile/resume

Upload resume PDF (multipart).

- **Field**: `resume` (PDF, max 5MB)
- **Response 200**: `{ data: { resumeUrl } }`

### DELETE /user/current/profile/resume

Remove resume.

- **Response 200**: `{ data: { message } }`

---

## Companies

### GET /company/current

Get own company profile.

- **Auth**: Bearer token
- **Roles**: ADMIN, RECRUITER, CANDIDATE
- **Response 200**: `{ data: { company: { id, name, slug, email, logoUrl?, website?, industry?, size?, isVerified, createdAt } } }`

### PATCH /company/current

Update company profile.

- **Auth**: Bearer token
- **Roles**: ADMIN
- **Body**: `{ name?, website?, industry?, size? }`
- **Response 200**: `{ data: { company: {...} } }`

### POST /company/current/logo

Upload logo (multipart).

- **Field**: `logo` (image, max 2MB)
- **Response 200**: `{ data: { logoUrl } }`

### DELETE /company/current/logo

Remove logo.

- **Response 200**: `{ data: { message } }`

### DELETE /company/current

Soft-delete company and all data.

- **Body**: `{ password }`
- **Response 200**: `{ data: { message } }`

### GET /company/:companyId

Get company by ID (public profile).

- **Auth**: Bearer token
- **Params**: `companyId` (UUID)
- **Response 200**: `{ data: { company: {...} } }`

### GET /company/current/team

List team members (paginated, cursor-based).

- **Roles**: ADMIN, RECRUITER
- **Query**: `cursor`, `limit` (default 20)
- **Response 200**: `{ data: [...members], meta: { nextCursor, hasNextPage } }`

### POST /company/current/team/invite

Invite team member.

- **Roles**: ADMIN
- **Body**: `{ email, role: "RECRUITER"|"CANDIDATE" }`
- **Response 200**: `{ data: { member: {...} } }`

### PATCH /company/current/team/:memberId/role

Change member role.

- **Params**: `memberId` (UUID)
- **Body**: `{ role: "ADMIN"|"RECRUITER"|"CANDIDATE" }`
- **Response 200**: `{ data: { member: {...} } }`

### DELETE /company/current/team/:memberId

Remove team member.

- **Params**: `memberId` (UUID)
- **Response 200**: `{ data: { message } }`

### PATCH /company/current/team/:memberId/transfer-ownership

Transfer company ownership.

- **Params**: `memberId` (UUID)
- **Response 200**: `{ data: { message, ...result } }`

### GET /company/current/analytics

Company analytics dashboard.

- **Roles**: ADMIN
- **Response 200**: `{ data: { jobs: {...}, applications: {...}, conversionRates: {...}, applicationsPerJob: [...], recruiterActivity: [...] } }`

### GET /company/current/recruiters/:id/analytics

Per-recruiter analytics.

- **Params**: `id` (UUID)
- **Roles**: ADMIN, RECRUITER
- **Response 200**: `{ data: { jobsCreated, jobsPublished, applications: {...}, recentActivity: [...] } }`

### GET /company/current/audit-logs

Company audit trail (paginated, cursor-based).

- **Roles**: ADMIN
- **Query**: `cursor`, `limit`, `action`, `startDate`, `endDate`
- **Response 200**: `{ data: [...logs], meta: { nextCursor, hasNextPage } }`

### GET /company/current/ownership-history

Ownership transfer history (paginated, cursor-based).

- **Roles**: ADMIN
- **Query**: `cursor`, `limit`
- **Response 200**: `{ data: [...history], meta: { nextCursor, hasNextPage } }`

---

## Jobs

### GET /job

List public jobs (paginated, cursor-based).

- **Auth**: None
- **Query**: `cursor`, `limit` (max 50), `search`, `locationType`, `experienceLevel`, `salaryMin`, `salaryMax`, `tags` (comma-separated)
- **Response 200**: `{ data: [...jobs], meta: { nextCursor, hasNextPage } }`

### GET /job/:id

Get job detail.

- **Auth**: None
- **Params**: `id` (UUID)
- **Response 200**: `{ data: { job: { ...job, description, postedBy } } }`

### POST /job

Create job listing.

- **Auth**: Bearer token
- **Roles**: ADMIN, RECRUITER (verified)
- **Body**: `{ title, description, locationType, experienceLevel, salaryMin?, salaryMax?, currency?, tags? }`
- **Response 201**: `{ data: { job: {...} } }`

### PATCH /job/:id

Update job.

- **Auth**: Bearer token
- **Roles**: ADMIN, RECRUITER (verified)
- **Body**: Same as create
- **Response 200**: `{ data: { job: {...} } }`

### PATCH /job/:id/status

Update job status.

- **Body**: `{ status: "DRAFT"|"OPEN"|"CLOSED" }`
- **Response 200**: `{ data: { job: {...} } }`

### DELETE /job/:id

Soft-delete job.

- **Roles**: ADMIN
- **Response 200**: `{ data: { message } }`

### POST /job/:id/apply

Apply to a job (candidate).

- **Auth**: Bearer token
- **Roles**: CANDIDATE
- **Body**: multipart/form-data — `coverLetter?`, `resume?` (PDF, max 5MB)
- **Rate limit**: 5 per 15 minutes
- **Response 201**: `{ data: { application: {...} } }`

### GET /job/:id/applications

List applications for a job.

- **Roles**: ADMIN, RECRUITER
- **Query**: `cursor`, `limit`, `status`
- **Response 200**: `{ data: [...applications], meta: { nextCursor, hasNextPage } }`

### GET /job/my-applications

My applications (candidate, paginated).

- **Roles**: CANDIDATE
- **Query**: `cursor`, `limit`
- **Response 200**: `{ data: [...applications], meta: { nextCursor, hasNextPage } }`

### PATCH /job/applications/:applicationId/status

Update application status.

- **Roles**: ADMIN, RECRUITER
- **Params**: `applicationId` (UUID)
- **Body**: `{ status: "PENDING"|"REVIEWED"|"SHORTLISTED"|"ACCEPTED"|"REJECTED", note? }`
- **Response 200**: `{ data: { application: {...} } }`

### DELETE /job/applications/:applicationId

Withdraw own application.

- **Roles**: CANDIDATE
- **Params**: `applicationId` (UUID)
- **Response 200**: `{ data: { message } }`

---

## Tags

### GET /tags

List tags (autocomplete).

- **Auth**: None
- **Query**: `q` (search prefix), `limit`
- **Response 200**: `{ data: { tags: [...string] } }`

---

## Notifications

### GET /notifications/company

Company notifications (paginated, cursor-based).

- **Roles**: ADMIN, RECRUITER
- **Query**: `cursor`, `limit`, `unreadOnly`
- **Response 200**: `{ data: [...notifications], meta: { nextCursor, hasNextPage } }`

### GET /notifications/company/unread-count

- **Response 200**: `{ data: { count: number } }`

### PATCH /notifications/company/read

Mark notifications as read.

- **Body**: `{ ids?: string[] }` (omit to mark all)
- **Response 200**: `{ data: { message } }`

### PATCH /notifications/company/:notificationId/read

Mark single as read.

- **Params**: `notificationId` (UUID)
- **Response 200**: `{ data: { notification: {...} } }`

### DELETE /notifications/company/:notificationId

Delete notification.

- **Params**: `notificationId` (UUID)
- **Response 200**: `{ data: { message } }`

### GET /notifications/user

User notifications (paginated, cursor-based).

- **Roles**: CANDIDATE
- **Query**: `cursor`, `limit`, `unreadOnly`
- **Response 200**: `{ data: [...notifications], meta: { nextCursor, hasNextPage } }`

### GET /notifications/user/unread-count

- **Response 200**: `{ data: { unreadCount: number } }`

### PATCH /notifications/user/read

Mark user notifications as read.

- **Body**: `{ ids?: string[] }`
- **Response 200**: `{ data: { message } }`

### DELETE /notifications/user/:notificationId

Delete user notification.

- **Params**: `notificationId` (UUID)
- **Response 200**: `{ data: { message } }`

---

## Admin (SuperAdmin)

> All Admin endpoints require `Authorization: Bearer <superAdminAccessToken>`.

### GET /admin/stats

Platform statistics.

- **Response 200**: `{ data: { users: { total }, companies: { total }, jobs: { total, open }, applications: { total, pending }, notifications: { total, unread }, generatedAt } }`

### GET /admin/users

List all users (paginated, cursor-based).

- **Query**: `cursor`, `limit`, `role`, `search`
- **Response 200**: `{ data: [...users], meta: { nextCursor, hasNextPage } }`

### DELETE /admin/users/:userId

Deactivate user.

- **Params**: `userId` (UUID)
- **Response 200**: `{ data: { message } }`

### GET /admin/companies

List all companies (paginated, cursor-based).

- **Query**: `cursor`, `limit`, `search`, `verified`
- **Response 200**: `{ data: [...companies], meta: { nextCursor, hasNextPage } }`

### PATCH /admin/companies/:companyId/verify

Toggle company verification.

- **Params**: `companyId` (UUID)
- **Body**: `{ isVerified: boolean }`
- **Response 200**: `{ data: { message } }`

### GET /admin/jobs

List all jobs (paginated, cursor-based).

- **Query**: `cursor`, `limit`, `status`, `search`
- **Response 200**: `{ data: [...jobs], meta: { nextCursor, hasNextPage } }`

### PATCH /admin/jobs/:jobId/close

Force-close a job.

- **Params**: `jobId` (UUID)
- **Body**: `{ reason? }`
- **Response 200**: `{ data: { message } }`

### DELETE /admin/jobs/:jobId

Delete a job.

- **Params**: `jobId` (UUID)
- **Response 200**: `{ data: { message } }`

### GET /admin/audit-logs

Platform audit log (paginated, cursor-based).

- **Query**: `cursor`, `limit`, `actorId`, `action`, `targetType`
- **Response 200**: `{ data: [...logs], meta: { nextCursor, hasNextPage } }`

---

## SuperAdmin

> Separate auth from Admin routes. Token obtained via `/superadmin/login`.
> All protected endpoints require `Authorization: Bearer <superAdminAccessToken>`.

### POST /superadmin/login

SuperAdmin login.

- **Auth**: None
- **Body**: `{ email, password }`
- **Response 200**: `{ data: { message, accessToken, refreshToken, admin: {...} } }`

### POST /superadmin/refresh

Rotate SuperAdmin refresh token (cookie-based).

- **Response 200**: `{ data: { accessToken } }`

### POST /superadmin/logout

Logout. Revokes cookie.

- **Response**: 204 No Content

### GET /superadmin/stats

Platform stats (includes deleted records).

- **Response 200**: `{ data: { companies: { total, verified }, users: { total, candidates, recruiters }, jobs: { total, open }, applications: { total } } }`

### GET /superadmin/companies

List all companies (paginated, cursor-based).

- **Query**: `cursor`, `limit` (max 100), `isVerified`, `search`
- **Response 200**: `{ data: [...companies], meta: { nextCursor, hasNextPage } }`

### PATCH /superadmin/companies/:id/verify

Set company verification.

- **Params**: `id` (UUID)
- **Body**: `{ isVerified: boolean }`
- **Response 200**: `{ data: { message, company: {...} } }`

### DELETE /superadmin/companies/:id

Soft-delete company + all jobs + all users.

- **Params**: `id` (UUID)
- **Response 200**: `{ data: { message } }`

### GET /superadmin/jobs

List all jobs (paginated, cursor-based).

- **Query**: `cursor`, `limit` (max 100), `status`, `companyId`
- **Response 200**: `{ data: [...jobs], meta: { nextCursor, hasNextPage } }`

### DELETE /superadmin/jobs/:id/force-close

Force-close a job.

- **Params**: `id` (UUID)
- **Response 200**: `{ data: { message } }`

### GET /superadmin/candidates

List all candidates (paginated, cursor-based).

- **Query**: `cursor`, `limit` (max 100), `search`
- **Response 200**: `{ data: [...candidates], meta: { nextCursor, hasNextPage } }`

### DELETE /superadmin/candidates/:id/ban

Ban a candidate.

- **Params**: `id` (UUID)
- **Response 200**: `{ data: { message } }`

### GET /superadmin/security-events

Security event log (paginated, cursor-based).

- **Query**: `cursor`, `limit`, `eventType`, `severity`, `startDate`, `endDate`, `companyId`
- **Response 200**: `{ data: [...events], meta: { nextCursor, hasNextPage } }`

### GET /superadmin/ownerless-companies

Companies with no owner (paginated, cursor-based).

- **Query**: `cursor`, `limit`
- **Response 200**: `{ data: [...companies], meta: { nextCursor, hasNextPage } }`

### POST /superadmin/companies/:id/assign-owner

Assign a new owner to a company.

- **Params**: `id` (UUID)
- **Body**: `{ newOwnerId: "uuid", reason? }`
- **Response 200**: `{ data: { previousOwnerId, newOwnerId } }`

### POST /superadmin/companies/:id/recover-ownership

Auto-recover ownership for ownerless company.

- **Params**: `id` (UUID)
- **Response 200**: `{ data: { message, newOwnerId } }`

---

## Health & Readiness

> These endpoints are mounted at the root (not under `/api/v1`).

### GET /health

Liveness check. Returns 200 if process is alive.

```json
{ "status": "ok", "timestamp": "...", "uptime": 123 }
```

### GET /ready

Readiness check (DB + Redis). Returns 200 or 503.

```json
{ "status": "ok"|"degraded", "timestamp": "...", "checks": { "postgres": {...}, "redis": {...} } }
```

### GET /queue/health

BullMQ queue counters.

```json
{ "queue": { "waiting": 0, "active": 0, "completed": 42, "failed": 0 } }
```

---

## Rate Limiting

| Scope | Limit | Applied To |
|---|---|---|
| Auth (login, register) | 10 req / 15 min per IP | All `/auth/*` endpoints |
| Applications | 5 req / 15 min per user | `POST /job/:id/apply` |
| Job list | 30 req / 1 min per IP | `GET /job` |

Exceeded limits return `429` with `{ error: { code: "RATE_LIMITED", message } }`.

---

## Pagination Format

All list endpoints use cursor-based pagination.

**Request:**
```
GET /resource?cursor=<lastId>&limit=20
```

- **First page**: omit `cursor`
- **Subsequent pages**: copy `meta.nextCursor` from the previous response into `?cursor=`

**Response:**
```json
{
  "data": [ ... ],
  "meta": {
    "nextCursor": "uuid-or-null",
    "hasNextPage": true
  }
}
```

- When `hasNextPage` is `false`, `nextCursor` is `null`.
- `limit` defaults to 20; maximum 100 for admin endpoints, 50 for public.

---

## UUID Validation

All route parameters that represent resource IDs (`:id`, `:companyId`, `:userId`, `:jobId`, `:applicationId`, `:notificationId`, `:memberId`) are validated to be proper UUID v4 strings. Invalid UUIDs return `422` with `VALIDATION_ERROR`.
