"use client";

import { motion } from "framer-motion";
import { MapPin, ExternalLink } from "lucide-react";

interface ProjectMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function ProjectMap({ lat, lng, title }: ProjectMapProps) {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008},${lat - 0.005},${lng + 0.008},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="w-full"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-stone-400 text-xs tracking-[0.3em] uppercase mb-3">
            <MapPin className="w-3 h-3" />
            <span>Ubicación</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-stone-900">
            Dónde nos<br />encontramos.
          </h2>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-900 transition-colors text-xs uppercase tracking-widest rounded-full mt-2"
        >
          <ExternalLink className="w-3 h-3" />
          Ver en Maps
        </a>
      </div>

      <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-stone-100">
        <iframe
          src={embedUrl}
          title={`Ubicación de ${title}`}
          className="w-full h-[480px] md:h-[560px]"
          style={{ border: 0, filter: "contrast(0.95) brightness(1.02)" }}
          loading="lazy"
          allowFullScreen
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] text-stone-500 tracking-widest uppercase font-light shadow-sm">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </motion.div>
  );
}
