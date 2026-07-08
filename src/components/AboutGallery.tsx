"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { API_URL } from "@/lib/api";

interface AboutSection {
  id: number;
  title: string;
  description: string;
  image: string;
  order: number;
}

export default function AboutGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/about`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSections(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching about sections:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-stone-500 bg-[#151413]">
        Cargando capítulos...
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-stone-400 bg-[#151413]">
        <p className="text-xl font-light tracking-wide uppercase">Sección Vacía</p>
        <p className="text-sm font-light mt-2 text-stone-500">Pronto publicaremos más información sobre nosotros.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full bg-[#151413]">
      {sections.map((section, index) => (
        <section
          key={section.id}
          className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#151413]"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="relative w-full h-full">
              <Image
                src={section.image || "/about/placeholder-1.jpg"}
                alt={section.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="relative z-20 w-full max-w-6xl mx-auto px-6 md:px-12 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h2 className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6 font-medium">
                Capítulo {index + 1}
              </h2>
              <h3 className="text-white text-5xl md:text-7xl font-light tracking-tighter mb-8 leading-tight">
                {section.title}
              </h3>
              <p className="text-stone-300 text-lg md:text-2xl font-light leading-relaxed">
                {section.description}
              </p>
            </motion.div>
          </div>
        </section>
      ))}
    </div>
  );
}
