export interface CompanyProfile {
	id: string;
	name: string;
	slug: string;
	email: string;
	logoUrl: string | null;
	website: string | null;
	industry: string | null;
	size: string | null;
	isVerified: boolean;
	about: string | null;
	createdAt: string;
	_count: {
		jobs: number;
		users: number;
	};
}

export interface CompanyProfileResponse {
	company: CompanyProfile;
}

export interface CompanyUpdated {
	id: string;
	name: string;
	slug: string;
	email: string;
	logoUrl: string | null;
	website: string | null;
	industry: string | null;
	size: string | null;
	isVerified: boolean;
	updatedAt: string;
}

export interface UpdateCompanyResponse {
	message: string;
	company: CompanyUpdated;
}

export interface CompanyLogoResult {
	message: string;
	logoUrl: string;
}

export interface UpdateCompanyPayload {
	name?: string;
	website?: string;
	industry?: string;
	size?: string;
}

export interface TeamMember {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	isVerified: boolean;
	createdAt: string;
}

export interface TeamResponse {
	members: TeamMember[];
}

export interface InviteMemberPayload {
	email: string;
	role?: "RECRUITER" | "CANDIDATE";
}

export interface UpdateMemberRolePayload {
	role: "ADMIN" | "RECRUITER" | "CANDIDATE";
}

export interface JobListingCompany {
	id: string;
	name: string;
	logoUrl: string | null;
	slug: string;
}

export interface JobDetailCompany {
	id: string;
	name: string;
	slug: string;
	logoUrl: string | null;
	website: string | null;
	industry: string | null;
}

export interface CompanyAnalytics {
	totalJobs: number;
	activeJobs: number;
	totalApplications: number;
	totalRecruiters: number;
	totalCandidates: number;
	recentApplications: { date: string; count: number }[];
	statusDistribution: { status: string; count: number }[];
	hiringTrend: { month: string; hires: number }[];
}

export interface AuditLogEntry {
	id: string;
	actorId: string;
	actorName: string;
	action: string;
	details: string | null;
	ip: string | null;
	userAgent: string | null;
	correlationId: string | null;
	createdAt: string;
}

export interface AuditLogResponse {
	logs: AuditLogEntry[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface NotificationItem {
	id: string;
	title: string;
	message: string;
	isRead: boolean;
	type: string;
	link: string | null;
	createdAt: string;
}

export interface NotificationResponse {
	notifications: NotificationItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface TransferOwnershipPayload {
	memberId: string;
}

export interface DashboardStats {
	activeJobs: number;
	totalApplications: number;
	teamMembers: number;
	recentActivity: number;
}
