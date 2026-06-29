export interface AdminCompany {
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

export interface AdminCompanyListResponse {
	companies: AdminCompany[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface AdminCompanyFilters {
	search?: string;
	verified?: boolean;
	limit?: number;
	cursor?: string;
}
