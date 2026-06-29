import { env } from "#/lib/env";

const BASE_URL = env.apiUrl;

export const endpoints = {
	auth: {
		base: `${BASE_URL}/auth`,
		login: `${BASE_URL}/auth/login`,
		register: `${BASE_URL}/auth/register`,
		registerCompany: `${BASE_URL}/auth/register/company`,
		loginCompany: `${BASE_URL}/auth/login/company`,
		logout: `${BASE_URL}/auth/logout`,
		refresh: `${BASE_URL}/auth/refresh-token`,
		verifyEmail: `${BASE_URL}/auth/verify-email`,
		sendVerificationEmail: `${BASE_URL}/auth/send-verification-email`,
		forgotPassword: `${BASE_URL}/auth/forgot-password`,
		resetPassword: `${BASE_URL}/auth/reset-password`,
		changePassword: `${BASE_URL}/auth/change-password`,
	},
	user: {
		current: `${BASE_URL}/user/current`,
		profile: `${BASE_URL}/user/current/profile`,
		uploadResume: `${BASE_URL}/user/current/profile/resume`,
		deleteResume: `${BASE_URL}/user/current/profile/resume`,
	},
	job: {
		list: `${BASE_URL}/job`,
		detail: (id: string) => `${BASE_URL}/job/${id}`,
		create: `${BASE_URL}/job`,
		update: (id: string) => `${BASE_URL}/job/${id}`,
		updateStatus: (id: string) => `${BASE_URL}/job/${id}/status`,
		delete: (id: string) => `${BASE_URL}/job/${id}`,
		apply: (id: string) => `${BASE_URL}/job/${id}/apply`,
		applications: (id: string) => `${BASE_URL}/job/${id}/applications`,
		myApplications: `${BASE_URL}/job/my-applications`,
		applicationStatus: (applicationId: string) =>
			`${BASE_URL}/job/applications/${applicationId}/status`,
		withdrawApplication: (applicationId: string) =>
			`${BASE_URL}/job/applications/${applicationId}`,
	},
	tags: {
		list: `${BASE_URL}/tags`,
	},
	company: {
		current: `${BASE_URL}/company/current`,
		byId: (id: string) => `${BASE_URL}/company/${id}`,
		update: `${BASE_URL}/company/current`,
		delete: `${BASE_URL}/company/current`,
		uploadLogo: `${BASE_URL}/company/current/logo`,
		deleteLogo: `${BASE_URL}/company/current/logo`,
		team: `${BASE_URL}/company/current/team`,
		invite: `${BASE_URL}/company/current/team/invite`,
		teamMemberRole: (memberId: string) =>
			`${BASE_URL}/company/current/team/${memberId}/role`,
		removeTeamMember: (memberId: string) =>
			`${BASE_URL}/company/current/team/${memberId}`,
		transferOwnership: (memberId: string) =>
			`${BASE_URL}/company/current/team/${memberId}/transfer-ownership`,
		analytics: `${BASE_URL}/company/current/analytics`,
		recruiterAnalytics: (id: string) =>
			`${BASE_URL}/company/current/recruiters/${id}/analytics`,
		auditLogs: `${BASE_URL}/company/current/audit-logs`,
		ownershipHistory: `${BASE_URL}/company/current/ownership-history`,
	},
	notification: {
		user: {
			list: `${BASE_URL}/notifications/user`,
			unread: `${BASE_URL}/notifications/user/unread-count`,
			markRead: `${BASE_URL}/notifications/user/read`,
			markSingleRead: (id: string) =>
				`${BASE_URL}/notifications/user/${id}/read`,
			delete: (id: string) => `${BASE_URL}/notifications/user/${id}`,
		},
		company: {
			list: `${BASE_URL}/notifications/company`,
			unread: `${BASE_URL}/notifications/company/unread-count`,
			markRead: `${BASE_URL}/notifications/company/read`,
			markSingleRead: (id: string) =>
				`${BASE_URL}/notifications/company/${id}/read`,
			delete: (id: string) => `${BASE_URL}/notifications/company/${id}`,
		},
	},
	admin: {
		stats: `${BASE_URL}/admin/stats`,
		users: `${BASE_URL}/admin/users`,
		deactivateUser: (userId: string) => `${BASE_URL}/admin/users/${userId}`,
		jobs: `${BASE_URL}/admin/jobs`,
		forceCloseJob: (jobId: string) => `${BASE_URL}/admin/jobs/${jobId}/close`,
		deleteJob: (jobId: string) => `${BASE_URL}/admin/jobs/${jobId}`,
		companies: `${BASE_URL}/admin/companies`,
		verifyCompany: (companyId: string) =>
			`${BASE_URL}/admin/companies/${companyId}/verify`,
		auditLogs: `${BASE_URL}/admin/audit-logs`,
	},
	superadmin: {
		login: `${BASE_URL}/superadmin/login`,
		refresh: `${BASE_URL}/superadmin/refresh`,
		logout: `${BASE_URL}/superadmin/logout`,
		stats: `${BASE_URL}/superadmin/stats`,
		companies: `${BASE_URL}/superadmin/companies`,
		verifyCompany: (id: string) =>
			`${BASE_URL}/superadmin/companies/${id}/verify`,
		deleteCompany: (id: string) => `${BASE_URL}/superadmin/companies/${id}`,
		jobs: `${BASE_URL}/superadmin/jobs`,
		forceCloseJob: (id: string) =>
			`${BASE_URL}/superadmin/jobs/${id}/force-close`,
		candidates: `${BASE_URL}/superadmin/candidates`,
		banCandidate: (id: string) => `${BASE_URL}/superadmin/candidates/${id}/ban`,
		securityEvents: `${BASE_URL}/superadmin/security-events`,
		ownerlessCompanies: `${BASE_URL}/superadmin/ownerless-companies`,
		assignOwner: (id: string) =>
			`${BASE_URL}/superadmin/companies/${id}/assign-owner`,
		recoverOwnership: (id: string) =>
			`${BASE_URL}/superadmin/companies/${id}/recover-ownership`,
	},
} as const;
