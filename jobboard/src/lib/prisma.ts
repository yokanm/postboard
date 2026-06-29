import { PrismaPg } from "@prisma/adapter-pg";
import config from "@/config/index";
import logger from "@/lib/winston";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = config.DATABASE_URL;

const adapter = new PrismaPg({
	connectionString,
	pool: {
		max: config.NODE_ENV === "production" ? 20 : 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000,
	},
});
export const prisma = new PrismaClient({ adapter });

export const connectDb = async (): Promise<void> => {
	if (!connectionString) {
		throw new Error("DATABASE_URL is not defined in environment");
	}
	try {
		await prisma.$connect();
		logger.info("Database connected successfully");
	} catch (error) {
		logger.error("Database connection failed:", error);
		throw error; // re-throw — server.ts must catch this and exit
	}
};

export const disconnectDb = async (): Promise<void> => {
	try {
		await prisma.$disconnect();
		logger.info("Database disconnected");
	} catch (error) {
		logger.error("Error disconnecting DB:", error);
	}
};
