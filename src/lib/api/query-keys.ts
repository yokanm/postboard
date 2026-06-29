// ─── TanStack Query Key Factory ────────────────────────────
// Centralized, type-safe query keys for cache management.

export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		user: () => [...queryKeys.auth.all, "user"] as const,
	},
	profile: {
		all: ["profile"] as const,
		detail: () => [...queryKeys.profile.all, "detail"] as const,
	},
	job: {
		all: ["jobs"] as const,
		list: (params?: Record<string, unknown>) =>
			[...queryKeys.job.all, "list", params] as const,
		detail: (id: string) => [...queryKeys.job.all, "detail", id] as const,
		myApplications: () => [...queryKeys.job.all, "my-applications"] as const,
		applications: (jobId: string) =>
			[...queryKeys.job.all, "applications", jobId] as const,
	},
	tag: {
		all: ["tags"] as const,
		list: (params?: Record<string, unknown>) =>
			[...queryKeys.tag.all, "list", params] as const,
	},
	company: {
		all: ["companies"] as const,
		current: () => [...queryKeys.company.all, "current"] as const,
		detail: (id: string) => [...queryKeys.company.all, "detail", id] as const,
		team: () => [...queryKeys.company.all, "team"] as const,
		analytics: () => [...queryKeys.company.all, "analytics"] as const,
		auditLogs: (params?: Record<string, unknown>) =>
			[...queryKeys.company.all, "audit-logs", params] as const,
		recruiterAnalytics: (id: string) =>
			[...queryKeys.company.all, "recruiter-analytics", id] as const,
	},
	notification: {
		all: ["notifications"] as const,
		list: (params?: Record<string, unknown>) =>
			[...queryKeys.notification.all, "list", params] as const,
		unread: () => [...queryKeys.notification.all, "unread"] as const,
		company: {
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.notification.all, "company", "list", params] as const,
			unread: () =>
				[...queryKeys.notification.all, "company", "unread"] as const,
		},
	},
	admin: {
		all: ["admin"] as const,
		stats: () => [...queryKeys.admin.all, "stats"] as const,
		users: {
			all: () => [...queryKeys.admin.all, "users"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.admin.users.all(), "list", params] as const,
		},
		jobs: {
			all: () => [...queryKeys.admin.all, "jobs"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.admin.jobs.all(), "list", params] as const,
		},
		companies: {
			all: () => [...queryKeys.admin.all, "companies"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.admin.companies.all(), "list", params] as const,
		},
		auditLogs: {
			all: () => [...queryKeys.admin.all, "audit-logs"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.admin.auditLogs.all(), "list", params] as const,
		},
	},
	superadmin: {
		all: ["superadmin"] as const,
		stats: () => [...queryKeys.superadmin.all, "stats"] as const,
		companies: {
			all: () => [...queryKeys.superadmin.all, "companies"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.superadmin.companies.all(), "list", params] as const,
		},
		jobs: {
			all: () => [...queryKeys.superadmin.all, "jobs"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.superadmin.jobs.all(), "list", params] as const,
		},
		candidates: {
			all: () => [...queryKeys.superadmin.all, "candidates"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.superadmin.candidates.all(), "list", params] as const,
		},
		securityEvents: {
			all: () => [...queryKeys.superadmin.all, "security-events"] as const,
			list: (params?: Record<string, unknown>) =>
				[...queryKeys.superadmin.securityEvents.all(), "list", params] as const,
		},
		ownerlessCompanies: {
			all: () => [...queryKeys.superadmin.all, "ownerless-companies"] as const,
			list: (params?: Record<string, unknown>) =>
				[
					...queryKeys.superadmin.ownerlessCompanies.all(),
					"list",
					params,
				] as const,
		},
	},
} as const;
