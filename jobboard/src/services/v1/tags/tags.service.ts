// src/services/v1/tags/tags.service.ts
// Phase 6 update: tag listing is cached for 10 minutes (very stable data).

import { buildTagListKey, cacheGet, cacheSet, TTL } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import type { ListTagsInput } from "@/types";

export const listTagsService = async (input: ListTagsInput) => {
	const { q, limit = "50" } = input;
	const take = Math.min(parseInt(limit, 10) || 50, 200);

	// Only cache the unfiltered listing (most common — autocomplete initial load)
	const useCache = !q;
	const cacheKey = buildTagListKey();

	if (useCache) {
		const cached =
			await cacheGet<Awaited<ReturnType<typeof fetchTags>>>(cacheKey);
		if (cached) {
			logger.debug("Cache HIT: tag list");
			return cached;
		}
	}

	const tags = await fetchTags(q, take);

	if (useCache) {
		void cacheSet(cacheKey, tags, TTL.TAG_LIST);
	}

	return tags;
};

const fetchTags = (q: string | undefined, take: number) =>
	prisma.tag.findMany({
		where: q
			? { name: { contains: q.trim(), mode: "insensitive" } }
			: undefined,
		take,
		orderBy: { jobs: { _count: "desc" } },
		select: {
			id: true,
			name: true,
			slug: true,
			_count: { select: { jobs: true } },
		},
	});
