import "server-only";
import { v2 as cloudinary } from "cloudinary";

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export function cloudinaryConfigured() {
  return configured();
}

// Uploads a vendor document to Cloudinary and returns its secure HTTPS URL.
export async function uploadVendorDocument(file: File): Promise<string> {
  if (!configured()) throw new Error("Document uploads are not configured.");
  if (!ALLOWED.includes(file.type)) throw new Error("Document must be a PDF or image (PNG, JPEG, WEBP).");
  if (file.size > MAX_BYTES) throw new Error("Document must be smaller than 8 MB.");

  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ghoomora/vendor-docs", resource_type: "auto" }, (error, uploaded) => {
        if (error || !uploaded) return reject(error ?? new Error("Upload failed."));
        resolve(uploaded as { secure_url: string });
      })
      .end(buffer);
  });

  return result.secure_url;
}
