import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ux/EmptyState";
import { ErrorState } from "@/shared/components/ux/ErrorState";
import { useCursorPagination } from "@/shared/hooks";
import { useSuperAdminSecurityEvents } from "../hooks";

const EVENT_TYPES = [
	"LOGIN_FAILED",
	"ACCOUNT_LOCKED",
	"ROLE_CHANGE",
	"PERMISSION_ESCALATION",
	"PASSWORD_RESET",
	"EMAIL_CHANGE",
	"API_KEY_CREATED",
	"SUSPICIOUS_ACTIVITY",
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function SuperAdminSecurityPage() {
	const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
	const [severityFilter, setSeverityFilter] = useState<string>("");
	const pagination = useCursorPagination();

	const { data, isLoading, isError, refetch } = useSuperAdminSecurityEvents({
		cursor: pagination.cursor,
		eventType: eventTypeFilter || undefined,
		severity: severityFilter || undefined,
	});

	const events = data?.events ?? [];
	const hasNextPage = data?.hasNextPage ?? false;

	if (isError) {
		return (
			<ErrorState
				message="Failed to load security events"
				onRetry={() => refetch()}
			/>
		);
	}

	const severityColor = (severity: string) => {
		switch (severity) {
			case "CRITICAL":
				return "border-(--error) text-(--error) bg-(--error)/10";
			case "HIGH":
				return "border-(--warning) text-(--warning)";
			case "MEDIUM":
				return "border-(--primary) text-(--primary)";
			default:
				return "border-(--dim) text-(--dim)";
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// SECURITY EVENTS
				</div>
				<p className="mb-4 font-sans text-[13px] text-(--dim)">
					Monitor security-related events across the platform including failed
					logins, role changes, and permission escalations.
				</p>

				<div className="mb-4 flex flex-wrap items-center gap-3">
					<select
						value={eventTypeFilter}
						onChange={(e) => {
							setEventTypeFilter(e.target.value);
							pagination.reset();
						}}
						className="border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none"
					>
						<option value="">All Event Types</option>
						{EVENT_TYPES.map((type) => (
							<option key={type} value={type}>
								{type.replace(/_/g, " ")}
							</option>
						))}
					</select>
					<select
						value={severityFilter}
						onChange={(e) => {
							setSeverityFilter(e.target.value);
							pagination.reset();
						}}
						className="border border-(--rule) bg-(--surface-container-lowest) px-3 py-2 font-sans text-[13px] text-(--on-surface) outline-none"
					>
						<option value="">All Severities</option>
						{SEVERITIES.map((sev) => (
							<option key={sev} value={sev}>
								{sev}
							</option>
						))}
					</select>
				</div>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-12 w-full bg-(--surface-container-low)"
							/>
						))}
					</div>
				) : events.length === 0 ? (
					<EmptyState
						title="No security events"
						description="No security events have been recorded. This panel monitors failed logins, account locks, role changes, and permission escalations."
					/>
				) : (
					<>
						<div className="overflow-x-auto border border-(--rule)">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-(--rule) bg-(--surface-container-low)">
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Severity
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Type
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Actor
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											IP Address
										</th>
										<th className="mono-label px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] text-(--dim)">
											Timestamp
										</th>
									</tr>
								</thead>
								<tbody>
									{events.map((event) => (
										<tr
											key={event.id}
											className="border-b border-(--rule) transition-colors hover:bg-(--surface-container-low)"
										>
											<td className="px-4 py-3">
												<span
													className={`mono-label inline-block border px-2 py-0.5 text-[10px] uppercase ${severityColor(event.severity)}`}
												>
													{event.severity}
												</span>
											</td>
											<td className="px-4 py-3">
												<span className="mono-label text-[11px] uppercase text-(--error)">
													{event.eventType}
												</span>
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--on-surface)">
												{event.actorId ?? "—"}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim) font-mono">
												{event.ipAddress ?? "—"}
											</td>
											<td className="px-4 py-3 font-sans text-[13px] text-(--dim)">
												{new Date(event.createdAt).toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="flex items-center justify-between border-x border-b border-(--rule) px-4 py-3">
							<button
								onClick={pagination.goPrev}
								disabled={!pagination.hasPrevPage}
								className="border border-(--rule) px-3 py-1 font-sans text-[12px] text-(--on-surface) disabled:opacity-50"
							>
								Previous
							</button>
							<button
								onClick={() => pagination.goNext(data?.nextCursor)}
								disabled={!hasNextPage}
								className="border border-(--rule) px-3 py-1 font-sans text-[12px] text-(--on-surface) disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
