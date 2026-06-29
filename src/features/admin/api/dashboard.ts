import { endpoints, http } from "@/lib/api/client";
import type { PlatformStats } from "../types";

export async function fetchAdminStats(): Promise<PlatformStats> {
	return http.get<PlatformStats>(endpoints.admin.stats, true);
}
