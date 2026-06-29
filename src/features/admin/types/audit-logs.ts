export interface AuditLogActor {
	id: string;
	userName: string;
	email: string;
}

export interface AuditLog {
	id: string;
	action: string;
	targetId: string;
	targetType: string;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	actor: AuditLogActor;
}

export interface AuditLogListResponse {
	logs: AuditLog[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface AuditLogFilters {
	cursor?: string;
	limit?: number;
	action?: string;
	actorId?: string;
}
