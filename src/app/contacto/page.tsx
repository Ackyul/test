"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { API_URL } from "@/lib/api";
import Footer from "@/components/Footer";

const defaults = {
  contact_phone:           "",
  contact_email:           "",
  contact_address_line1:   "",
  contact_address_line2:   "",
};

export default function Contacto() {
  const [data, setData] = useState(defaults);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((settings: Record<string, string>) => {
        if (settings && Object.keys(settings).length > 0) {
          setData((prev) => ({ ...prev, ...settings }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="min-h-screen bg-stone-900 text-stone-50 flex flex-col items-center justify-center px-6 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="w-full max-w-3xl text-center"
      >
        <p className="text-stone-500 text-xs tracking-[0.4em] uppercase mb-6">Contáctanos</p>

        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white mb-6 leading-tight">
          Conversemos.
        </h1>

        <p className="text-stone-400 font-light text-lg mb-20 max-w-md mx-auto">
          Estamos disponibles para resolver tus dudas y guiarte hacia tu próxima inversión.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          {data.contact_phone && (
            <motion.a
              href={`tel:${data.contact_phone.replace(/\s/g, "")}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="group flex-1 flex flex-col items-center gap-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl px-10 py-12 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mb-3">Llámanos</p>
                <p className="text-white text-2xl md:text-3xl font-light tracking-tight group-hover:text-stone-200 transition-colors">
                  {data.contact_phone}
                </p>
              </div>
            </motion.a>
          )}

          {data.contact_email && (
            <motion.a
              href={`mailto:${data.contact_email}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="group flex-1 flex flex-col items-center gap-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl px-10 py-12 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mb-3">Escríbenos</p>
                <p className="text-white text-xl md:text-2xl font-light tracking-tight group-hover:text-stone-200 transition-colors break-all">
                  {data.contact_email}
                </p>
              </div>
            </motion.a>
          )}

          {(data.contact_address_line1 || data.contact_address_line2) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex-1 flex flex-col items-center gap-5 bg-white/5 border border-white/10 rounded-3xl px-10 py-12"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mb-3">Visítanos</p>
                {data.contact_address_line1 && (
                  <p className="text-white text-lg md:text-xl font-light tracking-tight uppercase">
                    {data.contact_address_line1}
                  </p>
                )}
                {data.contact_address_line2 && (
                  <p className="text-stone-400 text-base font-light uppercase mt-1">
                    {data.contact_address_line2}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
    <Footer />
  </>
);
}
