export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, BedDouble, Maximize2, Tag } from "lucide-react";
import DynamicDistance from "@/components/DynamicDistance";
import ProjectMap from "@/components/ProjectMap";
import { API_URL } from "@/lib/api";

interface ProjectData {
  id: number;
  slug: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  videoUrl?: string;
  images: string[];
  status: string;
  priceRange?: string;
  bedrooms?: string;
  area?: string;
}

function statusLabel(status: string): string {
  const s = status.toLowerCase().trim();
  if (["entregado", "terminado", "concluido"].some((k) => s.startsWith(k))) return "Proyecto concluido";
  return status;
}

function isActive(status: string): boolean {
  const s = status.toLowerCase().trim();
  return !["entregado", "terminado", "concluido"].some((k) => s.startsWith(k));
}

async function getProject(slug: string): Promise<ProjectData | null> {
  try {
    const res = await fetch(`${API_URL}/api/projects/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const FALLBACK =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&auto=format&fit=crop";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const heroImage = project.images?.[0] || FALLBACK;
  const galleryImages = project.images?.slice(1) ?? [];
  const active = isActive(project.status);

  return (
    <main className="min-h-screen bg-[#F8F7F5] text-stone-900 selection:bg-stone-900 selection:text-white">

      <section className="relative h-screen w-full overflow-hidden">
        {project.videoUrl ? (
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={project.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={heroImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        <div className="absolute top-24 left-6 md:left-12 z-20">
          <Link
            href="/proyectos"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs uppercase tracking-widest font-light"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Proyectos
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-16 pb-12 md:pb-20">
          <span
            className={`inline-block text-[10px] uppercase tracking-[0.35em] px-4 py-1.5 rounded-full mb-6 font-medium ${
              active
                ? "bg-white/15 backdrop-blur-sm text-white border border-white/25"
                : "bg-stone-500/40 backdrop-blur-sm text-stone-200 border border-stone-400/30"
            }`}
          >
            {statusLabel(project.status)}
          </span>

          <h1 className="text-white text-5xl md:text-8xl font-light tracking-tighter leading-none mb-6 max-w-5xl">
            {project.title}
          </h1>

          <p className="text-white/75 text-base md:text-xl font-light max-w-2xl leading-relaxed mb-10">
            {project.description}
          </p>

          {(project.priceRange || project.bedrooms || project.area) && (
            <div className="flex flex-wrap gap-8">
              {project.priceRange && (
                <div className="flex items-center gap-2.5 text-white/80">
                  <Tag className="w-4 h-4 opacity-60" />
                  <div>
                    <p className="text-white text-sm font-light">{project.priceRange}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest">Precio</p>
                  </div>
                </div>
              )}
              {project.bedrooms && (
                <div className="flex items-center gap-2.5 text-white/80">
                  <BedDouble className="w-4 h-4 opacity-60" />
                  <div>
                    <p className="text-white text-sm font-light">{project.bedrooms}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest">Dormitorios</p>
                  </div>
                </div>
              )}
              {project.area && (
                <div className="flex items-center gap-2.5 text-white/80">
                  <Maximize2 className="w-4 h-4 opacity-60" />
                  <div>
                    <p className="text-white text-sm font-light">
                      {project.area.replace(/m²|m\u00b2/gi, "m2")}
                    </p>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest">Superficie</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section className="px-4 md:px-8 py-4 md:py-6">
          <div
            className={`grid gap-3 ${
              galleryImages.length === 1
                ? "grid-cols-1"
                : galleryImages.length === 2
                ? "grid-cols-2"
                : galleryImages.length === 3
                ? "grid-cols-2 md:grid-cols-3"
                : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl ${
                  i === 0 && galleryImages.length >= 3 ? "md:col-span-2 aspect-video" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={img}
                  alt={`${project.title} — imagen ${i + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {project.lat && project.lng && (
        <section className="px-6 md:px-16 py-24 max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <div className="flex-1 h-px bg-stone-200" />
            <div className="flex items-center gap-2 text-stone-400">
              <MapPin className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.35em] font-light">Ubicación</span>
            </div>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-3">
              <ProjectMap lat={project.lat} lng={project.lng} title={project.title} />
            </div>
            <div className="lg:col-span-2">
              <DynamicDistance targetLat={project.lat} targetLng={project.lng} />
            </div>
          </div>
        </section>
      )}

      <section className="bg-stone-900 text-white px-6 py-20 text-center">
        <p className="text-stone-400 text-xs uppercase tracking-[0.4em] mb-4">Illusione</p>
        <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-8">
          {active ? "¿Te interesa este proyecto?" : "Ver más proyectos"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {active && (
            <Link
              href="/contacto"
              className="px-10 py-4 bg-white text-stone-900 text-xs uppercase tracking-widest font-medium hover:bg-stone-100 transition-colors rounded-full"
            >
              Contáctanos
            </Link>
          )}
          <Link
            href="/proyectos"
            className="px-10 py-4 border border-white/30 text-white text-xs uppercase tracking-widest font-light hover:bg-white/10 transition-colors rounded-full"
          >
            Ver todos los proyectos
          </Link>
        </div>
      </section>
    </main>
  );
}
