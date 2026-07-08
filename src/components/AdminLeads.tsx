"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface Lead {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string | null;
  createdAt: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/leads`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-stone-500 font-light text-sm uppercase tracking-widest mt-8">Cargando solicitudes...</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-light text-stone-900 mb-8 uppercase tracking-widest">Solicitudes de Información</h2>
      
      {leads.length === 0 ? (
        <p className="text-stone-500 font-light text-sm">Aún no hay solicitudes de información.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-stone-200 shadow-sm">
          <table className="w-full text-left text-sm font-light text-stone-600">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Mensaje / Interés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-900">{lead.nombre}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${lead.email}`} className="hover:text-stone-900">{lead.email}</a>
                      <a href={`tel:${lead.telefono.replace(/\s/g, '')}`} className="hover:text-stone-900">{lead.telefono}</a>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={lead.mensaje || '-'}>
                    {lead.mensaje || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
