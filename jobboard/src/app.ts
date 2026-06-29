// src/app.ts
// Express app factory — kept separate from the server bootstrap (server.ts)
// so it can be imported cleanly in tests without starting a listener.

import compression from "compression";
import cookieParser from "cookie-parser";
import type { CorsOptions } from "cors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import config from "@/config";
import limiter from "@/lib/express_rate_limit";
import { mountSwagger } from "@/lib/swagger";
import logger from "@/lib/winston";
import routeV1 from "@/routes/v1";
import bullBoardRouter from "@/routes/v1/bullboard.route";
import healthRouter from "./controller/v1/health";
import { initSentry } from "./lib/sentry";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { sanitizeMiddleware } from "./middleware/sanitize";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions: CorsOptions = {
	origin(origin, callback) {
		if (
			config.NODE_ENV === "development" ||
			!origin ||
			config.ALLOW_ORIGINS.includes(origin)
		) {
			callback(null, true);
		} else {
			logger.warn(`CORS: Origin ${origin} not allowed`);
			callback(null, false);
		}
	},
	credentials: true, // needed so the browser sends the refreshToken cookie
};

// ─── Sentry (production only — safe no-op if @sentry/node not installed) ──────
initSentry(app);

// ─── Core middleware (all routes get these, including health) ──────────────────
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));
app.use(
	helmet({
		contentSecurityPolicy: config.NODE_ENV === "production" ? undefined : false,
	}),
);
app.use(limiter);
app.use(sanitizeMiddleware);

// HTTP logging — development only (not test, not production)
if (config.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// ─── Health check — after security middleware so headers are correct ───────────
app.use(healthRouter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1", routeV1);

// Bull Board — conditionally mounted
if (config.ENABLE_BULL_BOARD || config.NODE_ENV === "development") {
	app.use("/admin/queues", bullBoardRouter);
	logger.info("Bull Board: mounted at /admin/queues");
}

// ─── Swagger docs (admins-only) ────────────────────────────────────────────────
// ─── Swagger docs — always mounted
// Docs are visible in all environments. Authentication is enforced inside
// mountSwagger — Candidates and Recruiters receive 403, guests receive 401.
mountSwagger(app);

app.use(notFound);
app.use(errorHandler);

export default app;
