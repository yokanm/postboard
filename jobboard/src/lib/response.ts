import type { Response } from "express";

export interface PaginationMeta {
	nextCursor: string | null;
	hasNextPage: boolean;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
	res.status(statusCode).json({ data });
}

export function sendPaginated<T>(
	res: Response,
	data: T[],
	meta: PaginationMeta,
	statusCode = 200,
): void {
	res.status(statusCode).json({ data, meta });
}

export function sendMessage(
	res: Response,
	message: string,
	statusCode = 200,
): void {
	res.status(statusCode).json({ data: { message } });
}
