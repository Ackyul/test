"use client";

import { useState, useEffect, useCallback } from "react";
import AdminProjectForm from "@/components/AdminProjectForm";
import { siteConfig } from "@/siteConfig";
import { API_URL } from "@/lib/api";

const FOOTER_DEFAULTS: Record<string, string> = {
  footer_copyright:        siteConfig.copyright,
  contact_phone:           siteConfig.contact.phone,
  contact_email:           siteConfig.contact.email,
  contact_address_line1:   siteConfig.contact.addressLine1,
  contact_address_line2:   siteConfig.contact.addressLine2,
  social_instagram:        siteConfig.social.instagram,
  social_facebook:         siteConfig.social.facebook,
};

interface Project {
  id: number;
  slug: string;
  title: string;
  status: string;
  featured: boolean;
  featuredOrder?: number | null;
  [key: string]: unknown;
}

type TabType = "inicio" | "proyectos" | "footer";

const FOOTER_FIELDS = [
  { key: "footer_copyright",      label: "Texto de Copyright",  type: "text" },
  { key: "contact_phone",         label: "Teléfono",            type: "text" },
  { key: "contact_email",         label: "Email de Contacto",   type: "email" },
  { key: "contact_address_line1", label: "Dirección Línea 1",   type: "text" },
  { key: "contact_address_line2", label: "Dirección Línea 2",   type: "text" },
  { key: "social_instagram",      label: "Instagram (URL)",     type: "url" },
  { key: "social_facebook",       label: "Facebook (URL)",      type: "url" },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("inicio");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [footerData, setFooterData] = useState<Record<string, string>>(FOOTER_DEFAULTS);
  const [savingFooter, setSavingFooter] = useState(false);
  const [loadingFooter, setLoadingFooter] = useState(false);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      if (res.ok) setProjects(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchProjects();
  }, [isAuthenticated, fetchProjects]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "123456") {
      setIsAuthenticated(true);
    } else {
      showFeedback("error", "PIN incorrecto");
    }
  };

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const url = editingProject
        ? `${API_URL}/api/projects/${editingProject.id}`
        : `${API_URL}/api/projects`;
      const method = editingProject ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditingProject(null);
        setIsCreating(false);
        fetchProjects();
        showFeedback("success", "Proyecto guardado correctamente");
      } else {
        showFeedback("error", "Error al guardar");
      }
    } catch (e) {
      console.error(e);
      showFeedback("error", "Error de conexión");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) { fetchProjects(); showFeedback("success", "Proyecto eliminado"); }
    } catch (e) { console.error(e); }
  };

  const [featuredMap, setFeaturedMap] = useState<Record<number, { featured: boolean; order: number | null }>>({});

  useEffect(() => {
    const map: Record<number, { featured: boolean; order: number | null }> = {};
    projects.forEach((p) => {
      map[p.id] = { featured: p.featured, order: p.featuredOrder ?? null };
    });
    setFeaturedMap(map);
  }, [projects]);

  const featuredCount = Object.values(featuredMap).filter((v) => v.featured).length;

  const toggleFeatured = (id: number) => {
    setFeaturedMap((prev) => {
      const current = prev[id];
      if (current.featured) {
        return { ...prev, [id]: { featured: false, order: null } };
      } else {
        if (featuredCount >= 5) return prev;
        const usedOrders = Object.values(prev).filter((v) => v.featured).map((v) => v.order ?? 0);
        const nextOrder = usedOrders.length > 0 ? Math.max(...usedOrders) + 1 : 1;
        return { ...prev, [id]: { featured: true, order: nextOrder } };
      }
    });
  };

  const setOrder = (id: number, order: number) => {
    setFeaturedMap((prev) => ({ ...prev, [id]: { ...prev[id], order } }));
  };

  const saveFeatured = async () => {
    setSavingFeatured(true);
    try {
      const updates = Object.entries(featuredMap).map(([idStr, val]) =>
        fetch(`${API_URL}/api/projects/${idStr}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: val.featured, featuredOrder: val.order }),
        })
      );
      await Promise.all(updates);
      fetchProjects();
      showFeedback("success", "Selección de inicio guardada");
    } catch (e) {
      console.error(e);
      showFeedback("error", "Error al guardar");
    } finally {
      setSavingFeatured(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 selection:bg-stone-900 selection:text-white">
        <form
          onSubmit={handleLogin}
          className="bg-white p-12 border border-stone-200 shadow-sm flex flex-col items-center gap-6 max-w-sm w-full relative"
        >
          <h1 className="text-2xl font-light text-stone-900 tracking-tight">Acceso Restringido</h1>
          <p className="text-stone-500 font-light text-sm text-center">
            Ingresa el PIN maestro para acceder al panel de administración.
          </p>
          <input
            type="password"
            placeholder="PIN Maestro"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border-b border-stone-300 py-3 text-center text-xl font-light text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
            autoFocus
          />
          <button type="submit" className="w-full py-4 bg-stone-900 text-white uppercase text-xs tracking-widest hover:bg-stone-800 transition-colors mt-4">
            Ingresar
          </button>
          {feedback && (
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <span className="text-sm tracking-wide text-red-500">⚠ {feedback.text}</span>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24 px-6 md:px-12 selection:bg-stone-900 selection:text-white relative">

      {feedback && (
        <div className="fixed top-24 right-12 z-50 bg-white border border-stone-200 shadow-lg px-6 py-4">
          <span className={`text-sm tracking-wide ${feedback.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {feedback.type === "success" ? "✓ " : "⚠ "}
            {feedback.text}
          </span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-stone-200 pb-8">
          <div>
            <h1 className="text-4xl text-stone-900 font-light tracking-tight mb-2">Panel Administrativo</h1>
            <p className="text-stone-500 font-light text-sm uppercase tracking-widest">Gestión CMS</p>
          </div>

          <div className="flex bg-stone-200 p-1 rounded-sm">
            <button
              onClick={() => setActiveTab("inicio")}
              className={`px-6 py-2 text-xs tracking-widest uppercase transition-colors rounded-sm whitespace-nowrap ${activeTab === "inicio" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
            >
              Inicio
            </button>
            <button
              onClick={() => { setActiveTab("proyectos"); setIsCreating(false); setEditingProject(null); }}
              className={`px-6 py-2 text-xs tracking-widest uppercase transition-colors rounded-sm whitespace-nowrap ${activeTab === "proyectos" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
            >
              Proyectos
            </button>
            <button
              onClick={() => {
                setActiveTab("footer");
                if (!loadingFooter) {
                  setLoadingFooter(true);
                  fetch(`${API_URL}/api/settings`)
                    .then((r) => r.json())
                    .then((d: Record<string, string>) => {
                      setFooterData({ ...FOOTER_DEFAULTS, ...d });
                      setLoadingFooter(false);
                    })
                    .catch(() => setLoadingFooter(false));
                }
              }}
              className={`px-6 py-2 text-xs tracking-widest uppercase transition-colors rounded-sm whitespace-nowrap ${activeTab === "footer" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
            >
              Footer
            </button>
          </div>
        </header>

        {activeTab === "inicio" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-light text-stone-900 mb-1">Proyectos en Página de Inicio</h2>
                <p className="text-stone-500 text-sm font-light">
                  Selecciona hasta <strong>5 proyectos</strong> y asigna el orden en que aparecerán al hacer scroll.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${featuredCount >= 5 ? "text-amber-600" : "text-stone-400"}`}>
                  {featuredCount} / 5 seleccionados
                </span>
                <button
                  onClick={saveFeatured}
                  disabled={savingFeatured}
                  className="px-8 py-3 bg-stone-900 text-white uppercase text-xs tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {savingFeatured ? "Guardando..." : "Guardar selección"}
                </button>
              </div>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-stone-100 text-stone-500 border-b border-stone-200 p-4 text-xs uppercase tracking-widest font-medium">
                <div className="col-span-1 text-center">Destacar</div>
                <div className="col-span-1 text-center">Orden</div>
                <div className="col-span-5">Título</div>
                <div className="col-span-3">Slug</div>
                <div className="col-span-2">Estado</div>
              </div>

              {projects.length === 0 && (
                <div className="p-12 text-center text-stone-400 font-light">
                  No hay proyectos registrados. Ve a la pestaña Proyectos para crear uno.
                </div>
              )}

              {projects.map((p) => {
                const entry = featuredMap[p.id] ?? { featured: false, order: null };
                return (
                  <div
                    key={p.id}
                    className={`grid grid-cols-1 md:grid-cols-12 border-b border-stone-100 last:border-0 p-4 md:items-center transition-colors ${entry.featured ? "bg-emerald-50/40" : "hover:bg-stone-50"}`}
                  >
                    <div className="col-span-1 flex md:justify-center mb-2 md:mb-0">
                      <button
                        onClick={() => toggleFeatured(p.id)}
                        disabled={!entry.featured && featuredCount >= 5}
                        title={!entry.featured && featuredCount >= 5 ? "Máximo 5 proyectos" : ""}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          entry.featured
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "border-stone-300 text-transparent hover:border-stone-500 disabled:opacity-30"
                        }`}
                      >
                        ✓
                      </button>
                    </div>

                    <div className="col-span-1 flex md:justify-center mb-2 md:mb-0">
                      {entry.featured ? (
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={entry.order ?? ""}
                          onChange={(e) => setOrder(p.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-stone-200 py-1 text-sm font-light focus:outline-none focus:border-stone-500"
                        />
                      ) : (
                        <span className="text-stone-300 text-sm">—</span>
                      )}
                    </div>

                    <div className="col-span-5 font-medium text-stone-900 mb-1 md:mb-0">{p.title}</div>
                    <div className="col-span-3 text-stone-500 mb-1 md:mb-0 text-sm">/{p.slug}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${
                        p.status === "entregado" || p.status === "terminado"
                          ? "bg-stone-200 text-stone-700"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      }`}>
                        {p.status === "entregado" || p.status === "terminado" ? "Proyecto concluido" : p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-stone-400 text-xs font-light mt-4 tracking-wide">
              * El orden determina la posición de scroll en la página de inicio. Menor número = aparece primero.
            </p>
          </div>
        )}

        {activeTab === "proyectos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-stone-500 font-light text-sm">
                {projects.length} proyecto{projects.length !== 1 ? "s" : ""} registrado{projects.length !== 1 ? "s" : ""}
              </p>
              {!isCreating && !editingProject && (
                <button
                  onClick={() => { setIsCreating(true); setEditingProject(null); }}
                  className="px-8 py-3 bg-stone-900 text-white uppercase text-xs tracking-widest hover:bg-stone-800 transition-colors"
                >
                  + Nuevo Proyecto
                </button>
              )}
            </div>

            {(isCreating || editingProject) && (
              <div className="mb-12">
                <AdminProjectForm
                  initialData={editingProject || undefined}
                  onSave={handleSave}
                  onCancel={() => { setIsCreating(false); setEditingProject(null); }}
                />
              </div>
            )}

            {!isCreating && !editingProject && (
              <div className="bg-white border border-stone-200 shadow-sm overflow-hidden text-sm font-light">
                <div className="hidden md:grid grid-cols-12 bg-stone-100 text-stone-500 border-b border-stone-200 p-4 text-xs uppercase tracking-widest font-medium">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-4">Título</div>
                  <div className="col-span-3">Slug</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>

                {projects.length === 0 && (
                  <div className="p-12 text-center text-stone-400 font-light">Ningún proyecto registrado aún.</div>
                )}

                {projects.map((p) => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 border-b border-stone-100 last:border-0 p-4 md:items-center hover:bg-stone-50 transition-colors">
                    <div className="col-span-1 text-stone-400 mb-1 md:mb-0">#{p.id}</div>
                    <div className="col-span-4 font-medium text-stone-900 mb-1 md:mb-0 flex items-center gap-2">
                      {p.title}
                      {p.featured && (
                        <span className="text-[9px] bg-stone-900 text-white px-2 py-0.5 uppercase tracking-wider rounded-full">
                          Inicio
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-stone-500 mb-1 md:mb-0">/{p.slug}</div>
                    <div className="col-span-2 mb-3 md:mb-0">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${
                        p.status === "entregado" || p.status === "terminado"
                          ? "bg-stone-200 text-stone-700"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      }`}>
                        {p.status === "entregado" || p.status === "terminado" ? "Proyecto concluido" : p.status}
                      </span>
                    </div>
                    <div className="col-span-2 flex gap-4 md:justify-end">
                      <button
                        onClick={() => { setEditingProject(p); setIsCreating(false); }}
                        className="text-blue-600 hover:text-blue-800 transition-colors uppercase text-xs tracking-widest font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 transition-colors uppercase text-xs tracking-widest font-medium"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "footer" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-light text-stone-900 mb-1">Información del Footer</h2>
                <p className="text-stone-500 text-sm font-light">
                  Estos datos aparecen en el pie de página de todo el sitio.
                </p>
              </div>
              <button
                onClick={async () => {
                  setSavingFooter(true);
                  try {
                    const res = await fetch(`${API_URL}/api/settings`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(footerData),
                    });
                    if (res.ok) showFeedback("success", "Footer actualizado correctamente");
                    else showFeedback("error", "Error al guardar");
                  } catch { showFeedback("error", "Error de conexión"); }
                  finally { setSavingFooter(false); }
                }}
                disabled={savingFooter || loadingFooter}
                className="px-8 py-3 bg-stone-900 text-white uppercase text-xs tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {savingFooter ? "Guardando..." : "Guardar Footer"}
              </button>
            </div>

            {loadingFooter ? (
              <div className="p-12 text-center text-stone-400 font-light">Cargando datos...</div>
            ) : (
              <div className="bg-white border border-stone-200 shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {FOOTER_FIELDS.map((field) => (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-medium">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={footerData[field.key] ?? ""}
                      onChange={(e) => setFooterData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full border-b border-stone-200 py-3 text-stone-900 text-sm font-light focus:outline-none focus:border-stone-900 transition-colors bg-transparent"
                      placeholder={field.type === "url" ? "https://..." : ""}
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="text-stone-400 text-xs font-light mt-4 tracking-wide">
              * Los cambios se reflejan en el footer después de recargar la página.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
