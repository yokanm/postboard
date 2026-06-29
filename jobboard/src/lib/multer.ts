// src/lib/multer.ts
import type { Request } from "express";
import multer from "multer";

const MB = 1024 * 1024;

// ─── Image upload (logos, avatars) ────────────────────────────────────────────
export const imageUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * MB },
	fileFilter(_req: Request, file, cb) {
		if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG and WebP images are allowed"));
		}
	},
});

// ─── Resume / document upload ─────────────────────────────────────────────────
export const resumeUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * MB },
	fileFilter(_req: Request, file, cb) {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Only PDF files are accepted for resumes"));
		}
	},
});
