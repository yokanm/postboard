import { Loading03Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/dialogs/ConfirmDialog";
import { type Column, DataTable } from "@/shared/components/table/DataTable";
import { TableToolbar } from "@/shared/components/table/TableToolbar";
import {
	useCurrentCompany,
	useInviteTeamMember,
	useRemoveTeamMember,
	useTeam,
	useTransferOwnership,
	useUpdateTeamMemberRole,
} from "../hooks";
import type { TeamMember } from "../types";

export function CompanyTeamPage() {
	const { data: companyResp } = useCurrentCompany();
	const { data, isLoading, isError, refetch } = useTeam();
	const inviteMutation = useInviteTeamMember();
	const updateRoleMutation = useUpdateTeamMemberRole();
	const removeMutation = useRemoveTeamMember();
	const transferMutation = useTransferOwnership();

	const [search, setSearch] = useState("");
	const [inviteEmail, setInviteEmail] = useState("");
	const [showInvite, setShowInvite] = useState(false);
	const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
	const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null);

	const members = data?.members ?? [];
	const filtered = useMemo(
		() =>
			members.filter((m) => {
				if (!search) return true;
				const q = search.toLowerCase();
				return (
					m.firstName.toLowerCase().includes(q) ||
					m.lastName.toLowerCase().includes(q) ||
					m.email.toLowerCase().includes(q) ||
					m.role.toLowerCase().includes(q)
				);
			}),
		[members, search],
	);

	async function handleInvite(e: React.FormEvent) {
		e.preventDefault();
		if (!inviteEmail) return;
		try {
			await inviteMutation.mutateAsync({ email: inviteEmail });
			toast.success("Invitation sent");
			setInviteEmail("");
			setShowInvite(false);
		} catch {
			toast.error("Failed to send invitation");
		}
	}

	async function handleRemove() {
		if (!removeTarget) return;
		await removeMutation.mutateAsync(removeTarget.id);
		setRemoveTarget(null);
	}

	async function handleTransfer() {
		if (!transferTarget) return;
		await transferMutation.mutateAsync(transferTarget.id);
		setTransferTarget(null);
	}

	const columns: Column<TeamMember>[] = [
		{
			key: "name",
			header: "Name",
			render: (m) => (
				<div className="flex flex-col">
					<span className="font-sans text-[13px] text-(--on-surface)">
						{m.firstName} {m.lastName}
					</span>
					<span className="font-sans text-[12px] text-(--dim)">{m.email}</span>
				</div>
			),
			hideOnMobile: false,
		},
		{
			key: "role",
			header: "Role",
			render: (m) => (
				<span
					className={`mono-label text-[11px] uppercase ${
						m.role === "ADMIN"
							? "text-(--primary)"
							: m.role === "OWNER"
								? "text-(--live)"
								: "text-(--dim)"
					}`}
				>
					{m.role === "OWNER"
						? "Owner"
						: m.role === "ADMIN"
							? "Admin"
							: m.role === "RECRUITER"
								? "Recruiter"
								: m.role === "CANDIDATE"
									? "Candidate"
									: m.role}
				</span>
			),
			hideOnMobile: false,
		},
		{
			key: "verified",
			header: "Verified",
			render: (m) => (
				<span
					className={`font-sans text-[12px] ${m.isVerified ? "text-(--live)" : "text-(--warning)"}`}
				>
					{m.isVerified ? "Yes" : "No"}
				</span>
			),
			hideOnMobile: true,
		},
		{
			key: "joined",
			header: "Joined",
			render: (m) => (
				<span className="font-sans text-[12px] text-(--dim)">
					{new Date(m.createdAt).toLocaleDateString()}
				</span>
			),
			hideOnMobile: true,
		},
		{
			key: "actions",
			header: "Actions",
			render: (m) => (
				<div className="flex items-center gap-1">
					{m.role !== "OWNER" && (
						<>
							<button
								type="button"
								onClick={() => {
									const nextRole =
										m.role === "RECRUITER" ? "ADMIN" : "RECRUITER";
									updateRoleMutation.mutate({
										memberId: m.id,
										data: {
											role: nextRole as "ADMIN" | "RECRUITER" | "CANDIDATE",
										},
									});
								}}
								className="mono-label cursor-pointer bg-transparent px-1.5 py-1 text-[10px] uppercase tracking-[0.05em] text-(--primary-container) transition-colors hover:text-(--primary) disabled:opacity-50"
								disabled={updateRoleMutation.isPending}
								title={
									m.role === "RECRUITER"
										? "Promote to Admin"
										: "Demote to Recruiter"
								}
							>
								{m.role === "RECRUITER" ? "Promote" : "Demote"}
							</button>
							<button
								type="button"
								onClick={() => setRemoveTarget(m)}
								className="mono-label cursor-pointer bg-transparent px-1.5 py-1 text-[10px] uppercase tracking-[0.05em] text-(--error) transition-colors hover:text-(--destructive)"
							>
								Remove
							</button>
						</>
					)}
					{m.role !== "OWNER" && companyResp?.company && (
						<button
							type="button"
							onClick={() => setTransferTarget(m)}
							className="mono-label cursor-pointer bg-transparent px-1.5 py-1 text-[10px] uppercase tracking-[0.05em] text-(--warning) transition-colors hover:text-(--destructive)"
							title="Transfer ownership"
						>
							Transfer
						</button>
					)}
				</div>
			),
			hideOnMobile: false,
		},
	];

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6">
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<span className="mono-label text-(--primary-container)">
						// TEAM_MANAGEMENT
					</span>
					<h1 className="font-headline m-0 text-(--on-surface) text-[24px] sm:text-[32px]">
						Team
					</h1>
					<p className="font-sans text-[14px] text-(--body)">
						Manage your team members and their roles.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowInvite(!showInvite)}
					className="flex items-center gap-1.5 border border-(--primary-container) bg-(--primary-container) px-3 py-1.5 font-sans text-[12px] text-(--on-primary-container) transition-colors hover:bg-(--press-amber) sm:self-start"
				>
					<HugeiconsIcon
						icon={UserAdd01Icon}
						strokeWidth={2}
						className="h-4 w-4"
						aria-hidden="true"
					/>
					Invite Member
				</button>
			</div>

			{showInvite && (
				<form onSubmit={handleInvite} className="border border-(--rule) p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
						<div className="flex flex-col gap-1 flex-1">
							<label
								htmlFor="invite-email"
								className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)"
							>
								Email Address
							</label>
							<input
								id="invite-email"
								type="email"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								placeholder="colleague@company.com"
								className="h-9 border border-(--rule) bg-(--background) px-3 font-sans text-[13px] text-(--on-surface) outline-none focus-visible:border-(--primary-container) focus-visible:ring-[3px] focus-visible:ring-(--primary-container)"
								autoComplete="email"
								required
							/>
						</div>
						<button
							type="submit"
							disabled={inviteMutation.isPending || !inviteEmail}
							className="flex items-center gap-1.5 border border-(--primary-container) bg-(--primary-container) px-4 py-1.5 font-sans text-[12px] text-(--on-primary-container) transition-colors hover:bg-(--press-amber) disabled:opacity-50"
						>
							{inviteMutation.isPending && (
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className="h-3.5 w-3.5 animate-spin"
									aria-hidden="true"
								/>
							)}
							Send Invite
						</button>
					</div>
				</form>
			)}

			<TableToolbar
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search team members..."
			/>

			<DataTable
				columns={columns}
				data={filtered}
				keyExtractor={(m) => m.id}
				isLoading={isLoading}
				isError={isError}
				onRetry={() => refetch()}
				errorMessage="Failed to load team members"
				emptyTitle="No team members found"
				emptyDescription={
					search
						? "Try a different search term"
						: "Invite your first team member to get started."
				}
			/>

			<ConfirmDialog
				open={!!removeTarget}
				onOpenChange={(o) => !o && setRemoveTarget(null)}
				title="Remove Team Member"
				description={`Are you sure you want to remove ${removeTarget?.firstName} ${removeTarget?.lastName} from the team?`}
				confirmLabel="Remove"
				variant="danger"
				onConfirm={handleRemove}
				isLoading={removeMutation.isPending}
			/>

			<ConfirmDialog
				open={!!transferTarget}
				onOpenChange={(o) => !o && setTransferTarget(null)}
				title="Transfer Ownership"
				description={`Transfer company ownership to ${transferTarget?.firstName} ${transferTarget?.lastName}? This action is irreversible. You will lose owner permissions.`}
				confirmLabel="Transfer Ownership"
				variant="danger"
				onConfirm={handleTransfer}
				isLoading={transferMutation.isPending}
			/>
		</div>
	);
}
