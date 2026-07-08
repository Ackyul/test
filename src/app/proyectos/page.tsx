export const dynamic = "force-dynamic";

import ProjectsClientView from "@/components/ProjectsClientView";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/Footer";

interface ProjectData {
  id: number;
  slug: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  priceRange?: string;
  bedrooms?: string;
  area?: string;
}

async function getProjects(): Promise<ProjectData[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      images: p.images,
      status: p.status,
      priceRange: p.priceRange || undefined,
      bedrooms: p.bedrooms || undefined,
      area: p.area || undefined,
    }));
  } catch (error) {
    console.error("Error fetching projects in server component:", error);
    return [];
  }
}

export default async function ProyectosPage() {
  const projects = await getProjects();
  return (
    <>
      <ProjectsClientView initialProjects={projects} />
      <Footer />
    </>
  );
}
