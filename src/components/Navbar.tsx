"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

interface ProjectPreview {
  id: number;
  slug: string;
  title: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [settings, setSettings] = useState({
    footer_copyright: "",
    contact_phone: "",
    contact_email: "",
    contact_address_line1: "",
    contact_address_line2: "",
    social_instagram: "",
    social_facebook: ""
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleNavigation = (path_or_id: string, isId: boolean) => {
    setMenuOpen(false);
    if (isId) {
      if (pathname === "/") {
        const el = document.getElementById(path_or_id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/#${path_or_id}`);
      }
    } else {
      router.push(path_or_id);
    }
  };

  useEffect(() => {
    if (menuOpen && projects.length === 0) {
      fetch(`${API_URL}/api/projects`)
        .then(res => {
          if (!res.ok) return [];
          return res.json();
        })
        .then(data => setProjects(data))
        .catch(err => console.error("Error fetching projects:", err));
        
      fetch(`${API_URL}/api/settings`)
        .then(res => res.json())
        .then(data => {
          if(Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
          }
        })
        .catch(console.error);
    }
  }, [menuOpen, projects.length]);

  const navLinksVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };

  const isDarkBg = pathname === "/" || pathname === "/nosotros" || pathname === "/contacto";
  
  const navBg = menuOpen 
    ? "bg-transparent" 
    : isScrolled
      ? isDarkBg ? "bg-black/50 backdrop-blur-md" : "bg-white/80 backdrop-blur-md border-b border-stone-200/50"
      : "bg-transparent";

  const brandColor = menuOpen ? "text-stone-900" : isDarkBg ? "text-white" : "text-stone-900";
  const linkColor = menuOpen ? "text-stone-500 hover:text-stone-900" : isDarkBg ? "text-white/90 hover:text-white" : "text-stone-500 hover:text-stone-900";

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-[999] transition-colors duration-500 flex items-center justify-between px-6 md:px-12 py-6 ${navBg}`}
      >
        <Link 
          href="/" 
          onClick={() => setMenuOpen(false)}
          className={`text-2xl font-bold tracking-tight transition-colors duration-500 z-60 relative ${brandColor}`}
        >
          illusione
        </Link>

        <div className="hidden md:flex items-center gap-8 relative z-60">
          {!menuOpen && (
            <>
              <button onClick={() => handleNavigation('/contacto', false)} className={`text-sm font-light uppercase tracking-widest transition-colors ${linkColor}`}>Contacto</button>
              <button onClick={() => handleNavigation('/nosotros', false)} className={`text-sm font-light uppercase tracking-widest transition-colors ${linkColor}`}>Nosotros</button>
              <button onClick={() => handleNavigation('/proyectos', false)} className={`text-sm font-light uppercase tracking-widest transition-colors ${linkColor}`}>Proyectos</button>
            </>
          )}

          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`text-sm font-medium hover:opacity-80 transition-opacity ml-4 uppercase tracking-widest z-60 ${linkColor}`}
          >
            {menuOpen ? "Cerrar" : "Menú"}
          </button>
        </div>

        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden text-sm font-medium uppercase tracking-widest z-60 relative ${linkColor}`}
        >
           {menuOpen ? "Cerrar" : "Menú"}
        </button>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 min-h-screen bg-[#F2F2F0] z-[998] flex flex-col justify-between pt-32 pb-12 px-6 md:px-12 overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 flex-1 items-start mt-12 md:mt-24">
              <div className="md:col-start-6 md:col-span-4 flex flex-col gap-5">
                 <motion.h4 custom={0} variants={navLinksVariants} initial="hidden" animate="visible" exit="exit" className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-4 font-medium">Proyectos</motion.h4>
                 {projects.map((p, i) => (
                   <motion.div key={p.id} custom={i + 1} variants={navLinksVariants} initial="hidden" animate="visible" exit="exit">
                     <Link href={`/proyectos/${p.slug}`} onClick={() => setMenuOpen(false)} className="text-stone-500 text-2xl md:text-3xl hover:text-stone-900 transition-colors font-light tracking-tight block">
                       {p.title}
                     </Link>
                   </motion.div>
                 ))}
                 {projects.length === 0 && (
                   <motion.p custom={1} variants={navLinksVariants} initial="hidden" animate="visible" exit="exit" className="text-stone-400 font-light text-xl">Cargando catálogo...</motion.p>
                 )}
              </div>
              <div className="md:col-span-3 flex flex-col gap-6 md:ml-12 mt-12 md:mt-0">
                 <motion.div custom={projects.length + 1} variants={navLinksVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                   <Link href="/nosotros" onClick={() => setMenuOpen(false)} className="text-stone-700 text-2xl md:text-3xl font-light hover:text-stone-900 transition-colors block">Nosotros</Link>
                   <Link href="/proyectos" onClick={() => setMenuOpen(false)} className="text-stone-700 text-2xl md:text-3xl font-light hover:text-stone-900 transition-colors block">Proyectos</Link>
                   <Link href="/contacto" onClick={() => setMenuOpen(false)} className="text-stone-700 text-2xl md:text-3xl font-light hover:text-stone-900 transition-colors block">Contacto</Link>
                 </motion.div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="border-t border-stone-200 pt-8 mt-24 text-stone-400 font-light text-xs tracking-wide"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-2 md:col-span-1">{settings.footer_copyright}</div>
                <div className="flex flex-col gap-1">
                  <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="hover:text-stone-900 transition-colors uppercase">{settings.contact_phone}</a>
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-stone-900 transition-colors uppercase">{settings.contact_email}</a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="uppercase">{settings.contact_address_line1}</span>
                  <span className="uppercase">{settings.contact_address_line2}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <a href="#" className="hover:text-stone-900 transition-colors">Políticas de privacidad</a>
                    <a href="#" className="hover:text-stone-900 transition-colors">Términos y condiciones</a>
                  </div>
                  <div className="flex gap-4">
                    {settings.social_instagram && (
                      <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors uppercase">Instagram</a>
                    )}
                    {settings.social_facebook && (
                      <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors uppercase">Facebook</a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
