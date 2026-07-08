"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/lib/api";
import Footer from "@/components/Footer";

interface Project {
  id: number;
  slug: string;
  title: string;
  images?: string[];
  featured: boolean;
  featuredOrder?: number | null;
  [key: string]: unknown;
}

export default function ProjectGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeaturedTitle, setShowFeaturedTitle] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeaturedTitle(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then((res) => res.json())
      .then((data: Project[]) => {
        if (Array.isArray(data)) {
          // Ordenamos por orden si existe, y mostramos todos los proyectos (o los más recientes)
          const projectsToShow = data
            .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
          setProjects(projectsToShow);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full relative h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-proximity scroll-smooth">
      {loading ? (
        <div className="h-screen flex items-center justify-center text-stone-500 bg-stone-900 relative z-10">
          Cargando catálogo...
        </div>
      ) : projects.length > 0 ? (
        <>
          {projects.map((project, index) => (
            <section
              key={project.id}
              className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-end snap-start"
              style={{ zIndex: index + 10 }}
            >
              <div className="block w-full h-full relative group overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

                <AnimatePresence>
                  {showFeaturedTitle && index === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-[15] pointer-events-none">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="text-white/90 text-5xl md:text-8xl font-light tracking-tighter drop-shadow-lg text-center px-6"
                      >
                        Proyectos destacados.
                      </motion.h1>
                    </div>
                  )}
                </AnimatePresence>

                <Image
                  src={project.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute bottom-12 left-6 md:left-12 z-20 flex flex-col items-start gap-6">
                  <h2 className="text-white text-4xl md:text-7xl font-light tracking-tighter drop-shadow-md cursor-default pointer-events-none">
                    {project.title}
                  </h2>
                  <Link
                    href={`/proyectos/${project.slug}`}
                    className="opacity-100 translate-y-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 transform md:translate-y-4 md:group-hover:translate-y-0 text-white font-medium tracking-[0.2em] text-xs md:text-sm border border-white/30 hover:bg-white hover:text-black rounded-full px-8 py-4 backdrop-blur-sm uppercase inline-block cursor-pointer pointer-events-auto"
                  >
                    Ver Proyecto
                  </Link>
                </div>
              </div>
            </section>
          ))}

          <section
            className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-end snap-start"
            style={{ zIndex: projects.length + 20 }}
          >
            <div className="block w-full h-full relative group overflow-hidden bg-[#0e0e0e]">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-[#111] to-stone-800 z-0" />
              <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

              <div className="absolute bottom-12 left-6 md:left-12 z-20 flex flex-col items-start gap-6">
                <h2 className="text-white text-4xl md:text-7xl font-light tracking-tighter drop-shadow-md cursor-default pointer-events-none">
                  Todos nuestros<br />proyectos.
                </h2>
                <Link
                  href="/proyectos"
                  className="opacity-100 translate-y-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 transform md:translate-y-4 md:group-hover:translate-y-0 text-white font-medium tracking-[0.2em] text-xs md:text-sm border border-white/30 hover:bg-white hover:text-black rounded-full px-8 py-4 backdrop-blur-sm uppercase inline-block cursor-pointer pointer-events-auto"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="h-screen flex flex-col gap-6 items-center justify-center text-stone-400 bg-stone-900 relative z-10">
          <p className="text-xl font-light tracking-wide uppercase">Catálogo Vacío</p>
          <p className="text-sm font-light">Pronto publicaremos nuestros nuevos proyectos.</p>
          <Link href="/proyectos" className="mt-4 px-8 py-4 border border-stone-700 text-stone-400 hover:text-white hover:border-white transition-colors text-xs uppercase tracking-widest rounded-full">
            Ver todos los proyectos
          </Link>
        </div>
      )}
      <div className="relative z-[100] bg-white">
        <Footer />
      </div>
    </div>
  );
}
