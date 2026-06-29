import { AppError } from "@/middleware/errorHandler";

export interface Actor {
	id: string;
	role: string;
	companyId?: string | null;
}

export interface CompanyResource {
	companyId: string;
}

export interface OwnedCompanyResource {
	id: string;
	primaryAdminId?: string | null;
}

export interface UserResource {
	id: string;
	companyId?: string | null;
	role?: string;
}

export interface JobResource {
	companyId: string;
	postedById?: string;
}

export interface ApplicationResource {
	job: { companyId: string };
}

export const ADMIN_LIMIT_ERROR =
	"Company already has the maximum number of administrators.";

export function isCompanyOwner(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): boolean {
	return (
		actor.role === "ADMIN" &&
		actor.companyId === company.id &&
		company.primaryAdminId === actor.id
	);
}

export function isSecondaryAdmin(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): boolean {
	return (
		actor.role === "ADMIN" &&
		actor.companyId === company.id &&
		company.primaryAdminId !== actor.id
	);
}

export function assertCompanyOwner(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): void {
	if (!isCompanyOwner(actor, company)) {
		throw new AppError("Only the company owner may perform this action.", 403);
	}
}

export function assertCompanyAdmin(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): void {
	if (!isCompanyOwner(actor, company) && !isSecondaryAdmin(actor, company)) {
		throw new AppError("Company administrator access required.", 403);
	}
}

export function canManageCompany(
	actor: Actor,
	targetCompanyId: string,
): boolean {
	return actor.companyId === targetCompanyId && actor.role === "ADMIN";
}

export function canManageUser(actor: Actor, targetUser: UserResource): boolean {
	if (actor.role !== "ADMIN") return false;
	return actor.companyId != null && actor.companyId === targetUser.companyId;
}

export function canManageJob(actor: Actor, job: JobResource): boolean {
	if (!["ADMIN", "RECRUITER"].includes(actor.role)) return false;
	if (actor.companyId == null || actor.companyId !== job.companyId)
		return false;
	// RECRUITERs may only manage jobs they posted; ADMINs may manage all company jobs
	if (actor.role === "RECRUITER") {
		if (!job.postedById || actor.id !== job.postedById) return false;
	}
	return true;
}

export function canManageApplication(
	actor: Actor,
	application: ApplicationResource,
): boolean {
	if (!["ADMIN", "RECRUITER"].includes(actor.role)) return false;
	return (
		actor.companyId != null && actor.companyId === application.job.companyId
	);
}

export function canViewAuditLogs(
	actor: Actor,
	targetCompanyId?: string,
): boolean {
	if (actor.role !== "ADMIN") return false;
	return actor.companyId === targetCompanyId;
}

export function canManageRecruiter(
	actor: Actor,
	targetUser: UserResource,
): boolean {
	if (actor.role !== "ADMIN") return false;
	return actor.companyId != null && actor.companyId === targetUser.companyId;
}

export function canViewAnalytics(
	actor: Actor,
	targetCompanyId: string,
): boolean {
	if (actor.role === "ADMIN") return actor.companyId === targetCompanyId;
	return false;
}

export function assertCanManageCompany(
	actor: Actor,
	targetCompanyId: string,
): void {
	if (!canManageCompany(actor, targetCompanyId)) {
		throw new AppError(
			"You do not have permission to manage this company.",
			403,
		);
	}
}

export function assertCanManageJob(actor: Actor, job: JobResource): void {
	if (!canManageJob(actor, job)) {
		throw new AppError("You do not have permission to manage this job.", 403);
	}
}

export function assertCanManageApplication(
	actor: Actor,
	application: ApplicationResource,
): void {
	if (!canManageApplication(actor, application)) {
		throw new AppError(
			"You do not have permission to manage this application.",
			403,
		);
	}
}

export function canDeleteJob(
	actor: Pick<Actor, "role" | "companyId">,
	job: JobResource,
): boolean {
	return (
		actor.role === "ADMIN" &&
		actor.companyId != null &&
		actor.companyId === job.companyId
	);
}

export function assertCanDeleteJob(
	actor: Pick<Actor, "role" | "companyId">,
	job: JobResource,
): void {
	if (!canDeleteJob(actor, job)) {
		throw new AppError("You do not have permission to delete this job.", 403);
	}
}

// ─── Centralized tenant / ownership assertions (Phase 3) ────────────────────

export function assertSameCompany(actor: Actor, targetCompanyId: string): void {
	if (!actor.companyId || actor.companyId !== targetCompanyId) {
		throw new AppError("Cross-tenant access denied.", 403);
	}
}

export function assertTenantAccess(
	actor: Actor,
	resourceCompanyId: string,
): void {
	if (!actor.companyId || actor.companyId !== resourceCompanyId) {
		throw new AppError("You do not have access to this resource.", 403);
	}
}

export function assertCanDeactivateUser(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	target: { id: string; role: string; companyId: string | null },
	company: OwnedCompanyResource,
): void {
	if (isCompanyOwner(target, company)) {
		throw new AppError("Company owner cannot be deactivated.", 403);
	}
	if (target.role === "ADMIN") {
		throw new AppError("Only SuperAdmin can deactivate an administrator.", 403);
	}
	if (actor.companyId !== target.companyId) {
		throw new AppError("Cross-tenant deactivation denied.", 403);
	}
}

export function assertCanRemoveTeamMember(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	target: { id: string; role: string; companyId: string | null },
	company: OwnedCompanyResource,
): void {
	if (isCompanyOwner(target, company)) {
		throw new AppError("Company owner cannot be removed.", 403);
	}
	if (target.role === "ADMIN") {
		assertCompanyOwner(actor, company);
	}
	if (actor.companyId !== target.companyId) {
		throw new AppError("Cross-tenant removal denied.", 403);
	}
}

function isPrimaryOrSecondaryAdmin(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): boolean {
	return isCompanyOwner(actor, company) || isSecondaryAdmin(actor, company);
}

export function canViewCompanyAnalytics(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): boolean {
	return isPrimaryOrSecondaryAdmin(actor, company);
}

export function assertCanViewCompanyAnalytics(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): void {
	if (!canViewCompanyAnalytics(actor, company)) {
		throw new AppError("Company analytics require administrator access.", 403);
	}
}

export function canViewRecruiterAnalytics(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	targetUserId: string,
	company: OwnedCompanyResource,
): boolean {
	if (!actor.companyId || actor.companyId !== company.id) return false;
	if (isPrimaryOrSecondaryAdmin(actor, company)) return true;
	return actor.role === "RECRUITER" && actor.id === targetUserId;
}

export function assertCanViewRecruiterAnalytics(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	targetUserId: string,
	company: OwnedCompanyResource,
): void {
	if (!canViewRecruiterAnalytics(actor, targetUserId, company)) {
		throw new AppError(
			"You do not have permission to view these recruiter analytics.",
			403,
		);
	}
}

export function canViewCompanyAuditLogs(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): boolean {
	return isPrimaryOrSecondaryAdmin(actor, company);
}

export function assertCanViewCompanyAuditLogs(
	actor: Pick<Actor, "id" | "role" | "companyId">,
	company: OwnedCompanyResource,
): void {
	if (!canViewCompanyAuditLogs(actor, company)) {
		throw new AppError("Company audit logs require administrator access.", 403);
	}
}
