// src/middleware/requestId.ts
// Phase 10: Attach a unique request ID to every incoming request.
//
// WHY: A correlation ID lets you trace a single request across log lines,
// across services (if forwarded in downstream HTTP calls), and in error
// reports. Every Winston log line already gets context via logger.child()
// when using the per-request logger pattern, but having req.id available
// in controllers is the simplest approach for a monolith.
//
// HOW:
//   1. If the client sends X-Request-ID, we trust and use it (useful for
//      end-to-end tracing from a frontend or API gateway).
//   2. Otherwise we generate a fresh UUID v4.
//   3. The ID is echoed back in the X-Request-ID response header so clients
//      can correlate their request with server logs.
//
// USAGE:
//   app.use(requestIdMiddleware)  ← before routes, after cors

import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
	// Augment Express Request so req.id is available everywhere
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			id: string;
		}
	}
}

export const requestIdMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	// Accept forwarded ID from trusted upstream (API gateway, load balancer)
	const incoming = req.headers["x-request-id"];
	const id =
		typeof incoming === "string" && incoming.length <= 128
			? incoming
			: crypto.randomUUID();

	req.id = id;
	res.setHeader("X-Request-ID", id);
	next();
};
