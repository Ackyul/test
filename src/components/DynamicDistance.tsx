"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

interface DynamicDistanceProps {
  targetLat: number;
  targetLng: number;
}

export default function DynamicDistance({ targetLat, targetLng }: DynamicDistanceProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCalculate = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const result = calculateDistance(latitude, longitude, targetLat, targetLng);
        setDistance(Number(result.toFixed(2)));
        setLoading(false);
      },
      () => {
        setError("No se pudo obtener la ubicación");
        setLoading(false);
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="flex flex-col items-start"
    >
      <div className="inline-flex items-center justify-center p-3 bg-stone-200 rounded-full mb-8">
        <Compass className="w-6 h-6 text-stone-700" />
      </div>
      <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4 text-stone-900">
        Tu distancia a <br /> la exclusividad.
      </h2>
      <p className="text-stone-500 font-light text-lg mb-8 max-w-sm">
        Calcula qué tan cerca estás de este proyecto.
      </p>
      
      <button 
        onClick={handleCalculate}
        disabled={loading}
        className="px-8 py-4 bg-stone-900 text-white rounded-full text-sm font-medium tracking-wide hover:bg-stone-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Calculando..." : "Calcular Distancia"}
      </button>

      {error && (
        <p className="text-red-500 mt-4 text-sm font-light">{error}</p>
      )}

      {distance !== null && !error && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mt-12 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100"
        >
          <p className="text-stone-500 text-sm font-medium tracking-widest uppercase mb-2">
            Resultado
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-light tracking-tighter text-stone-900">
              {distance}
            </span>
            <span className="text-xl font-light text-stone-400">km</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
