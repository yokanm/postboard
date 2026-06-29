import { AdminJobTable } from "../components/jobs/AdminJobTable";

export function AdminJobsPage() {
	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// JOB MODERATION
				</div>
				<AdminJobTable />
			</div>
		</div>
	);
}
