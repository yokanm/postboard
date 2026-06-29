import winston from "winston";
import config from "@/config";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
	return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = winston.createLogger({
	level: config.LOG_LEVEL || "info",

	defaultMeta: {
		service: "jobboard-api",
	},

	format: combine(timestamp(), errors({ stack: true }), json()),

	transports: [
		new winston.transports.Console({
			format:
				config.NODE_ENV === "production"
					? combine(timestamp(), errors({ stack: true }), json())
					: combine(
							colorize(),
							timestamp({
								format: "YYYY-MM-DD HH:mm:ss",
							}),
							errors({ stack: true }),
							devFormat,
						),
		}),
	],

	exceptionHandlers: [new winston.transports.Console()],

	rejectionHandlers: [new winston.transports.Console()],
});

export default logger;
