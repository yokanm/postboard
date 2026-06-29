interface EnvConfig {
	apiUrl: string;
	appEnv: "development" | "staging" | "production";
	enableAnalytics: boolean;
	enableSentry: boolean;
	sentryDsn: string;
}

function validateEnv(): EnvConfig {
	const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
	const appEnv = (import.meta.env.VITE_APP_ENV ||
		"development") as EnvConfig["appEnv"];
	const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
	const enableSentry = import.meta.env.VITE_ENABLE_SENTRY === "true";
	const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "";

	if (!["development", "staging", "production"].includes(appEnv)) {
		console.warn(
			`Invalid VITE_APP_ENV: "${appEnv}". Falling back to "development".`,
		);
	}

	if (appEnv === "production" && !apiUrl) {
		throw new Error("VITE_API_URL is required in production");
	}

	if (enableSentry && !sentryDsn) {
		console.warn("VITE_ENABLE_SENTRY is true but VITE_SENTRY_DSN is not set");
	}

	return { apiUrl, appEnv, enableAnalytics, enableSentry, sentryDsn };
}

export const env = validateEnv();
