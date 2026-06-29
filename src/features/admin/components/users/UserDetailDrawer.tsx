import { useEffect, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { endpoints, http } from "@/lib/api/client";
import type { AdminUser } from "../../types";

interface CompanyInfo {
	id: string;
	name: string;
}

interface UserDetailDrawerProps {
	user: AdminUser | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({
	user,
	open,
	onOpenChange,
}: UserDetailDrawerProps) {
	const [company, setCompany] = useState<CompanyInfo | null>(null);
	const [loadingCompany, setLoadingCompany] = useState(false);

	useEffect(() => {
		if (user?.companyId) {
			setLoadingCompany(true);
			const params = new URLSearchParams({ search: user.companyId });
			http
				.get<{
					data: { id: string; name: string }[];
					nextCursor: string | null;
					hasNextPage: boolean;
				}>(`${endpoints.admin.companies}?${params.toString()}`, true)
				.then((res) => {
					const match = res.data?.find((c) => c.id === user.companyId);
					if (match) {
						setCompany(match);
					} else {
						setCompany(null);
					}
				})
				.catch(() => setCompany(null))
				.finally(() => setLoadingCompany(false));
		} else {
			setCompany(null);
		}
	}, [user?.companyId]);

	if (!user) return null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full border-l-(--rule) bg-(--surface-container-lowest) text-(--on-surface) sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="font-serif text-lg">
						{user.firstName} {user.lastName}
					</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-4">
					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// EMAIL
						</span>
						<p className="mt-1 font-sans text-[13px] text-(--on-surface)">
							{user.email}
						</p>
					</div>

					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// USERNAME
						</span>
						<p className="mt-1 font-sans text-[13px] text-(--on-surface)">
							{user.userName}
						</p>
					</div>

					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// ROLE
						</span>
						<p className="mt-1 font-sans text-[13px] text-(--primary-container)">
							{user.role}
						</p>
					</div>

					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// STATUS
						</span>
						<p className="mt-1 font-sans text-[13px] text-(--on-surface)">
							{user.isVerified ? "Verified" : "Unverified"}
						</p>
					</div>

					{user.companyId && (
						<div>
							<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
								// COMPANY
							</span>
							{loadingCompany ? (
								<p className="mt-1 font-sans text-[13px] text-(--dim)">
									Loading...
								</p>
							) : company ? (
								<p className="mt-1 font-sans text-[13px] text-(--on-surface)">
									{company.name}
								</p>
							) : (
								<p className="mt-1 font-sans text-[13px] text-(--on-surface)">
									{user.companyId}
								</p>
							)}
						</div>
					)}

					<div>
						<span className="mono-label text-[11px] uppercase tracking-[0.05em] text-(--dim)">
							// JOINED
						</span>
						<p className="mt-1 font-sans text-[13px] text-(--on-surface)">
							{new Date(user.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
