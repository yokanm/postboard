// ─── Postboard — Request Logger Middleware ───────────────────────────────────
// Attaches request-scoped context to every log line:
//   - correlation ID (x-request-id)
//   - authenticated user ID (if available)
//   - company ID (if available)
//   - HTTP method and path
//
// USAGE:
//   app.use(requestLogger);  // after requestIdMiddleware, before routes

import type { NextFunction, Request, Response } from "express";
import logger from "@/lib/winston";

export function requestLogger(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const meta: Record<string, unknown> = {
		requestId: req.id,
		method: req.method,
		path: req.path,
	};

	// If authentication has already run, attach user context
	const user = (req as Record<string, unknown>)["user"];
	if (user && typeof user === "object") {
		const u = user as Record<string, unknown>;
		meta["userId"] = u.id;
		meta["companyId"] = u.companyId;
		meta["role"] = u.role;
	}

	// Create a child logger with request context for this request
	(req as Record<string, unknown>)["logger"] = logger.child(meta);

	next();
}
