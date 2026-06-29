import {
	HelpCircleIcon,
	Logout03Icon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import type { UserRole } from "@/shared/types/api";

function getSettingsPath(role: UserRole): string {
	switch (role) {
		case "CANDIDATE":
			return "/candidate/profile";
		case "RECRUITER":
			return "/recruiter/profile";
		case "ADMIN":
			return "/company/profile";
		case "SUPERADMIN":
			return "/superadmin/dashboard";
		default:
			return "/candidate/profile";
	}
}

export function UserMenu() {
	const navigate = useNavigate();
	const { data: user } = useCurrentUser();
	const logoutMutation = useLogout();

	function handleLogout() {
		logoutMutation.mutate();
	}

	const initials = user
		? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
		: "PB";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-8 w-8 items-center justify-center border border-(--rule) bg-(--surface-container-high) text-[12px] font-semibold uppercase text-(--on-surface) transition-colors hover:border-(--primary-container)"
					aria-label="User menu"
				>
					{initials || "PB"}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-48 rounded-none border-(--rule) bg-(--surface-container-lowest)"
			>
				<DropdownMenuLabel className="mono-label text-(--dim)">
					{user?.email ?? "USER_SESSION"}
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-(--rule)" />
				<DropdownMenuItem
					className="gap-2 text-(--body) focus:bg-(--surface-container) focus:text-(--on-surface)"
					onSelect={() =>
						navigate({ to: getSettingsPath(user?.role ?? "CANDIDATE") })
					}
				>
					<HugeiconsIcon
						icon={Settings01Icon}
						strokeWidth={1.5}
						className="h-4 w-4"
						aria-hidden="true"
					/>
					<span className="mono-label text-[11px] uppercase">Settings</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="gap-2 text-(--body) focus:bg-(--surface-container) focus:text-(--on-surface)"
					onSelect={() => navigate({ to: "/contact" })}
				>
					<HugeiconsIcon
						icon={HelpCircleIcon}
						strokeWidth={1.5}
						className="h-4 w-4"
						aria-hidden="true"
					/>
					<span className="mono-label text-[11px] uppercase">Help</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator className="bg-(--rule)" />
				<DropdownMenuItem
					className="gap-2 text-(--body) focus:bg-(--surface-container) focus:text-(--on-surface)"
					onSelect={handleLogout}
				>
					<HugeiconsIcon
						icon={Logout03Icon}
						strokeWidth={1.5}
						className="h-4 w-4"
						aria-hidden="true"
					/>
					<span className="mono-label text-[11px] uppercase">Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
