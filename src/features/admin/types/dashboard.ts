export interface PlatformStats {
	users: { total: number };
	companies: { total: number };
	jobs: { total: number; open: number };
	applications: { total: number; pending: number };
	notifications: { total: number; unread: number };
	generatedAt: string;
}

export interface DashboardMetric {
	label: string;
	value: number;
	sublabel?: string;
	trend?: "up" | "down" | "neutral";
}
