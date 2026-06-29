import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const handlers = [
  // ─── Auth ────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        message: "Login successful",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "user-1",
          userName: "testuser",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          role: "CANDIDATE",
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      })
    }
    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email?: string }
    if (body.email === "existing@example.com") {
      return HttpResponse.json({ message: "Email already in use" }, { status: 409 })
    }
    return HttpResponse.json({
      message: "Registration successful",
      accessToken: "mock-access-token",
      user: { id: "user-2", email: body.email, role: "CANDIDATE", isVerified: false },
    })
  }),

  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json({ message: "Logged out" })
  ),

  http.post(`${BASE}/auth/refresh-token`, () =>
    HttpResponse.json({ accessToken: "refreshed-access-token" })
  ),

  http.post(`${BASE}/auth/forgot-password`, () =>
    HttpResponse.json({ message: "Reset email sent" })
  ),

  http.post(`${BASE}/auth/reset-password`, () =>
    HttpResponse.json({ message: "Password reset successfully" })
  ),

  http.post(`${BASE}/auth/change-password`, () =>
    HttpResponse.json({ message: "Password changed" })
  ),

  http.get(`${BASE}/auth/verify-email`, () =>
    HttpResponse.json({ message: "Email verified" })
  ),

  http.post(`${BASE}/auth/send-verification-email`, () =>
    HttpResponse.json({ message: "Verification email sent" })
  ),

  // ─── User / Profile ──────────────────────────────────────────
  http.get(`${BASE}/user/current`, () =>
    HttpResponse.json({
      id: "user-1",
      userName: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      role: "CANDIDATE",
      isVerified: true,
      createdAt: "2026-01-01T00:00:00Z",
    })
  ),

  http.get(`${BASE}/user/current/profile`, () =>
    HttpResponse.json({
      profile: {
        bio: "A test user",
        resumeUrl: null,
        linkedinUrl: null,
        githubUrl: null,
        skills: ["TypeScript", "React"],
        location: "Remote",
      },
    })
  ),

  http.put(`${BASE}/user/current/profile`, () =>
    HttpResponse.json({ message: "Profile updated" })
  ),

  // ─── Jobs ────────────────────────────────────────────────────
  http.get(`${BASE}/job`, () =>
    HttpResponse.json({
      jobs: [
        {
          id: "job-1",
          title: "Senior Engineer",
          slug: "senior-engineer",
          status: "OPEN",
          locationType: "REMOTE",
          experienceLevel: "SENIOR",
          createdAt: "2026-01-01T00:00:00Z",
          expiresAt: "2026-07-01T00:00:00Z",
          company: { id: "company-1", name: "Acme Corp" },
          _count: { applications: 3 },
        },
      ],
    })
  ),

  http.get(`${BASE}/job/job-1`, () =>
    HttpResponse.json({
      job: {
        id: "job-1",
        title: "Senior Engineer",
        slug: "senior-engineer",
        status: "OPEN",
        locationType: "REMOTE",
        experienceLevel: "SENIOR",
        description: "A great job",
        createdAt: "2026-01-01T00:00:00Z",
        expiresAt: "2026-07-01T00:00:00Z",
        company: { id: "company-1", name: "Acme Corp" },
        _count: { applications: 3 },
        tags: [{ id: "tag-1", name: "React" }],
      },
    })
  ),

  http.post(`${BASE}/job`, () =>
    HttpResponse.json({
      id: "job-2",
      title: "New Job",
      slug: "new-job",
      status: "DRAFT",
    })
  ),

  http.patch(`${BASE}/job/job-1`, () =>
    HttpResponse.json({ message: "Job updated" })
  ),

  http.patch(`${BASE}/job/job-1/status`, () =>
    HttpResponse.json({ message: "Status updated" })
  ),

  http.delete(`${BASE}/job/job-1`, () =>
    HttpResponse.json({ message: "Job deleted" })
  ),

  http.post(`${BASE}/job/job-1/apply`, () =>
    HttpResponse.json({
      message: "Application submitted",
      application: { id: "app-1", status: "PENDING" },
    })
  ),

  http.get(`${BASE}/job/my-applications`, () =>
    HttpResponse.json({
      applications: [
        {
          id: "app-1",
          coverLetter: null,
          resumeUrl: null,
          status: "PENDING",
          rejectionReason: null,
          createdAt: "2026-01-15T00:00:00Z",
          updatedAt: "2026-01-15T00:00:00Z",
          job: {
            id: "job-1",
            title: "Senior Engineer",
            slug: "senior-engineer",
            status: "OPEN",
            locationType: "REMOTE",
            experienceLevel: "SENIOR",
            company: { id: "company-1", name: "Acme Corp", logoUrl: null },
          },
        },
      ],
      nextCursor: null,
      hasNextPage: false,
    })
  ),

  // ─── Tags ────────────────────────────────────────────────────
  http.get(`${BASE}/tags`, () =>
    HttpResponse.json({ tags: [{ id: "tag-1", name: "React" }] })
  ),

  // ─── Company ─────────────────────────────────────────────────
  http.get(`${BASE}/company/current`, () =>
    HttpResponse.json({
      id: "company-1",
      name: "Acme Corp",
      slug: "acme-corp",
      email: "hr@acme.com",
      industry: "Technology",
      size: "50-200",
      description: "A great company",
      logoUrl: null,
      website: "https://acme.com",
      isVerified: true,
      createdAt: "2026-01-01T00:00:00Z",
    })
  ),

  http.put(`${BASE}/company/current`, () =>
    HttpResponse.json({ message: "Company updated" })
  ),

  http.get(`${BASE}/company/company-1`, () =>
    HttpResponse.json({
      id: "company-1",
      name: "Acme Corp",
      slug: "acme-corp",
      email: "hr@acme.com",
      industry: "Technology",
      size: "50-200",
      description: "A great company",
      logoUrl: null,
      website: "https://acme.com",
      isVerified: true,
      createdAt: "2026-01-01T00:00:00Z",
    })
  ),

  http.get(`${BASE}/company/current/team`, () =>
    HttpResponse.json({
      members: [
        {
          id: "member-1",
          role: "ADMIN",
          user: {
            id: "user-1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
          },
        },
      ],
    })
  ),

  http.post(`${BASE}/company/current/team/invite`, () =>
    HttpResponse.json({ message: "Invitation sent" })
  ),

  // ─── Notifications ───────────────────────────────────────────
  http.get(`${BASE}/notifications/user`, () =>
    HttpResponse.json({
      notifications: [
        {
          id: "notif-1",
          type: "APPLICATION_STATUS",
          title: "Application Updated",
          message: "Your application has been reviewed",
          read: false,
          createdAt: "2026-06-24T00:00:00Z",
          metadata: {},
        },
      ],
      nextCursor: null,
      hasNextPage: false,
    })
  ),

  http.get(`${BASE}/notifications/user/unread-count`, () =>
    HttpResponse.json({ count: 3 })
  ),

  http.patch(`${BASE}/notifications/user/read`, () =>
    HttpResponse.json({ message: "Marked as read" })
  ),

  // ─── Admin ───────────────────────────────────────────────────
  http.get(`${BASE}/admin/stats`, () =>
    HttpResponse.json({
      stats: {
        users: { total: 100, candidates: 70, recruiters: 30 },
        companies: { total: 20, verified: 15 },
        jobs: { total: 50, open: 30 },
        applications: { total: 200, pending: 25 },
      },
    })
  ),

  http.get(`${BASE}/admin/users`, () =>
    HttpResponse.json({
      users: [
        {
          id: "user-1",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          role: "CANDIDATE",
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/admin/jobs`, () =>
    HttpResponse.json({
      jobs: [
        {
          id: "job-1",
          title: "Senior Engineer",
          slug: "senior-engineer",
          status: "OPEN",
          company: { id: "company-1", name: "Acme Corp" },
          createdAt: "2026-01-01T00:00:00Z",
          _count: { applications: 3 },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/admin/companies`, () =>
    HttpResponse.json({
      companies: [
        {
          id: "company-1",
          name: "Acme Corp",
          slug: "acme-corp",
          industry: "Technology",
          size: "50-200",
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
          _count: { jobs: 5, users: 10 },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  // ─── SuperAdmin ──────────────────────────────────────────────
  http.post(`${BASE}/superadmin/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email === "admin@platform.com" && body.password === "admin123") {
      return HttpResponse.json({
        message: "Login successful",
        accessToken: "sa-mock-token",
        refreshToken: "sa-refresh-token",
        admin: { id: "sa-1", email: "admin@platform.com", firstName: "Super", lastName: "Admin" },
      })
    }
    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
  }),

  http.get(`${BASE}/superadmin/stats`, () =>
    HttpResponse.json({
      companies: { total: 20, verified: 15 },
      users: { total: 100, candidates: 70, recruiters: 30 },
      jobs: { total: 50, open: 30 },
      applications: { total: 200 },
    })
  ),

  http.get(`${BASE}/superadmin/candidates`, () =>
    HttpResponse.json({
      candidates: [
        {
          id: "user-1",
          userName: "testuser",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
          _count: { applications: 3 },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/superadmin/companies`, () =>
    HttpResponse.json({
      companies: [
        {
          id: "company-1",
          name: "Acme Corp",
          slug: "acme-corp",
          email: "hr@acme.com",
          industry: "Technology",
          size: "50-200",
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
          _count: { jobs: 5, users: 10 },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/superadmin/jobs`, () =>
    HttpResponse.json({
      jobs: [
        {
          id: "job-1",
          title: "Senior Engineer",
          slug: "senior-engineer",
          status: "OPEN",
          company: { id: "company-1", name: "Acme Corp", slug: "acme-corp" },
          createdAt: "2026-01-01T00:00:00Z",
          _count: { applications: 3 },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/superadmin/security-events`, () =>
    HttpResponse.json({
      events: [
        {
          id: "event-1",
          type: "FAILED_LOGIN",
          userId: "user-1",
          email: "test@example.com",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          metadata: {},
          createdAt: "2026-06-24T00:00:00Z",
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/superadmin/ownerless-companies`, () =>
    HttpResponse.json({
      companies: [
        {
          id: "company-2",
          name: "Orphan Corp",
          slug: "orphan-corp",
          email: "info@orphan.com",
          industry: "Finance",
          size: "10-50",
          isVerified: false,
          createdAt: "2026-03-01T00:00:00Z",
          _count: { jobs: 2, users: 1 },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.delete(`${BASE}/superadmin/candidates/user-1/ban`, () =>
    HttpResponse.json({ message: "Candidate banned" })
  ),

  http.patch(`${BASE}/superadmin/companies/company-1/verify`, () =>
    HttpResponse.json({ message: "Verification status updated" })
  ),

  http.delete(`${BASE}/superadmin/companies/company-1`, () =>
    HttpResponse.json({ message: "Company deleted" })
  ),

  http.delete(`${BASE}/superadmin/jobs/job-1/force-close`, () =>
    HttpResponse.json({ message: "Job force closed" })
  ),

  http.post(`${BASE}/superadmin/companies/company-2/recover-ownership`, () =>
    HttpResponse.json({ message: "Ownership recovered" })
  ),
]
