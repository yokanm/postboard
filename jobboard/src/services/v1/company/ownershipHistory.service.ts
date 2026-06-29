import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

export const recordOwnershipTransfer = async (
	companyId: string,
	previousOwnerId: string | null,
	newOwnerId: string,
	transferredBy: string,
	reason?: string,
	ipAddress?: string,
	userAgent?: string,
): Promise<void> => {
	await (prisma as any).ownershipHistory.create({
		data: {
			id: nanoid(),
			companyId,
			previousOwnerId,
			newOwnerId,
			transferredBy,
			reason,
			ipAddress,
			userAgent,
		},
	});
};

export const listOwnershipHistoryService = async (
	companyId: string,
	cursor?: string,
	limit = 20,
) => {
	const take = Math.min(limit, 100);

	const records = await (prisma as any).ownershipHistory.findMany({
		where: { companyId },
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
	});

	const hasNextPage = records.length > take;
	const items = hasNextPage ? records.slice(0, -1) : records;

	return {
		history: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

export const getOwnerlessCompaniesService = async (
	cursor?: string,
	limit = 20,
) => {
	const take = Math.min(limit, 100);

	const companies = await prisma.company.findMany({
		where: {
			primaryAdminId: null,
			deletedAt: null,
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			name: true,
			email: true,
			isVerified: true,
			createdAt: true,
			_count: { select: { users: true, jobs: true } },
		},
	});

	const hasNextPage = companies.length > take;
	const items = hasNextPage ? companies.slice(0, -1) : companies;

	return {
		companies: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};
