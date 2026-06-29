export interface AdminJob {
	id: string;
	title: string;
	slug: string;
	status: "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
	locationType: "REMOTE" | "ONSITE" | "HYBRID";
	experienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD";
	createdAt: string;
	expiresAt: string;
	company: {
		id: string;
		name: string;
	};
	_count: {
		applications: number;
	};
}

export interface AdminJobListResponse {
	jobs: AdminJob[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface AdminJobFilters {
	search?: string;
	status?: "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
	limit?: number;
	cursor?: string;
}
