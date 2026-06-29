import { prisma } from "@/lib/prisma";

export interface ListCompanyAuditLogsInput {
	companyId: string;
	cursor?: string;
	limit?: number;
	action?: string;
	startDate?: string;
	endDate?: string;
}

export const listCompanyAuditLogsService = async (
	input: ListCompanyAuditLogsInput,
) => {
	const { companyId, cursor, limit = 20, action, startDate, endDate } = input;
	const take = Math.min(limit, 100);

	const metadataFilter: Record<string, unknown> = {
		path: ["companyId"],
		equals: companyId,
	};

	const where: Record<string, unknown> = {
		metadata: metadataFilter,
	};

	if (action) {
		where["action"] = action;
	}

	if (startDate || endDate) {
		const createdAtFilter: Record<string, unknown> = {};
		if (startDate) createdAtFilter["gte"] = new Date(startDate);
		if (endDate) createdAtFilter["lte"] = new Date(endDate);
		where["createdAt"] = createdAtFilter;
	}

	const logs = await (prisma as any).adminAuditLog.findMany({
		where,
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		include: {
			actor: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					role: true,
				},
			},
		},
	});

	const hasNextPage = logs.length > take;
	const items = hasNextPage ? logs.slice(0, -1) : logs;

	return {
		logs: items.map((log: Record<string, unknown>) => ({
			id: log["id"],
			action: log["action"],
			targetType: log["targetType"],
			targetId: log["targetId"],
			metadata: log["metadata"],
			createdAt: log["createdAt"],
			actor: log["actor"],
		})),
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};
