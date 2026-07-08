import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLead = await prisma.lead.create({
      data: {
        nombre: body.nombre,
        email: body.email,
        telefono: body.telefono,
        mensaje: body.mensaje || null,
      },
    });
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
