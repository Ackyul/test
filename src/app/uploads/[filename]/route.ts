import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const filePath = path.join(process.cwd(), "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Basic MIME type detection
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".svg") {
      contentType = "image/svg+xml";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    } else if (ext === ".mp4") {
      contentType = "video/mp4";
    } else if (ext === ".webm") {
      contentType = "video/webm";
    }

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving local file:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
