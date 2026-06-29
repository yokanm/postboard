import crypto from "crypto";

export const saltRound = 12;

export function createSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export const makeToken = () => crypto.randomBytes(32).toString("hex");
export const in1h = () => new Date(Date.now() + 60 * 60 * 1000);
export const in24h = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
// Single source of truth — derives TTL in ms from the config string (e.g. '7d')
export const parseTtlMs = (str: string): number => {
	const n = parseInt(str, 10);
	if (str.endsWith("d")) return n * 86_400_000;
	if (str.endsWith("h")) return n * 3_600_000;
	if (str.endsWith("m")) return n * 60_000;
	return 7 * 86_400_000; // safe fallback: 7 days
};
