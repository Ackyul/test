"use client";

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/api";

interface Project {
  id: number;
  title: string;
}

export default function AdminHomeForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [projRes, setRes] = await Promise.all([
        fetch(`${API_URL}/api/projects`),
        fetch(`${API_URL}/api/settings`)
      ]);
      
      if (projRes.ok) {
        setProjects(await projRes.json());
      }
      
      if (setRes.ok) {
        const settings = await setRes.json();
        if (settings.home_featured_projects) {
          setFeaturedIds(settings.home_featured_projects.split(',').map(Number));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleProject = (id: number) => {
    setFeaturedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        if (prev.length >= 5) {
          showFeedback('error', 'Máximo 5 proyectos permitidos');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_featured_projects: featuredIds.join(',')
        })
      });
      
      if (res.ok) {
        showFeedback('success', 'Proyectos destacados guardados');
      } else {
        showFeedback('error', 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-8 border border-stone-200 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-light text-stone-900 mb-2">Proyectos Destacados (Inicio)</h2>
        <p className="text-sm text-stone-500 font-light">
          Selecciona hasta 5 proyectos para mostrar en la galería de la página principal.
          ({featuredIds.length}/5 seleccionados)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {projects.length === 0 ? (
          <p className="text-sm text-stone-500 italic">No hay proyectos registrados aún.</p>
        ) : (
          projects.map(p => {
            const isSelected = featuredIds.includes(p.id);
            return (
              <div 
                key={p.id} 
                onClick={() => toggleProject(p.id)}
                className={`p-4 border cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="text-sm font-medium text-stone-900">{p.title}</span>
                <div className={`w-5 h-5 border rounded-full flex items-center justify-center ${
                  isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                }`}>
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-stone-100">
        <div>
          {feedback && (
            <span className={`text-sm tracking-wide ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {feedback.type === 'success' ? '✓ ' : '⚠ '} {feedback.text}
            </span>
          )}
        </div>
        <button 
          type="submit" 
          disabled={saving}
          className="px-8 py-3 bg-stone-900 text-white uppercase text-xs tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
