"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const currentLat = isNaN(lat) || lat === 0 ? -33.4489 : lat;
  const currentLng = isNaN(lng) || lng === 0 ? -70.6693 : lng;

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as HTMLElement & { _leaflet_id?: number };
    if (container._leaflet_id) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      const el = mapRef.current as HTMLElement & { _leaflet_id?: number };
      if (el._leaflet_id) return;

      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([currentLat, currentLng], 15);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: la, lng: lo } = e.latlng;
        marker.setLatLng([la, lo]);
        onChange(Number(la.toFixed(6)), Number(lo.toFixed(6)));
      });

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!markerRef.current || !leafletMapRef.current) return;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1&countrycodes=cl`,
        { headers: { "Accept-Language": "es" } }
      );
      const results = await res.json();
      if (results.length === 0) {
        setSearchError("No se encontró la dirección");
        return;
      }
      const { lat: la, lon: lo } = results[0];
      const newLat = Number(parseFloat(la).toFixed(6));
      const newLng = Number(parseFloat(lo).toFixed(6));
      onChange(newLat, newLng);
      leafletMapRef.current?.setView([newLat, newLng], 17);
      markerRef.current?.setLatLng([newLat, newLng]);
    } catch {
      setSearchError("Error al buscar dirección");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar dirección (ej: Av. Apoquindo 4501, Las Condes)"
            className="w-full border border-stone-300 pl-9 pr-4 py-2.5 text-sm text-stone-900 font-light focus:outline-none focus:border-stone-600"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-5 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {searching ? "..." : "Buscar"}
        </button>
      </div>
      {searchError && <p className="text-red-500 text-xs">{searchError}</p>}

      <p className="text-xs text-stone-400 font-light flex items-center gap-1.5">
        <MapPin className="w-3 h-3" />
        Haz clic en el mapa o arrastra el pin para ajustar la posición exacta
      </p>

      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden border border-stone-200"
        style={{ height: "320px", zIndex: 0 }}
      />

      <div className="flex gap-4 text-xs text-stone-400 font-light tabular-nums">
        <span>Lat: <span className="text-stone-700">{lat ? lat.toFixed(6) : "—"}</span></span>
        <span>Lng: <span className="text-stone-700">{lng ? lng.toFixed(6) : "—"}</span></span>
      </div>
    </div>
  );
}
