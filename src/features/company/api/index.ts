import { endpoints, http } from "@/lib/api/client";
import type {
	AuditLogResponse,
	CompanyAnalytics,
	CompanyLogoResult,
	CompanyProfileResponse,
	InviteMemberPayload,
	NotificationResponse,
	TeamMember,
	TeamResponse,
	UpdateCompanyPayload,
	UpdateCompanyResponse,
	UpdateMemberRolePayload,
} from "../types";

export async function fetchCurrentCompany(): Promise<CompanyProfileResponse> {
	return http.get<CompanyProfileResponse>(endpoints.company.current, true);
}

export async function fetchCompanyById(
	id: string,
): Promise<CompanyProfileResponse> {
	return http.get<CompanyProfileResponse>(endpoints.company.byId(id), true);
}

export async function updateCompany(
	data: UpdateCompanyPayload,
): Promise<UpdateCompanyResponse> {
	return http.patch<UpdateCompanyResponse>(
		endpoints.company.update,
		data,
		true,
	);
}

export async function uploadCompanyLogo(
	file: File,
): Promise<CompanyLogoResult> {
	const formData = new FormData();
	formData.append("logo", file);
	return http.upload<CompanyLogoResult>(
		endpoints.company.uploadLogo,
		formData,
		true,
	);
}

export async function deleteCompanyLogo(): Promise<{ message: string }> {
	return http.delete<{ message: string }>(endpoints.company.deleteLogo, true);
}

export async function fetchTeam(): Promise<TeamResponse> {
	const response = await http.get<{ data: TeamMember[] }>(
		endpoints.company.team,
		true,
	);
	return { members: response.data };
}

export async function inviteTeamMember(
	data: InviteMemberPayload,
): Promise<{ message: string }> {
	return http.post<{ message: string }>(endpoints.company.invite, data, true);
}

export async function updateTeamMemberRole(
	memberId: string,
	data: UpdateMemberRolePayload,
): Promise<{ message: string }> {
	return http.patch<{ message: string }>(
		endpoints.company.teamMemberRole(memberId),
		data,
		true,
	);
}

export async function removeTeamMember(
	memberId: string,
): Promise<{ message: string }> {
	return http.delete<{ message: string }>(
		endpoints.company.removeTeamMember(memberId),
		true,
	);
}

export async function transferOwnership(
	memberId: string,
): Promise<{ message: string }> {
	return http.post<{ message: string }>(
		endpoints.company.transferOwnership(memberId),
		{},
		true,
	);
}

export async function fetchCompanyAnalytics(): Promise<CompanyAnalytics> {
	return http.get<CompanyAnalytics>(endpoints.company.analytics, true);
}

export async function fetchCompanyAuditLogs(params?: {
	cursor?: string;
	action?: string;
	startDate?: string;
	endDate?: string;
}): Promise<AuditLogResponse> {
	const searchParams = new URLSearchParams();
	if (params?.cursor) searchParams.set("cursor", params.cursor);
	if (params?.action) searchParams.set("action", params.action);
	if (params?.startDate) searchParams.set("startDate", params.startDate);
	if (params?.endDate) searchParams.set("endDate", params.endDate);
	const qs = searchParams.toString();
	const url = qs
		? `${endpoints.company.auditLogs}?${qs}`
		: endpoints.company.auditLogs;
	return http.get<AuditLogResponse>(url, true);
}

export async function fetchCompanyNotifications(params?: {
	cursor?: string;
}): Promise<NotificationResponse> {
	const searchParams = new URLSearchParams();
	if (params?.cursor) searchParams.set("cursor", params.cursor);
	const qs = searchParams.toString();
	const url = qs
		? `${endpoints.notification.company.list}?${qs}`
		: endpoints.notification.company.list;
	return http.get<NotificationResponse>(url, true);
}

export async function markNotificationRead(
	notificationId: string,
): Promise<{ message: string }> {
	return http.patch<{ message: string }>(
		endpoints.notification.company.markSingleRead(notificationId),
		{},
		true,
	);
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
	return http.patch<{ message: string }>(
		endpoints.notification.company.markRead,
		{},
		true,
	);
}
