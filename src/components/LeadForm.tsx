"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function LeadForm() {
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error();
      
      setStatus("success");
      setFormData({ nombre: "", email: "", telefono: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="bg-white p-10 md:p-14 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-stone-100"
    >
      <h3 className="text-2xl font-light text-stone-900 mb-8">
        Recibe información privilegiada.
      </h3>
      
      {status === "success" ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <div className="w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowRight className="w-6 h-6" />
          </div>
          <p className="text-xl font-light text-stone-900">Gracias por tu interés.</p>
          <p className="text-stone-500 font-light mt-2">Un asesor se comunicará contigo pronto.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <input 
              type="text" 
              required
              placeholder="Nombre completo" 
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-transparent border-b border-stone-200 py-4 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-light"
            />
            <input 
              type="email" 
              required
              placeholder="Correo electrónico" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-transparent border-b border-stone-200 py-4 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-light"
            />
            <input 
              type="tel" 
              required
              placeholder="Teléfono" 
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full bg-transparent border-b border-stone-200 py-4 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-light"
            />
          </div>

          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full group flex items-center justify-between px-8 py-4 bg-stone-900 text-white rounded-full text-sm font-medium tracking-wide hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <span>{status === "loading" ? "Enviando..." : "Solicitar Información"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {status === "error" && (
            <p className="text-red-500 text-sm font-light text-center">
              Ocurrió un error. Inténtalo de nuevo.
            </p>
          )}
        </form>
      )}
    </motion.div>
  );
}
