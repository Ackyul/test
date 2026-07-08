export const dynamic = 'force-dynamic';

import ProjectsClientView from "@/components/ProjectsClientView";
import { API_URL } from "@/lib/api";

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
    const res = await fetch(`${API_URL}/api/projects`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function ProyectosPage() {
  const projects = await getProjects();
  return <ProjectsClientView initialProjects={projects} />;
}
