// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import config from "@/config";
import logger from "@/lib/winston";

cloudinary.config({
	cloud_name: config.CLOUDINARY_CLOUD_NAME,
	api_key: config.CLOUDINARY_API_KEY,
	api_secret: config.CLOUDINARY_API_SECRET,
	secure: true,
});

type UploadResult = {
	url: string;
	publicId: string;
};

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer   - File buffer from multer memoryStorage
 * @param folder   - Cloudinary folder (e.g. 'resumes', 'logos')
 * @param resourceType - 'image' for logos/avatars, 'raw' for PDFs
 */
export const uploadToCloudinary = (
	buffer: Buffer,
	folder: string,
	resourceType: "image" | "raw" = "image",
): Promise<UploadResult> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: resourceType,
				// Auto-generate a unique public_id
			},
			(error, result) => {
				if (error || !result) {
					logger.error("Cloudinary upload error", error);
					reject(new Error("File upload failed"));
					return;
				}
				resolve({ url: result.secure_url, publicId: result.public_id });
			},
		);

		uploadStream.end(buffer);
	});
};

/**
 * Delete a file from Cloudinary by its public_id.
 */
export const deleteFromCloudinary = async (
	publicId: string,
	resourceType: "image" | "raw" = "image",
): Promise<void> => {
	try {
		await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
	} catch (error) {
		logger.error("Cloudinary delete error", { publicId, error });
	}
};
