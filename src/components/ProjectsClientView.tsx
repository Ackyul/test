"use client";

import { useState, useMemo } from "react";
import ProjectCard from "@/components/ProjectCard";

interface ProjectData {
  id: number;
  slug: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  priceRange?: string;
  bedrooms?: string;
  area?: string;
}

function normalizeArea(str: string): string {
  return str.replace(/m²|m2|m\u00B2/gi, "m2");
}

function isEnVenta(status: string): boolean {
  const s = status.toLowerCase().trim();
  return !["entregado", "terminado", "concluido"].some((k) => s.startsWith(k));
}

function isTerminado(status: string): boolean {
  const s = status.toLowerCase().trim();
  return ["entregado", "terminado", "concluido"].some((k) => s.startsWith(k));
}

export default function ProjectsClientView({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [viewMode,      setViewMode]      = useState<"all" | "venta" | "entregado">("all");
  const [activePrice,    setActivePrice]    = useState<string | null>(null);
  const [activeBedrooms, setActiveBedrooms] = useState<string | null>(null);
  const [activeArea,     setActiveArea]     = useState<string | null>(null);
  const [filtersOpen,    setFiltersOpen]    = useState(false);

  const clearFilters = () => { setActivePrice(null); setActiveBedrooms(null); setActiveArea(null); };

  const handleViewMode = (mode: "venta" | "entregado") => {
    if (viewMode === mode) {
      setViewMode("all");
    } else {
      setViewMode(mode);
      if (mode === "entregado") clearFilters();
    }
  };

  const enVentaAll  = useMemo(() => initialProjects.filter((p) => isEnVenta(p.status)),   [initialProjects]);
  const terminados  = useMemo(() => initialProjects.filter((p) => isTerminado(p.status)), [initialProjects]);

  const enVentaFiltered = useMemo(() =>
    enVentaAll.filter((p) => {
      if (activePrice    && p.priceRange !== activePrice)               return false;
      if (activeBedrooms && p.bedrooms   !== activeBedrooms)            return false;
      if (activeArea     && normalizeArea(p.area ?? "") !== activeArea) return false;
      return true;
    }),
    [enVentaAll, activePrice, activeBedrooms, activeArea]
  );

  const priceOptions = useMemo(() =>
    Array.from(new Set(
      enVentaAll
        .filter((p) => {
          if (activeBedrooms && p.bedrooms   !== activeBedrooms)            return false;
          if (activeArea     && normalizeArea(p.area ?? "") !== activeArea) return false;
          return true;
        })
        .map((p) => p.priceRange)
    )).filter(Boolean) as string[],
    [enVentaAll, activeBedrooms, activeArea]
  );

  const bedroomOptions = useMemo(() =>
    Array.from(new Set(
      enVentaAll
        .filter((p) => {
          if (activePrice && p.priceRange !== activePrice)               return false;
          if (activeArea  && normalizeArea(p.area ?? "") !== activeArea) return false;
          return true;
        })
        .map((p) => p.bedrooms)
    )).filter(Boolean) as string[],
    [enVentaAll, activePrice, activeArea]
  );

  const areaOptions = useMemo(() =>
    Array.from(new Set(
      enVentaAll
        .filter((p) => {
          if (activePrice    && p.priceRange !== activePrice)   return false;
          if (activeBedrooms && p.bedrooms   !== activeBedrooms) return false;
          return true;
        })
        .map((p) => normalizeArea(p.area ?? ""))
    )).filter(Boolean) as string[],
    [enVentaAll, activePrice, activeBedrooms]
  );


  const showVenta      = viewMode !== "entregado";
  const showTerminados = viewMode === "entregado";
  const showFilters    = viewMode !== "entregado" && enVentaAll.length > 0;
  const anyActive = activePrice || activeBedrooms || activeArea;

  const countForPrice = (price: string) =>
    enVentaAll.filter((p) => {
      if (activeBedrooms && p.bedrooms   !== activeBedrooms)            return false;
      if (activeArea     && normalizeArea(p.area ?? "") !== activeArea) return false;
      return p.priceRange === price;
    }).length;

  const countForBedrooms = (beds: string) =>
    enVentaAll.filter((p) => {
      if (activePrice && p.priceRange !== activePrice)               return false;
      if (activeArea  && normalizeArea(p.area ?? "") !== activeArea) return false;
      return p.bedrooms === beds;
    }).length;

  const countForArea = (area: string) =>
    enVentaAll.filter((p) => {
      if (activePrice    && p.priceRange !== activePrice)   return false;
      if (activeBedrooms && p.bedrooms   !== activeBedrooms) return false;
      return normalizeArea(p.area ?? "") === area;
    }).length;

  const Btn = ({
    active, label, count, onClick,
  }: { active: boolean; label: string; count?: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-3 text-left text-sm font-light transition-colors group ${
        active ? "text-stone-900" : "text-stone-400 hover:text-stone-700"
      }`}
    >
      <span className={`border-b transition-colors ${active ? "border-stone-900" : "border-transparent group-hover:border-stone-300"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className={`text-[10px] tabular-nums ${active ? "text-stone-500" : "text-stone-300"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row pt-24 md:pt-32 selection:bg-stone-900 selection:text-white">

      <aside className="w-full md:w-1/4 md:h-[calc(100vh-8rem)] relative md:sticky top-32 bg-[#FDFDFD] z-[100]">

        <div className="px-6 md:px-12 pt-6 md:pt-0 pb-4 md:pb-0 flex flex-col md:gap-10">
          <div className="flex items-baseline justify-between md:block">
            <h1 className="text-3xl md:text-4xl text-stone-900 font-light tracking-tight md:mb-4">
              Proyectos
            </h1>

            <div className="flex items-center gap-3 md:hidden">
              {anyActive && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                >
                  Limpiar ×
                </button>
              )}
              {showFilters && (
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium px-3 py-1.5 border transition-colors ${
                    filtersOpen || anyActive
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"
                  }`}
                >
                  Filtrar
                  {anyActive && (
                    <span className="w-4 h-4 rounded-full bg-white text-stone-900 text-[9px] flex items-center justify-center font-bold">
                      {[activePrice, activeBedrooms, activeArea].filter(Boolean).length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            {anyActive && (
              <button
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-4 block"
              >
                Limpiar filtros ×
              </button>
            )}
          </div>

          <div className="hidden md:flex flex-col gap-2">
            <h3 className="text-stone-900 font-medium text-xs tracking-wider uppercase mb-1">Etapa del proyecto</h3>
            {enVentaAll.length > 0 && (
              <button
                onClick={() => handleViewMode("venta")}
                className={`text-left text-sm font-light transition-colors focus:outline-none ${
                  viewMode === "venta" ? "text-stone-900 font-medium" : "text-stone-400 hover:text-stone-900"
                }`}
              >
                En venta
              </button>
            )}
            {terminados.length > 0 && (
              <button
                onClick={() => handleViewMode("entregado")}
                className={`text-left text-sm font-light transition-colors focus:outline-none ${
                  viewMode === "entregado" ? "text-stone-900 font-medium" : "text-stone-400 hover:text-stone-900"
                }`}
              >
                Proyectos concluidos
              </button>
            )}
          </div>

          {showFilters && (
            <div className="hidden md:flex flex-col gap-10">
              {priceOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-stone-900 font-medium text-xs tracking-wider uppercase mb-1">Precio</h3>
                  {priceOptions.map((price, i) => (
                    <Btn key={i} active={activePrice === price} label={price}
                      count={countForPrice(price)}
                      onClick={() => setActivePrice(activePrice === price ? null : price)} />
                  ))}
                </div>
              )}
              {bedroomOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-stone-900 font-medium text-xs tracking-wider uppercase mb-1">Dormitorios</h3>
                  {bedroomOptions.map((beds, i) => (
                    <Btn key={i} active={activeBedrooms === beds} label={beds}
                      count={countForBedrooms(beds)}
                      onClick={() => setActiveBedrooms(activeBedrooms === beds ? null : beds)} />
                  ))}
                </div>
              )}
              {areaOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-stone-900 font-medium text-xs tracking-wider uppercase mb-1">Metraje</h3>
                  {areaOptions.map((area, i) => (
                    <Btn key={i} active={activeArea === area} label={area}
                      count={countForArea(area)}
                      onClick={() => setActiveArea(activeArea === area ? null : area)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden px-6 pt-2 pb-4 flex gap-2 overflow-x-auto scrollbar-none border-b border-stone-100">
          {(enVentaAll.length > 0 || terminados.length > 0) && (
            <div className="flex gap-2 shrink-0">
              {enVentaAll.length > 0 && (
                <button
                  onClick={() => handleViewMode("venta")}
                  className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-widest border transition-colors ${
                    viewMode === "venta"
                      ? "bg-stone-900 text-white border-stone-900"
                      : "border-stone-200 text-stone-500 hover:border-stone-500"
                  }`}
                >
                  En venta
                </button>
              )}
              {terminados.length > 0 && (
                <button
                  onClick={() => handleViewMode("entregado")}
                  className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-widest border transition-colors ${
                    viewMode === "entregado"
                      ? "bg-stone-900 text-white border-stone-900"
                      : "border-stone-200 text-stone-500 hover:border-stone-500"
                  }`}
                >
                  Concluidos
                </button>
              )}
            </div>
          )}
        </div>

        {filtersOpen && showFilters && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white border-t border-stone-200 shadow-2xl rounded-t-2xl px-6 pt-5 pb-8 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <span className="text-xs uppercase tracking-widest font-medium text-stone-900">Filtros</span>
              <div className="flex gap-4 items-center">
                {anyActive && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="text-stone-400 hover:text-stone-900 transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-8 overflow-y-auto pb-4 px-1">
              {priceOptions.length > 0 && (
                <div>
                  <h3 className="text-stone-400 font-medium text-[10px] tracking-widest uppercase mb-3">Precio</h3>
                  <div className="flex flex-wrap gap-2">
                    {priceOptions.map((price, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePrice(activePrice === price ? null : price)}
                        className={`px-3 py-2 text-[11px] border transition-colors ${
                          activePrice === price
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-500"
                        }`}
                      >
                        {price}
                        <span className="ml-1.5 text-[10px] opacity-60">{countForPrice(price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {bedroomOptions.length > 0 && (
                <div>
                  <h3 className="text-stone-400 font-medium text-[10px] tracking-widest uppercase mb-3">Dormitorios</h3>
                  <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map((beds, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveBedrooms(activeBedrooms === beds ? null : beds)}
                        className={`px-3 py-2 text-[11px] border transition-colors ${
                          activeBedrooms === beds
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-500"
                        }`}
                      >
                        {beds}
                        <span className="ml-1.5 text-[10px] opacity-60">{countForBedrooms(beds)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {areaOptions.length > 0 && (
                <div>
                  <h3 className="text-stone-400 font-medium text-[10px] tracking-widest uppercase mb-3">Metraje</h3>
                  <div className="flex flex-wrap gap-2">
                    {areaOptions.map((area, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveArea(activeArea === area ? null : area)}
                        className={`px-3 py-2 text-[11px] border transition-colors ${
                          activeArea === area
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-500"
                        }`}
                      >
                        {area}
                        <span className="ml-1.5 text-[10px] opacity-60">{countForArea(area)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-4 w-full py-3.5 shrink-0 bg-stone-900 text-white text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-[0_0_20px_rgba(255,255,255,1)]"
            >
              Ver {enVentaFiltered.length} resultados
            </button>
          </div>
        )}
      </aside>

      <div className="w-full md:w-3/4">

        {showVenta && enVentaAll.length > 0 && (
          <section className="w-full flex flex-col">
            <div className="px-6 md:px-12 py-6 hidden md:block">
              <h2 className="text-xl font-light text-stone-400 tracking-tight">En Venta</h2>
            </div>

            {enVentaFiltered.length === 0 ? (
              <div className="px-6 md:px-12 py-12 text-stone-400 font-light text-sm">
                No hay proyectos en venta con esos filtros.
              </div>
            ) : (
              enVentaFiltered.map((project) => (
                <div key={project.id} className="w-full h-[60vh] md:h-[80vh] relative mb-1">
                  <ProjectCard project={project} />
                </div>
              ))
            )}
          </section>
        )}

        {showTerminados && terminados.length > 0 && (
          <section className="w-full flex flex-col md:mt-16 border-t border-stone-100 pt-8 md:pt-12">
            <div className="px-6 md:px-12 mb-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-1">Portafolio</p>
              <h2 className="text-xl font-light text-stone-500 tracking-tight">Proyectos Concluidos</h2>
            </div>
            {terminados.map((project) => (
              <div key={project.id} className="w-full h-[60vh] md:h-[80vh] relative mb-1">
                <ProjectCard project={project} />
              </div>
            ))}
          </section>
        )}

        {initialProjects.length === 0 && (
          <div className="px-6 md:px-12 py-16 text-stone-400 font-light">
            No hay proyectos registrados aún.
          </div>
        )}
      </div>
    </main>
  );
}
