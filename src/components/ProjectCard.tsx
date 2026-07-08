"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProjectCardProps {
  project: {
    slug: string;
    title: string;
    description: string;
    images: string[];
    status: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="group relative h-[60vh] md:h-[80vh] w-full overflow-hidden block"
    >
      <Image 
        src={project.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"} 
        alt={project.title}
        fill
        className="absolute inset-0 object-cover"
      />
      
      <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />

      <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 z-20 flex flex-col items-start pointer-events-none">
        <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-4 font-light drop-shadow-sm">
          {["entregado", "terminado"].includes(project.status.toLowerCase())
            ? "Proyecto concluido"
            : project.status}
        </p>
        <h3 className="text-white text-3xl md:text-5xl font-light tracking-tight mb-6 drop-shadow-md cursor-default">
          {project.title}
        </h3>
        
        <Link href={`/proyectos/${project.slug}`} className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 text-white font-medium tracking-[0.2em] text-xs md:text-sm border border-white/30 hover:bg-white hover:text-black rounded-full px-8 py-4 backdrop-blur-sm uppercase inline-block pointer-events-auto">
          Ver Proyecto
        </Link>
      </div>
    </motion.div>
  );
}
