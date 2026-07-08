import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;
  try {
    const isId = /^\d+$/.test(param);
    if (isId) {
      const project = await prisma.project.findUnique({
        where: { id: parseInt(param) },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json(project);
    } else {
      const project = await prisma.project.findUnique({
        where: { slug: param },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json(project);
    }
  } catch (error) {
    console.error(`GET /api/projects/${param} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;
  try {
    const id = parseInt(param);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }
    const body = await request.json();
    
    // Prisma requires strict types, make sure fields match schema
    const updated = await prisma.project.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/projects/${param} error:`, error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;
  try {
    const id = parseInt(param);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }
    await prisma.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/projects/${param} error:`, error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
}
