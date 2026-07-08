import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

// Configure Cloudinary using env variables if present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    // Check configuration priority: Cloudinary -> Vercel Blob -> Local
    const hasCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (hasCloudinary) {
      // Option 1: Cloudinary upload
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert buffer to data URI to upload via Cloudinary SDK
        const mime = file.type || "image/jpeg";
        const base64Data = buffer.toString("base64");
        const fileUri = `data:${mime};base64,${base64Data}`;

        const uploadResult = await cloudinary.uploader.upload(fileUri, {
          folder: "inmobiliaria_uploads",
          resource_type: "auto", // Automatically detects image vs video
        });

        urls.push(uploadResult.secure_url);
      }
    } else if (hasBlobToken) {
      // Option 2: Vercel Blob upload
      for (const file of files) {
        const blob = await put(file.name, file, { access: "public" });
        urls.push(blob.url);
      }
    } else {
      // Option 3: Local fallback (default for local development)
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const host = request.headers.get("host") || "localhost:3000";
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const baseUrl = `${protocol}://${host}`;

      for (const file of files) {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.name) || ".jpg";
        const filename = `${unique}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        fs.writeFileSync(filePath, buffer);
        urls.push(`${baseUrl}/uploads/${filename}`);
      }
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}
