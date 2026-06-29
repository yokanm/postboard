import type { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/response";
import { listTagsService } from "@/services/v1/tags/tags.service";

const listTags = asyncHandler(async (req: Request, res: Response) => {
	const tags = await listTagsService(
		req.query as { q?: string; limit?: string },
	);
	sendSuccess(res, { tags });
});

export { listTags };
