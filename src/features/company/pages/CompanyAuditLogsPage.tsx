import { ChevronDownIcon, ChevronUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { type Column, DataTable } from "@/shared/components/table/DataTable";
import { TablePagination } from "@/shared/components/table/TablePagination";
import { TableToolbar } from "@/shared/components/table/TableToolbar";
import { useCompanyAuditLogs } from "../hooks";
import type { AuditLogEntry } from "../types";

export function CompanyAuditLogsPage() {
	const [search, setSearch] = useState("");
	const [actionFilter, setActionFilter] = useState("");
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [cursorStack, setCursorStack] = useState<string[]>([]);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const params = {
		cursor,
		search: search || undefined,
		action: actionFilter || undefined,
	};

	const { data, isLoading, isError, refetch } = useCompanyAuditLogs(params);

	const logs = data?.logs ?? [];
	const hasNextPage = data?.hasNextPage ?? false;
	const hasPrevPage = cursorStack.length > 0;

	const filtered = useMemo(
		() => (actionFilter ? logs.filter((l) => l.action === actionFilter) : logs),
		[logs, actionFilter],
	);

	const actions = useMemo(
		() => [...new Set(logs.map((l) => l.action))],
		[logs],
	);

	function goNext() {
		if (data?.nextCursor) {
			setCursorStack((prev) => [...prev, cursor ?? ""]);
			setCursor(data.nextCursor);
		}
	}

	function goPrev() {
		const prev = [...cursorStack];
		const prevCursor = prev.pop();
		setCursorStack(prev);
		setCursor(prevCursor || undefined);
	}

	const columns: Column<AuditLogEntry>[] = [
		{
			key: "expand",
			header: "",
			render: (l) => (
				<button
					type="button"
					onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
					className="cursor-pointer bg-transparent p-1 text-(--dim) hover:text-(--on-surface)"
					aria-label={
						expandedId === l.id ? "Collapse details" : "Expand details"
					}
				>
					<HugeiconsIcon
						icon={expandedId === l.id ? ChevronUpIcon : ChevronDownIcon}
						strokeWidth={2}
						className="h-3.5 w-3.5"
						aria-hidden="true"
					/>
				</button>
			),
			className: "w-8",
		},
		{
			key: "timestamp",
			header: "Timestamp",
			render: (l) => (
				<span className="font-sans text-[12px] text-(--dim) whitespace-nowrap">
					{new Date(l.createdAt).toLocaleString()}
				</span>
			),
			hideOnMobile: true,
		},
		{
			key: "actor",
			header: "Actor",
			render: (l) => (
				<span className="font-sans text-[13px] text-(--on-surface)">
					{l.actorName}
				</span>
			),
		},
		{
			key: "action",
			header: "Action",
			render: (l) => (
				<span className="mono-label text-[11px] uppercase text-(--primary-container)">
					{l.action.replace(/_/g, " ")}
				</span>
			),
		},
		{
			key: "details",
			header: "Details",
			render: (l) => (
				<span className="font-sans text-[12px] text-(--dim) max-w-[200px] truncate block">
					{l.details ?? "—"}
				</span>
			),
			hideOnMobile: true,
		},
		{
			key: "ip",
			header: "IP",
			render: (l) => (
				<span className="font-sans text-[11px] text-(--muted) font-mono">
					{l.ip ?? "—"}
				</span>
			),
			hideOnMobile: true,
		},
	];

	return (
		<div className="flex flex-col gap-4 p-4 sm:p-6">
			<div className="flex flex-col gap-1">
				<span className="mono-label text-(--primary-container)">
					// AUDIT_LOGS
				</span>
				<h1 className="font-headline m-0 text-(--on-surface) text-[24px] sm:text-[32px]">
					Audit Logs
				</h1>
				<p className="font-sans text-[14px] text-(--body)">
					Track changes and actions within your company.
				</p>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="flex-1">
					<TableToolbar
						searchValue={search}
						onSearchChange={(v) => {
							setSearch(v);
							setCursor(undefined);
							setCursorStack([]);
						}}
						searchPlaceholder="Search audit logs..."
					/>
				</div>
				{actions.length > 0 && (
					<select
						value={actionFilter}
						onChange={(e) => {
							setActionFilter(e.target.value);
							setCursor(undefined);
							setCursorStack([]);
						}}
						className="h-9 border border-(--rule) bg-(--background) px-3 font-sans text-[13px] text-(--on-surface) outline-none focus-visible:border-(--primary-container)"
						aria-label="Filter by action"
					>
						<option value="">All actions</option>
						{actions.map((a) => (
							<option key={a} value={a}>
								{a.replace(/_/g, " ")}
							</option>
						))}
					</select>
				)}
			</div>

			<DataTable
				columns={columns}
				data={filtered}
				keyExtractor={(l) => l.id}
				isLoading={isLoading}
				isError={isError}
				onRetry={() => refetch()}
				errorMessage="Failed to load audit logs"
				emptyTitle="No audit logs found"
				emptyDescription={
					search || actionFilter
						? "Try different filters"
						: "No actions have been recorded yet."
				}
			/>

			{/* Expandable detail rows */}
			{expandedId &&
				(() => {
					const entry = filtered.find((l) => l.id === expandedId);
					if (!entry) return null;
					return (
						<div className="border border-(--rule) bg-(--surface-container-low) p-4 -mt-4">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								<div>
									<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
										ID
									</span>
									<p className="font-sans text-[12px] text-(--on-surface) font-mono">
										{entry.id}
									</p>
								</div>
								<div>
									<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
										Actor ID
									</span>
									<p className="font-sans text-[12px] text-(--on-surface) font-mono">
										{entry.actorId}
									</p>
								</div>
								<div>
									<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
										Correlation ID
									</span>
									<p className="font-sans text-[12px] text-(--on-surface) font-mono">
										{entry.correlationId ?? "—"}
									</p>
								</div>
								<div>
									<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
										User Agent
									</span>
									<p className="font-sans text-[12px] text-(--on-surface) break-all">
										{entry.userAgent ?? "—"}
									</p>
								</div>
								<div>
									<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
										IP Address
									</span>
									<p className="font-sans text-[12px] text-(--on-surface)">
										{entry.ip ?? "—"}
									</p>
								</div>
								{entry.details && (
									<div className="sm:col-span-2 lg:col-span-3">
										<span className="mono-label text-[10px] uppercase tracking-[0.05em] text-(--dim)">
											Details
										</span>
										<p className="font-sans text-[12px] text-(--on-surface) whitespace-pre-wrap">
											{entry.details}
										</p>
									</div>
								)}
							</div>
						</div>
					);
				})()}

			<TablePagination
				hasNextPage={hasNextPage}
				hasPrevPage={hasPrevPage}
				onNext={goNext}
				onPrev={goPrev}
				isLoading={isLoading}
			/>
		</div>
	);
}
