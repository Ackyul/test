"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { API_URL } from "@/lib/api";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export interface ProjectData {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  status?: string;
  priceRange?: string;
  bedrooms?: string;
  area?: string;
  lat?: number;
  lng?: number;
  videoUrl?: string;
  images?: string[];
  [key: string]: unknown;
}

export default function AdminProjectForm({ 
  initialData = {}, 
  onSave, 
  onCancel 
}: { 
  initialData?: ProjectData, 
  onSave: (data: Record<string, unknown>) => void, 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    slug: initialData.slug || "",
    description: initialData.description || "",
    status: initialData.status || "preventa",
    priceRange: initialData.priceRange || "",
    bedrooms: initialData.bedrooms || "",
    area: (initialData.area || "").replace(/m²|m²/g, "m2"),
    lat: initialData.lat || 0,
    lng: initialData.lng || 0,
    videoUrl: initialData.videoUrl || "",
  });

  const [images, setImages] = useState<string[]>(
    initialData.images && Array.isArray(initialData.images) ? initialData.images : []
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach(f => formDataUpload.append('files', f));
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formDataUpload });
      if (res.ok) {
        const { urls } = await res.json();
        setImages(prev => [...prev, ...urls]);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    uploadFiles(files);
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lat: Number(formData.lat), lng: Number(formData.lng), images });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 border border-stone-200 mt-6 shadow-sm">
      <h3 className="text-xl font-light text-stone-900 mb-6 uppercase tracking-widest">
        {initialData.id ? "Editar Proyecto" : "Nuevo Proyecto"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
          Título Oficial
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light" />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
          Identificador URL (Slug)
          <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light lowercase" placeholder="ej. jose-galvez-594" disabled={!!initialData.id} />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium md:col-span-2">
          Descripción Principal
          <textarea required name="description" value={formData.description} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light h-24" />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
          Estado del Proyecto
          <select name="status" value={formData.status} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light">
            <option value="preventa">Preventa (En Venta)</option>
            <option value="en construcción">En Construcción (En Venta)</option>
            <option value="entrega inmediata">Entrega Inmediata (En Venta)</option>
            <option value="entregado">Proyecto Concluido</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
          Rango de Precio
          <input type="text" name="priceRange" value={formData.priceRange} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light" placeholder="Ej: USD 190,000 - USD 249,999" />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
          Dormitorios
          <input type="text" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light" placeholder="Ej: 1 dormitorio" />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
          Metraje
          <input type="text" name="area" value={formData.area} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light" placeholder="Ej: 60 - 79 m2" />
        </label>
        <div className="md:col-span-2 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">Ubicación GPS</p>
          <MapPicker lat={Number(formData.lat)} lng={Number(formData.lng)} onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} />
        </div>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium md:col-span-2">
          URL Fondo Inmersivo (Video MP4 o YouTube)
          <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="border border-stone-300 p-3 text-sm text-stone-900 font-light" />
        </label>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-medium mb-3">Imágenes del Proyecto</p>
          <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? 'border-stone-900 bg-stone-50' : 'border-stone-300 hover:border-stone-500'}`}>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
            {uploading ? (
              <p className="text-sm text-stone-500 font-light animate-pulse">Subiendo imágenes...</p>
            ) : (
              <>
                <span className="text-3xl mb-2">↑</span>
                <p className="text-sm font-light text-stone-500 text-center">Arrastra imágenes aquí o <span className="underline">haz clic para seleccionar</span></p>
                <p className="text-xs text-stone-400 mt-1">JPG, PNG, WebP — máx. 20 MB c/u</p>
              </>
            )}
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative group aspect-square border border-stone-200">
                  <Image src={url} alt={`img-${idx}`} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {idx > 0 && <button type="button" onClick={() => moveImage(idx, idx - 1)} className="bg-white text-stone-900 w-7 h-7 flex items-center justify-center text-xs hover:bg-stone-100">←</button>}
                    {idx < images.length - 1 && <button type="button" onClick={() => moveImage(idx, idx + 1)} className="bg-white text-stone-900 w-7 h-7 flex items-center justify-center text-xs hover:bg-stone-100">→</button>}
                    <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                  </div>
                  {idx === 0 && <span className="absolute top-1 left-1 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 uppercase tracking-wider">Principal</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <button type="button" onClick={onCancel} className="px-8 py-3 border border-stone-300 text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-widest text-xs font-medium">Cancelar</button>
        <button type="submit" className="px-8 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors uppercase tracking-widest text-xs font-medium">Guardar Cambios</button>
      </div>
    </form>
  );
}
