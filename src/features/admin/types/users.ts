export interface AdminUser {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "CANDIDATE" | "RECRUITER" | "ADMIN";
	isVerified: boolean;
	companyId: string | null;
	createdAt: string;
}

export interface AdminUserListResponse {
	users: AdminUser[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface AdminUserFilters {
	search?: string;
	role?: "CANDIDATE" | "RECRUITER" | "ADMIN";
	limit?: number;
	cursor?: string;
}

export interface UserDetail extends AdminUser {
	profile?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		location?: string;
		skills?: string[];
		bio?: string;
	};
	company?: {
		id: string;
		name: string;
	} | null;
}
