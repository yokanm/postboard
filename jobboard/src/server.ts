import app from "@/app";
import config from "@/config";
import { startExpireJobsCron } from "@/lib/cronjob";
import { connectDb, disconnectDb } from "@/lib/prisma";
import logger from "@/lib/winston";
import { disconnectRedis } from "./lib/redis";

(async () => {
	try {
		// Connect to PostgreSQL
		await connectDb();
		startExpireJobsCron();

		app.listen(config.PORT, () => {
			logger.info(`Server is running on http://localhost:${config.PORT}`);
			logger.info(`Environment: ${config.NODE_ENV}`);
		});
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1);
	}
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database.
 * Exits the process with status code (0) which indicates a successful shutdown.
 */

const handleServerShutdown = async (): Promise<void> => {
	try {
		await disconnectRedis();
		await disconnectDb();
		logger.warn("Proper server shut down");
		process.exit(0);
	} catch (error) {
		logger.error("Error during server SHUTDOWN", error);
		process.exit(1);
	}
};

/**
 * Listen for Termination signals (`SIGTERM` & `SIGINT`)
 */

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
