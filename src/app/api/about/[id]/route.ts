import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const sectionId = parseInt(id);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await request.json();
    const updated = await prisma.aboutSection.update({
      where: { id: sectionId },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        order: body.order,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/about/${id} error:`, error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const sectionId = parseInt(id);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await prisma.aboutSection.delete({
      where: { id: sectionId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/about/${id} error:`, error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}
