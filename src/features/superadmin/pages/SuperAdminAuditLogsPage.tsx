import { EmptyState } from "@/shared/components/ux/EmptyState";

export function SuperAdminAuditLogsPage() {
	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// AUDIT LOGS
				</div>
				<p className="mb-4 font-sans text-[13px] text-(--dim)">
					Audit logs are available in the Admin panel. The SuperAdmin API does
					not expose a dedicated audit log endpoint.
				</p>
				<EmptyState
					title="No audit logs available"
					description="SuperAdmin audit logs are managed through the Admin panel. Navigate to the Admin section to view platform audit history."
				/>
			</div>
		</div>
	);
}
