export interface SuperAdminCandidate {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	isVerified: boolean;
	createdAt: string;
	profile?: {
		skills?: string[];
		location?: string;
	};
	_count?: {
		applications: number;
	};
}

export interface SuperAdminUserListResponse {
	candidates: SuperAdminCandidate[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface SuperAdminUserFilters {
	cursor?: string;
	limit?: number;
	search?: string;
}

export interface SuperAdminCompanyListItem {
	id: string;
	name: string;
	slug: string;
	email: string;
	industry: string;
	size: string;
	isVerified: boolean;
	createdAt: string;
	_count: {
		jobs: number;
		users: number;
	};
}

export interface SuperAdminCompanyListResponse {
	companies: SuperAdminCompanyListItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface SuperAdminCompanyFilters {
	cursor?: string;
	limit?: number;
	search?: string;
	isVerified?: boolean;
}
