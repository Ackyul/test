/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface AboutSection {
  id: number;
  title: string;
  description: string;
  image: string;
  order: number;
}

export default function AdminAboutForm() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', image: '', order: 0 });
  const [feedback, setFeedback] = useState<{type: 'success'|'error', text: string} | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchSections = () => {
    fetch(`${API_URL}/api/about`)
      .then(res => res.json())
      .then(data => {
        setSections(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleEdit = (section: AboutSection) => {
    setEditingId(section.id);
    setFormData({ title: section.title, description: section.description, image: section.image, order: section.order });
    setFeedback(null);
  };

  const handeNew = () => {
    setEditingId(0);
    setFormData({ title: '', description: '', image: '', order: sections.length });
    setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId === 0 ? `${API_URL}/api/about` : `${API_URL}/api/about/${editingId}`;
    const method = editingId === 0 ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setEditingId(null);
        fetchSections();
        showFeedback('success', "Sección guardada correctamente.");
      } else {
        showFeedback('error', "Error al guardar la sección.");
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', "Error de conexión.");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Borrar esta sección de Nosotros?")) return;
    const res = await fetch(`${API_URL}/api/about/${id}`, { method: 'DELETE' });
    if(res.ok) fetchSections();
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Cargando secciones...</div>;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-stone-100">
        <h2 className="text-xl font-light text-stone-900">Secciones &quot;Nosotros&quot;</h2>
        {editingId === null && (
          <button 
            onClick={handeNew} 
            className="px-4 py-2 bg-stone-900 text-white uppercase text-[10px] tracking-widest hover:bg-stone-800 transition-colors"
          >
            + Añadir Capítulo
          </button>
        )}
      </div>

      {editingId !== null ? (
        <form onSubmit={handleSave} className="p-6 bg-stone-50 border-b border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">{editingId === 0 ? 'Nuevo Capítulo' : 'Editar Capítulo'}</h3>
            <button type="button" onClick={() => setEditingId(null)} className="text-stone-500 hover:text-stone-900 text-xs uppercase tracking-widest">Cancelar</button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Título</label>
              <input 
                type="text" 
                required
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">Descripción (Párrafo narrativo)</label>
              <textarea 
                required rows={3}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500 resize-none"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-stone-500">URL de Imagen (Fondo Inmersivo)</label>
              <input 
                type="url" 
                required
                value={formData.image} 
                onChange={e => setFormData({...formData, image: e.target.value})}
                className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div>
              {feedback && (
                <span className={`text-sm tracking-wide ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {feedback.type === 'success' ? '✓ ' : '⚠ '} {feedback.text}
                </span>
              )}
            </div>
            <button type="submit" className="py-4 px-8 bg-stone-900 text-white uppercase text-xs tracking-widest hover:bg-stone-800 transition-colors">
              Guardar Capítulo
            </button>
          </div>
        </form>
      ) : (
        <div>
          {sections.length === 0 ? (
            <div className="p-8 text-center text-stone-500">No hay secciones todavía.</div>
          ) : (
            sections.map(s => (
              <div key={s.id} className="grid grid-cols-12 border-b border-stone-100 last:border-0 p-6 items-start md:items-center hover:bg-stone-50 transition-colors">
                <div className="col-span-12 md:col-span-2 mb-2 md:mb-0">
                  <div className="w-24 h-16 bg-stone-200 overflow-hidden relative">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-8 mb-4 md:mb-0">
                  <h4 className="font-medium text-stone-900 mb-1">{s.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2">{s.description}</p>
                </div>
                <div className="col-span-12 md:col-span-2 flex gap-4 md:justify-end">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 text-[10px] tracking-widest uppercase font-medium">Editar</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-[10px] tracking-widest uppercase font-medium">Borrar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
