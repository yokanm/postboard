export interface SuperAdminStats {
	companies: { total: number; verified: number };
	users: { total: number; candidates: number; recruiters: number };
	jobs: { total: number; open: number };
	applications: { total: number };
}

export interface SuperAdminDashboardMetric {
	label: string;
	value: number;
	sublabel?: string;
}
