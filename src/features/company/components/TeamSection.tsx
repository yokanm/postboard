import { useTeam } from "../hooks";
import type { TeamMember } from "../types";

export function TeamSection() {
	const { data, isLoading, isError } = useTeam();

	if (isLoading) {
		return (
			<div className="border border-(--rule)">
				<div className="border-b border-(--rule) px-4 py-2">
					<span className="mono-label text-(--primary-container)">// TEAM</span>
				</div>
				<div className="p-4">
					<p className="font-sans text-[13px] text-(--dim)">Loading...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="border border-(--rule)">
				<div className="border-b border-(--rule) px-4 py-2">
					<span className="mono-label text-(--primary-container)">// TEAM</span>
				</div>
				<div className="p-4">
					<p className="font-sans text-[13px] text-(--error)">
						Failed to load team.
					</p>
				</div>
			</div>
		);
	}

	const members = data?.members ?? [];

	return (
		<div className="border border-(--rule)">
			<div className="border-b border-(--rule) px-4 py-2">
				<span className="mono-label text-(--primary-container)">// TEAM</span>
			</div>
			<div className="p-4">
				{members.length === 0 ? (
					<p className="font-sans text-[13px] text-(--dim)">No team members.</p>
				) : (
					<div className="flex flex-col">
						{members.map((member: TeamMember) => (
							<div
								key={member.id}
								className="flex items-center justify-between border-b border-(--rule) py-2 last:border-b-0"
							>
								<div className="flex flex-col">
									<span className="font-sans text-[13px] text-(--on-surface)">
										{member.firstName} {member.lastName}
									</span>
									<span className="mono-label text-[11px] text-(--dim)">
										{member.email}
									</span>
									<span className="mono-label text-[11px] text-(--primary-container)">
										{member.role}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
