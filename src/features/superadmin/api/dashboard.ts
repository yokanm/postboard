import { http } from "@/lib/api/client";
import { env } from "@/lib/env";
import type { SuperAdminStats } from "../types";

const BASE_URL = env.apiUrl;

export async function fetchSuperAdminStats(): Promise<SuperAdminStats> {
	const data = await http.superadmin.get<SuperAdminStats>(
		`${BASE_URL}/superadmin/stats`,
	);
	return data;
}
