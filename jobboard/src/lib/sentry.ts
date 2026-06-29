// ─── Postboard Backend — Sentry Initialization ──────────────────────────────
// Error tracking for production. Initialized in app.ts.

import type { Express } from "express";
import config from "@/config";
import logger from "@/lib/winston";

export function initSentry(app: Express): void {
	if (config.NODE_ENV !== "production") {
		logger.info("Sentry: skipped (not production)");
		return;
	}

	try {
		// Dynamic import — @sentry/node is optional
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Sentry = require("@sentry/node");
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { nodeProfilingIntegration } = require("@sentry/profiling-node");

		Sentry.init({
			dsn: process.env["SENTRY_DSN"] || "",
			environment: config.NODE_ENV,
			integrations: [
				nodeProfilingIntegration(),
				Sentry.httpIntegration(),
				Sentry.expressIntegration(),
			],
			tracesSampleRate: 0.1,
			profilesSampleRate: 0.1,
		});

		app.use(Sentry.Handlers.requestHandler());
		app.use(Sentry.Handlers.tracingHandler());

		// Error handler must be registered last
		app.use(Sentry.Handlers.errorHandler());

		logger.info("Sentry: initialized");
	} catch (err) {
		logger.warn(
			"Sentry: failed to initialize — @sentry/node may not be installed",
			err,
		);
	}
}
