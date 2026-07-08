import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await prisma.aboutSection.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error("GET /api/about error:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSection = await prisma.aboutSection.create({
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error("POST /api/about error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
