import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    // Check if Vercel Blob Token is set. If so, use Vercel Blob.
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (hasBlobToken) {
      for (const file of files) {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, { access: "public" });
        urls.push(blob.url);
      }
    } else {
      // Local fallback (useful for development)
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

        // Convert file stream to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to disk
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
