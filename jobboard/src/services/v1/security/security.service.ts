import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";

export const writeSecurityEvent = async (
	eventType: string,
	severity: "INFO" | "WARN" | "CRITICAL",
	metadata?: Record<string, unknown>,
	companyId?: string,
	actorId?: string,
	ipAddress?: string,
	userAgent?: string,
): Promise<void> => {
	try {
		await (prisma as any).securityEvent.create({
			data: {
				id: nanoid(),
				eventType,
				severity,
				companyId,
				actorId,
				ipAddress,
				userAgent,
				metadata: metadata ?? {},
			},
		});
	} catch (error) {
		logger.error("writeSecurityEvent error", error);
	}
};

export const listSecurityEventsService = async (
	companyId?: string,
	cursor?: string,
	limit = 20,
	eventType?: string,
	severity?: string,
	startDate?: string,
	endDate?: string,
) => {
	const take = Math.min(limit, 100);
	const where: Record<string, unknown> = {};

	if (companyId) where["companyId"] = companyId;
	if (eventType) where["eventType"] = eventType;
	if (severity) where["severity"] = severity;

	if (startDate || endDate) {
		const createdAtFilter: Record<string, unknown> = {};
		if (startDate) createdAtFilter["gte"] = new Date(startDate);
		if (endDate) createdAtFilter["lte"] = new Date(endDate);
		where["createdAt"] = createdAtFilter;
	}

	const events = await (prisma as any).securityEvent.findMany({
		where,
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
	});

	const hasNextPage = events.length > take;
	const items = hasNextPage ? events.slice(0, -1) : events;

	return {
		events: items.map((e: Record<string, unknown>) => ({
			id: e["id"],
			eventType: e["eventType"],
			severity: e["severity"],
			companyId: e["companyId"],
			actorId: e["actorId"],
			metadata: e["metadata"],
			createdAt: e["createdAt"],
		})),
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};
