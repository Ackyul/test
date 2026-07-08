"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

export default function AdminSettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) showFeedback('success', "Configuración guardada exitosamente.");
      else showFeedback('error', "Error al guardar.");
    } catch (err) {
      console.error(err);
      showFeedback('error', "Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Cargando configuración...</div>;

  return (
    <form onSubmit={handleSave} className="bg-white border border-stone-200 p-8 shadow-sm">
      <h2 className="text-2xl font-light text-stone-900 mb-6">Configuración Global</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-medium text-stone-900 border-b border-stone-100 pb-2 mb-4">Página de Inicio</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Título Principal (Hero)</label>
            <input 
              type="text" 
              value={settings.home_hero_title || ''} 
              onChange={e => handleChange('home_hero_title', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-stone-900 border-b border-stone-100 pb-2 mb-4">Pie de Página (Footer)</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Texto Copyright</label>
            <input 
              type="text" 
              value={settings.footer_copyright || ''} 
              onChange={e => handleChange('footer_copyright', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-stone-900 border-b border-stone-100 pb-2 mb-4">Página de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Línea de Dirección 1</label>
            <input 
              type="text" 
              value={settings.contact_address_line1 || ''} 
              onChange={e => handleChange('contact_address_line1', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Línea de Dirección 2</label>
            <input 
              type="text" 
              value={settings.contact_address_line2 || ''} 
              onChange={e => handleChange('contact_address_line2', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Teléfono</label>
            <input 
              type="text" 
              value={settings.contact_phone || ''} 
              onChange={e => handleChange('contact_phone', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Email</label>
            <input 
              type="email" 
              value={settings.contact_email || ''} 
              onChange={e => handleChange('contact_email', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-stone-900 border-b border-stone-100 pb-2 mb-4">Redes Sociales (Footer)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Enlace de Instagram</label>
            <input 
              type="url" 
              placeholder="https://instagram.com/..."
              value={settings.social_instagram || ''} 
              onChange={e => handleChange('social_instagram', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-stone-500">Enlace de Facebook</label>
            <input 
              type="url" 
              placeholder="https://facebook.com/..."
              value={settings.social_facebook || ''} 
              onChange={e => handleChange('social_facebook', e.target.value)}
              className="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>
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
          {saving ? 'Guardando...' : 'Guardar Cambios Globales'}
        </button>
      </div>
    </form>
  );
}
