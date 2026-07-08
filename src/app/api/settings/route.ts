import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const formatted = settings.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/settings error:", error.message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as Record<string, string>;
    const upserts = Object.entries(data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await Promise.all(upserts);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/settings error:", error.message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}
