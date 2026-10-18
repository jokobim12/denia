'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Crosshair, Loader2 } from 'lucide-react';

export interface MemorySpot {
  id: string;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  date?: string | null;
}

export interface SearchSpot {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

interface MemoryMapProps {
  spots: MemorySpot[];
  selectedSpot: MemorySpot | null;
  onSelectSpot: (spot: MemorySpot) => void;
  onMapClick?: (lat: number, lng: number) => void;
  searchResultSpot?: SearchSpot | null;
  onAddFromSearch?: (spot: SearchSpot) => void;
  mapType: 'street' | 'satellite';
  onToggleMapType: () => void;
}

export default function MemoryMap({
  spots,
  selectedSpot,
  onSelectSpot,
  onMapClick,
  searchResultSpot,
  onAddFromSearch,
  mapType,
  onToggleMapType,
}: MemoryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [isLocating, setIsLocating] = useState(false);

  // Inisialisasi peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = spots.length > 0
        ? [spots[0].latitude, spots[0].longitude]
        : [-6.2088, 106.8456];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Kontrol Zoom Leaflet di pojok kanan bawah
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer awal Leaflet
      const initialLayer = L.tileLayer(
        mapType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);

      currentTileLayerRef.current = initialLayer;

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Bersihkan marker lama
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Buat pin hati estetik untuk semua titik tersimpan
    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;

      const heartIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div class="w-8 h-8 rounded-full ${
            isSelected ? 'bg-rose-500 shadow-lg ring-4 ring-rose-200' : 'bg-white'
          } border-2 ${
            isSelected ? 'border-white' : 'border-rose-300'
          } shadow-md flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 ${
              isSelected ? 'text-white fill-white' : 'text-rose-400 fill-rose-100'
            }" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 ${
            isSelected ? 'bg-rose-500' : 'bg-rose-300'
          } rotate-45 rounded-xs"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: heartIconHtml,
        className: 'custom-map-marker',
        iconSize: [32, 38],
        iconAnchor: [16, 38],
      });

      const marker = L.marker([spot.latitude, spot.longitude], { icon: customIcon }).addTo(map);

      // Popup detail kenangan dengan foto (jika ada) saat marker diklik
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1.5 text-center font-sans space-y-2 max-w-[240px]';

      let imgHtml = '';
      if (spot.imageUrl) {
        imgHtml = `
          <div class="w-full h-32 rounded-xl overflow-hidden bg-cream-100 border border-cream-200 mb-2 shadow-xs">
            <img src="${spot.imageUrl}" alt="${spot.title}" class="w-full h-full object-cover" />
          </div>
        `;
      }

      popupDiv.innerHTML = `
        ${imgHtml}
        <div class="px-1 pb-1">
          <span class="inline-block text-[9px] uppercase tracking-wider font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full mb-1">
            ${spot.category === 'first-meet' ? 'Awal Ketemu' : spot.category === 'favorite' ? 'Tempat Favorit' : spot.category === 'travel' ? 'Perjalanan' : 'Kencan Manis'}
          </span>
          <h4 class="font-serif font-bold text-sm text-sage-900 leading-tight">${spot.title}</h4>
          <p class="text-[11px] text-sage-900/70 mt-1 line-clamp-2 leading-snug">${spot.description}</p>
        </div>
      `;

      marker.bindPopup(popupDiv, { offset: [0, -32], closeButton: false });

      marker.on('click', () => {
        onSelectSpot(spot);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([spot.latitude, spot.longitude], 17, { duration: 1.2 });
        }
        marker.openPopup();
      });

      markersRef.current[spot.id] = marker;
    });
  }, [spots, onSelectSpot, onMapClick, selectedSpot]);

  // Efek ganti tipe peta (Street vs Satellite ala Google Maps via Leaflet)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    if (mapType === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
      currentTileLayerRef.current = satLayer;
    } else {
      const streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      currentTileLayerRef.current = streetLayer;
    }
  }, [mapType]);

  // Efek geser dan ngezoom otomatis (zoom 17) ke spot yang dipilih
  useEffect(() => {
    if (selectedSpot && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedSpot.latitude, selectedSpot.longitude],
        17,
        { duration: 1.2 }
      );
      if (markersRef.current[selectedSpot.id]) {
        markersRef.current[selectedSpot.id].openPopup();
      }
    }
  }, [selectedSpot]);

  // Efek jika user mencari lokasi baru via search
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }

    if (searchResultSpot) {
      // Terbang ke lokasi pencarian
      map.flyTo([searchResultSpot.latitude, searchResultSpot.longitude], 16, {
        duration: 1.5,
      });

      // Pin penanda hasil pencarian
      const searchIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer animate-bounce">
          <div class="w-9 h-9 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-2.5 h-2.5 bg-amber-500 rotate-45 rounded-xs"></div>
        </div>
      `;

      const searchIcon = L.divIcon({
        html: searchIconHtml,
        className: 'custom-search-marker',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
      });

      const marker = L.marker([searchResultSpot.latitude, searchResultSpot.longitude], {
        icon: searchIcon,
      }).addTo(map);

      // Popup tombol "Tandai Lokasi Ini"
      const popupContent = document.createElement('div');
      popupContent.className = 'text-center p-1.5 space-y-1.5 font-sans';
      popupContent.innerHTML = `
        <p class="font-serif font-bold text-sm text-gray-900 leading-tight">${searchResultSpot.name}</p>
        <p class="text-[11px] text-gray-500 line-clamp-2 max-w-[200px] leading-snug">${searchResultSpot.displayName}</p>
      `;

      const actionBtn = document.createElement('button');
      actionBtn.className =
        'w-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs py-1.5 px-3 rounded-full shadow-xs transition-colors cursor-pointer mt-1';
      actionBtn.innerText = '✨ Tandai Tempat Ini';
      actionBtn.onclick = () => {
        if (onAddFromSearch) {
          onAddFromSearch(searchResultSpot);
        }
      };

      popupContent.appendChild(actionBtn);

      marker.bindPopup(popupContent, { offset: [0, -35] }).openPopup();
      searchMarkerRef.current = marker;
    }
  }, [searchResultSpot, onAddFromSearch]);

  // Fitur GPS / Lokasi Saat Ini (ala Google Maps)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur lokasi GPS tidak didukung di peramban ini.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.5 });
        }
        if (onMapClick) {
          onMapClick(latitude, longitude);
        }
      },
      (err) => {
        setIsLocating(false);
        console.error(err);
        alert('Gagal mendeteksi lokasi saat ini. Pastikan izin GPS diaktifkan.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="w-full h-full relative z-0 isolate rounded-3xl overflow-hidden border border-cream-200 shadow-sm bg-cream-100 couple-memory-map">
      <style>{`
        .couple-memory-map .leaflet-tile-pane {
          filter: ${
            mapType === 'street'
              ? 'brightness(0.98) contrast(0.92) saturate(0.8) sepia(0.06)'
              : 'none'
          };
        }
        .couple-memory-map .leaflet-container {
          background-color: #FDFBF7 !important;
          font-family: inherit;
        }
        .custom-map-marker, .custom-search-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          background: #ffffff !important;
          border: 1px solid #f1ece4 !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>

      {/* Floating Button Google Maps Style: Layer Switcher di Pojok Kiri Bawah (z-[1000] agar SELALU tampil) */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <button
          onClick={onToggleMapType}
          className="bg-white/95 hover:bg-white text-sage-900 border border-cream-300/80 shadow-md backdrop-blur-xs px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg active:scale-95"
          title="Ganti Tampilan Peta (Jalan / Satelit)"
        >
          <Layers className="h-4 w-4 text-rose-500" />
          <span>{mapType === 'street' ? 'Mode Satelit 🛰️' : 'Peta Jalan 🗺️'}</span>
        </button>
      </div>

      {/* Floating Button Google Maps Style: GPS Lokasi Saya di Atas Tombol Zoom Kanan Bawah (z-[1000] agar SELALU tampil) */}
      <div className="absolute bottom-20 right-3 z-[1000]">
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="bg-white/95 hover:bg-white text-sage-900 border border-cream-300/80 shadow-md backdrop-blur-xs p-2.5 rounded-xl text-xs font-sans font-medium flex items-center justify-center transition-all cursor-pointer hover:shadow-lg active:scale-95"
          title="Pusatkan ke Lokasi Saya Sekarang (GPS)"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 text-rose-500 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4 text-sage-900/80 hover:text-rose-500" />
          )}
        </button>
      </div>

      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] md:min-h-[500px]" />
    </div>
  );
}
