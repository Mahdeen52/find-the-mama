import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await requireAuth(); const data = await request.formData(); const file = data.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return fail("Choose an image under 5 MB", 422);
    const bytes = Buffer.from(await file.arrayBuffer());
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: "find-the-mama", resource_type: "image", transformation: [{ width: 1600, height: 1200, crop: "limit" }, { quality: "auto", fetch_format: "auto" }] }, (error, result) => error || !result ? reject(error || new Error("Upload failed")) : resolve(result)); stream.end(bytes); });
      return ok({ url: result.secure_url });
    }
    if (file.size > 1024 * 1024) return fail("Local fallback accepts images up to 1 MB. Configure Cloudinary for larger files.", 422);
    return ok({ url: `data:${file.type};base64,${bytes.toString("base64")}` });
  } catch (error) { return handleApiError(error); }
}
