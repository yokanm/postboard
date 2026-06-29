export interface SuperAdminJob {
	id: string;
	title: string;
	slug: string;
	status: "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
	company: {
		id: string;
		name: string;
		slug: string;
	};
	createdAt: string;
	_count?: {
		applications: number;
	};
}

export interface SuperAdminJobListResponse {
	jobs: SuperAdminJob[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface SuperAdminJobFilters {
	cursor?: string;
	limit?: number;
	search?: string;
	status?: "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
	companyId?: string;
}
