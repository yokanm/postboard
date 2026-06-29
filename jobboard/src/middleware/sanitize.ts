// src/middleware/sanitize.ts
// Phase 10: Input sanitization middleware.
//
// WHY: Even though express-validator validates inputs, it doesn't strip
// HTML/XSS payloads from text fields that accept free-form content
// (job descriptions, cover letters, bios). DOMPurify (running in jsdom)
// strips malicious HTML before it ever reaches the service layer.
//
// WHAT IT SANITIZES:
//   - req.body: recursively sanitizes all string values
//   - req.query: same
//   - req.params: same
//
// WHAT IT DOES NOT TOUCH:
//   - Non-string values (numbers, booleans, arrays of non-strings)
//   - File uploads (req.file / req.files — multer handles those separately)
//
// PERFORMANCE:
//   DOMPurify.sanitize() on short strings is ~0.1ms.
//   On a long job description (5KB) it's ~1ms — negligible vs DB round-trip.
//
// PLACEMENT:
//   Mount AFTER express.json() and express.urlencoded() but BEFORE routes.
//   app.use(sanitizeMiddleware) in app.ts

import type { Config as DOMPurifyConfig } from "dompurify";
import DOMPurify from "dompurify";
import type { NextFunction, Request, Response } from "express";
import { JSDOM } from "jsdom";

// Create a single shared DOMPurify instance backed by jsdom.
// This is created once at module load — not per request.
const { window } = new JSDOM("");
const purify = DOMPurify(window as unknown as Window & typeof globalThis);

// DOMPurify config: strip all HTML tags and attributes — we want plain text.
const PURIFY_CONFIG: DOMPurifyConfig = {
	ALLOWED_TAGS: [], // strip all tags
	ALLOWED_ATTR: [], // strip all attributes
	KEEP_CONTENT: true, // keep text content inside stripped tags
};

/**
 * Recursively sanitize all string leaves in a plain object.
 * Arrays are handled: each element is sanitized if it is a string,
 * or recursively processed if it is an object.
 */
export const sanitizeValue = (value: unknown): unknown => {
	if (typeof value === "string") {
		return purify.sanitize(value, PURIFY_CONFIG);
	}

	if (Array.isArray(value)) {
		return value.map(sanitizeValue);
	}

	if (value !== null && typeof value === "object") {
		const sanitized: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			sanitized[key] = sanitizeValue(val);
		}
		return sanitized;
	}

	// Numbers, booleans, null, undefined — pass through unchanged
	return value;
};

/**
 * Express middleware: sanitizes req.body, req.query, and req.params in-place.
 * Call app.use(sanitizeMiddleware) in app.ts after body parsers.
 */
export const sanitizeMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	if (req.body && typeof req.body === "object") {
		req.body = sanitizeValue(req.body) as Record<string, unknown>;
	}

	if (req.query && typeof req.query === "object") {
		// Express 5: req.query is a read-only getter on IncomingMessage — cannot
		// reassign the property itself. Mutate keys in-place instead.
		const sanitizedQuery = sanitizeValue(req.query) as Record<string, unknown>;
		for (const key of Object.keys(sanitizedQuery)) {
			(req.query as Record<string, unknown>)[key] = sanitizedQuery[key];
		}
	}

	if (req.params && typeof req.params === "object") {
		// Same issue applies to req.params in some middleware chains.
		const sanitizedParams = sanitizeValue(req.params) as Record<
			string,
			unknown
		>;
		for (const key of Object.keys(sanitizedParams)) {
			(req.params as Record<string, unknown>)[key] = sanitizedParams[key];
		}
	}

	next();
};
