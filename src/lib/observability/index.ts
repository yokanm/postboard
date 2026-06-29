type LogLevel = "info" | "warn" | "error" | "debug";

interface ObservabilityClient {
	captureException: (error: unknown, context?: Record<string, unknown>) => void;
	captureMessage: (message: string, level?: LogLevel) => void;
	setUser: (user: { id: string; email?: string } | null) => void;
}

let client: ObservabilityClient = {
	captureException: () => {},
	captureMessage: () => {},
	setUser: () => {},
};

export async function initObservability() {
	if (import.meta.env.VITE_ENABLE_SENTRY === "true") {
		try {
			// @ts-expect-error - @sentry/react is optional; only loaded when VITE_ENABLE_SENTRY=true
			const Sentry = await import("@sentry/react");
			Sentry.init({
				dsn: import.meta.env.VITE_SENTRY_DSN || "",
				environment: import.meta.env.VITE_APP_ENV || "development",
				tracesSampleRate: 0.1,
			});
			client = {
				captureException: (error, context) =>
					Sentry.captureException(error, { extra: context }),
				captureMessage: (message, level) =>
					Sentry.captureMessage(message, level),
				setUser: (user) => Sentry.setUser(user ?? null),
			};
		} catch {
			console.warn("Sentry initialization failed");
		}
	}
}

export function captureException(
	error: unknown,
	context?: Record<string, unknown>,
) {
	client.captureException(error, context);
}

export function captureMessage(message: string, level?: LogLevel) {
	client.captureMessage(message, level);
}

export function setObservabilityUser(
	user: { id: string; email?: string } | null,
) {
	client.setUser(user);
}
