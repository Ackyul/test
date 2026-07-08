"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" 
          alt="Premium Real Estate"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        className="relative z-10 text-center px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tighter mb-6">
          Exclusividad sin <br /> gravedad.
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto">
          Descubre propiedades que desafían las expectativas.
        </p>
      </motion.div>
    </section>
  );
}
