import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-keys";
import {
	deleteCompanyLogo,
	fetchCompanyAnalytics,
	fetchCompanyAuditLogs,
	fetchCompanyById,
	fetchCompanyNotifications,
	fetchCurrentCompany,
	fetchTeam,
	inviteTeamMember,
	markAllNotificationsRead,
	markNotificationRead,
	removeTeamMember,
	transferOwnership,
	updateCompany,
	updateTeamMemberRole,
	uploadCompanyLogo,
} from "../api";
import type {
	InviteMemberPayload,
	UpdateCompanyPayload,
	UpdateMemberRolePayload,
} from "../types";

export function useCurrentCompany() {
	return useQuery({
		queryKey: queryKeys.company.current(),
		queryFn: fetchCurrentCompany,
		retry: false,
	});
}

export function useCompanyDetail(id: string) {
	return useQuery({
		queryKey: queryKeys.company.detail(id),
		queryFn: () => fetchCompanyById(id),
		enabled: !!id,
	});
}

export function useUpdateCompany() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateCompanyPayload) => updateCompany(data),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.current() });
			toast.success("Company updated");
		},
	});
}

export function useUploadCompanyLogo() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => uploadCompanyLogo(file),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.current() });
			toast.success("Logo uploaded");
		},
	});
}

export function useDeleteCompanyLogo() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => deleteCompanyLogo(),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.current() });
			toast.success("Logo removed");
		},
	});
}

export function useTeam() {
	return useQuery({
		queryKey: queryKeys.company.team(),
		queryFn: fetchTeam,
	});
}

export function useInviteTeamMember() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: InviteMemberPayload) => inviteTeamMember(data),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.team() });
			toast.success("Team member invited");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to invite member",
			);
		},
	});
}

export function useUpdateTeamMemberRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			memberId,
			data,
		}: {
			memberId: string;
			data: UpdateMemberRolePayload;
		}) => updateTeamMemberRole(memberId, data),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.team() });
			toast.success("Member role updated");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update role",
			);
		},
	});
}

export function useRemoveTeamMember() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) => removeTeamMember(memberId),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.team() });
			toast.success("Member removed");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to remove member",
			);
		},
	});
}

export function useTransferOwnership() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) => transferOwnership(memberId),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: queryKeys.company.team() });
			queryClient.invalidateQueries({ queryKey: queryKeys.company.current() });
			toast.success("Ownership transferred");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to transfer ownership",
			);
		},
	});
}

export function useCompanyAnalytics() {
	return useQuery({
		queryKey: queryKeys.company.analytics(),
		queryFn: fetchCompanyAnalytics,
	});
}

export function useCompanyAuditLogs(params?: {
	cursor?: string;
	action?: string;
	search?: string;
	from?: string;
	to?: string;
}) {
	return useQuery({
		queryKey: queryKeys.company.auditLogs(params as Record<string, unknown>),
		queryFn: () => fetchCompanyAuditLogs(params),
	});
}

export function useCompanyNotifications(params?: { cursor?: string }) {
	return useQuery({
		queryKey: [...queryKeys.company.all, "notifications", params] as const,
		queryFn: () => fetchCompanyNotifications(params),
	});
}

export function useMarkNotificationRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (notificationId: string) =>
			markNotificationRead(notificationId),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [...queryKeys.company.all, "notifications"],
			});
		},
	});
}

export function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => markAllNotificationsRead(),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [...queryKeys.company.all, "notifications"],
			});
			toast.success("All notifications marked as read");
		},
	});
}
