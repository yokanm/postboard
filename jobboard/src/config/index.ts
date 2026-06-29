// src/config/index.ts
import dotenv from "dotenv";

dotenv.config();

import type { StringValue } from "ms";

function required(name: string): string {
	const value = process.env[name];

	if (!value || value.trim() === "") {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

const config = {
	PORT: Number(process.env["PORT"]) || 3000,

	NODE_ENV: process.env["NODE_ENV"] ?? "development",

	ALLOW_ORIGINS: (process.env["ALLOW_ORIGINS"] ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),

	DATABASE_URL: required("DATABASE_URL"),

	LOG_LEVEL: process.env["LOG_LEVEL"] ?? "info",

	// JWT
	JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
	JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
	JWT_SUPERADMIN_SECRET: required("JWT_SUPERADMIN_SECRET"),
	JWT_SUPERADMIN_REFRESH_SECRET: required("JWT_SUPERADMIN_REFRESH_SECRET"),

	ACCESS_TOKEN_EXPIRES: (process.env["ACCESS_EXPIRES"] ?? "15m") as StringValue,

	REFRESH_TOKEN_EXPIRES: (process.env["REFRESH_EXPIRES"] ??
		"7d") as StringValue,

	// Email
	RESEND_API_KEY: process.env["RESEND_API_KEY"] ?? "",
	EMAIL_FROM: process.env["EMAIL_FROM"] ?? "no-reply@yourdomain.com",

	// Cloudinary
	CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"] ?? "",
	CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"] ?? "",
	CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"] ?? "",

	// App
	APP_URL: process.env["APP_URL"] ?? "http://localhost:5000",
	FRONTEND_URL: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
	REDIS_URL: process.env["REDIS_URL"] ?? "redis://redis:6379",

	// Bull Board — single source of truth

	ENABLE_DOCS: process.env["ENABLE_DOCS"],
};

export default config;
