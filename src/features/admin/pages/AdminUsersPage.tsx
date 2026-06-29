import { useState } from "react";
import { UserDetailDrawer } from "../components/users/UserDetailDrawer";
import { UserTable } from "../components/users/UserTable";
import type { AdminUser } from "../types";

export function AdminUsersPage() {
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleSelectUser = (user: AdminUser) => {
		setSelectedUser(user);
		setDrawerOpen(true);
	};

	return (
		<div className="space-y-6">
			<div>
				<div className="mono-label mb-4 text-[11px] uppercase tracking-[0.05em] text-(--dim)">
					// USER MANAGEMENT
				</div>
				<UserTable onSelectUser={handleSelectUser} />
			</div>

			<UserDetailDrawer
				user={selectedUser}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			/>
		</div>
	);
}
