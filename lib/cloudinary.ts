import { z } from "zod";

const imageSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && (!cloud || url.pathname.startsWith("/" + cloud + "/"));
  } catch { return false; }
}, "Image must be an HTTPS asset owned by the configured Cloudinary cloud.");

export function validateCloudinaryImage(value: string) { return imageSchema.parse(value); }
