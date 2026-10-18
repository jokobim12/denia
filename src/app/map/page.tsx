'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import PasscodeModal from '@/components/PasscodeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Heart, X, Loader2, Navigation, Trash2, Search, Layers, Camera } from 'lucide-react';
import type { MemorySpot, SearchSpot } from '@/components/MemoryMap';

interface SearchResultItem {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type?: string;
}

// Import Leaflet Map secara dinamis agar tidak error di server-side rendering (SSR)
const MemoryMap = dynamic(() => import('@/components/MemoryMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] md:min-h-[500px] rounded-3xl bg-cream-100 border border-cream-200 animate-pulse flex flex-col items-center justify-center text-sage-900/40">
      <MapPin className="h-8 w-8 animate-bounce text-rose-300 mb-2" />
      <span className="text-xs font-sans">Menyiapkan peta kenangan...</span>
    </div>
  ),
});

export default function MapPage() {
  const [spots, setSpots] = useState<MemorySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<MemorySpot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Map Mode State (Peta Jalan vs Satelit ala Google Maps)
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  // Search State (Pencarian Lokasi Gratis ala Google Maps)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultSpot, setSearchResultSpot] = useState<SearchSpot | null>(null);

  // Passcode Protection State
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('date');
  const [formLat, setFormLat] = useState('-6.2088');
  const [formLng, setFormLng] = useState('106.8456');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memory-spots');
      if (res.ok) {
        const data = await res.json();
        setSpots(data);
        if (data.length > 0 && !selectedSpot) {
          setSelectedSpot(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching spots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  // Debounce search effect (mencari lokasi ketika user mengetik)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const checkAuthAndExecute = async (action: () => void) => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) {
        action();
        return;
      }
    } catch {
      // ignore
    }
    setPendingAction(() => action);
    setIsPasscodeOpen(true);
  };

  const handleOpenAddModal = () => {
    checkAuthAndExecute(() => {
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsAddModalOpen(true);
    });
  };

  const handleMapClick = (lat: number, lng: number) => {
    checkAuthAndExecute(() => {
      setFormLat(lat.toFixed(5));
      setFormLng(lng.toFixed(5));
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsAddModalOpen(true);
    });
  };

  // Saat user memilih lokasi dari hasil pencarian
  const handleSelectSearchResult = (item: SearchResultItem) => {
    setSearchResultSpot({
      name: item.name,
      displayName: item.displayName,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setSearchResults([]);
  };

  // Saat user menekan tombol "Tandai Tempat Ini" dari hasil pencarian
  const handleAddFromSearch = (spot: SearchSpot) => {
    checkAuthAndExecute(() => {
      setFormTitle(spot.name);
      setFormDesc(spot.displayName);
      setFormLat(spot.latitude.toFixed(5));
      setFormLng(spot.longitude.toFixed(5));
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsAddModalOpen(true);
    });
  };

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      let uploadedImageUrl: string | null = null;

      // Unggah foto terlebih dahulu jika user memilih foto
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah foto. Pastikan ukuran di bawah 6MB.');
        }
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      const res = await fetch('/api/memory-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim(),
          category: formCategory,
          latitude: parseFloat(formLat),
          longitude: parseFloat(formLng),
          imageUrl: uploadedImageUrl,
        }),
      });

      if (res.ok) {
        const newSpot = await res.json();
        setSpots((prev) => [...prev, newSpot]);
        setSelectedSpot(newSpot);
        setFormTitle('');
        setFormDesc('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setSearchResultSpot(null);
        setSearchQuery('');
        setIsAddModalOpen(false);
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Gagal menambah titik. Pastikan sudah memasukkan sandi rahasia.');
      }
    } catch (err: unknown) {
      console.error('Error adding spot:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan titik.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload foto ke titik yang sudah ada (misal Taman Permana yang belum ada fotonya)
  const handleUploadPhotoToExistingSpot = async (spotId: string, file: File) => {
    checkAuthAndExecute(async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Gagal mengunggah foto.');
        const { url: imageUrl } = await uploadRes.json();

        const patchRes = await fetch('/api/memory-spots', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: spotId, imageUrl }),
        });

        if (patchRes.ok) {
          const updated = await patchRes.json();
          setSpots((prev) => prev.map((s) => (s.id === spotId ? updated : s)));
          if (selectedSpot?.id === spotId) {
            setSelectedSpot(updated);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Gagal menambahkan foto ke titik ini.');
      }
    });
  };

  const executeDeleteSpot = async (id: string) => {
    if (!confirm('Hapus titik kenangan ini?')) return;

    setSpots((prev) => prev.filter((s) => s.id !== id));
    if (selectedSpot?.id === id) {
      setSelectedSpot(spots.find((s) => s.id !== id) || null);
    }

    try {
      await fetch(`/api/memory-spots?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting spot:', err);
      fetchSpots();
    }
  };

  const handleDeleteSpot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    checkAuthAndExecute(() => executeDeleteSpot(id));
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'first-meet':
        return { label: 'Awal Ketemu', color: 'bg-rose-50 text-rose-600 border-rose-100' };
      case 'favorite':
        return { label: 'Tempat Favorit', color: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'travel':
        return { label: 'Perjalanan', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'date':
      default:
        return { label: 'Kencan Manis', color: 'bg-cream-100 text-sage-900/70 border-cream-200' };
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col text-sage-900 select-none">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-rose-400 font-serif text-lg flex items-center justify-center gap-1.5">
            <Navigation className="h-4 w-4" />
            <span>Our Special Coordinates</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-sage-900">Peta Jejak Kita</h1>
          <p className="text-xs md:text-sm text-sage-900/50 max-w-md mx-auto italic font-sans px-4">
            &ldquo;Setiap sudut tempat yang pernah menjadi saksi tawa dan cerita kita.&rdquo;
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-rose-200 hover:bg-rose-300 text-rose-950 px-5 py-2 rounded-full text-xs font-medium shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tandai Titik Baru</span>
            </button>
          </div>
        </div>

        {/* Interactive Map & Side Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map & Search Bar */}
          <div className="lg:col-span-7 space-y-3">
            {/* Search Bar & Mode Switcher Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-30">
              <div className="relative flex-1">
                <div className="relative flex items-center bg-white border border-cream-200/90 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                  <Search className="h-4 w-4 text-sage-900/40 ml-4 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari lokasi kenangan (contoh: Monas, Kuta Bali, Kafe...)"
                    className="w-full py-2.5 pl-3 pr-10 text-xs md:text-sm bg-transparent focus:outline-none text-sage-900 placeholder:text-sage-900/40 font-sans"
                  />
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 text-rose-400 animate-spin mr-3 shrink-0" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="p-1 text-sage-900/40 hover:text-sage-900 mr-2 rounded-full cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                {/* Search Results Autocomplete Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-cream-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                    >
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectSearchResult(item)}
                          className="w-full p-3 text-left hover:bg-rose-50/50 flex items-start gap-3 border-b border-cream-100 last:border-b-0 transition-colors cursor-pointer group"
                        >
                          <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-sage-900 font-sans truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-sage-900/60 font-sans line-clamp-1">
                              {item.displayName}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode Tampilan Peta Selalu Terlihat (Peta Jalan vs Satelit) */}
              <div className="flex items-center bg-white border border-cream-200/90 rounded-2xl p-1 shadow-xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMapType('street')}
                  className={`px-3 py-2 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapType === 'street'
                      ? 'bg-rose-100 text-rose-950 shadow-xs'
                      : 'text-sage-900/60 hover:text-sage-900'
                  }`}
                  title="Peta Jalan (Standar)"
                >
                  <Navigation className="h-3.5 w-3.5 text-rose-500" />
                  <span>Peta Jalan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-2 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapType === 'satellite'
                      ? 'bg-rose-100 text-rose-950 shadow-xs'
                      : 'text-sage-900/60 hover:text-sage-900'
                  }`}
                  title="Citra Satelit Beresolusi Tinggi"
                >
                  <Layers className="h-3.5 w-3.5 text-rose-500" />
                  <span>Satelit 🛰️</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-[420px] md:h-[480px] relative z-0 isolate">
              <MemoryMap
                spots={spots}
                selectedSpot={selectedSpot}
                onSelectSpot={(spot) => setSelectedSpot(spot)}
                onMapClick={handleMapClick}
                searchResultSpot={searchResultSpot}
                onAddFromSearch={handleAddFromSearch}
                mapType={mapType}
                onToggleMapType={() => setMapType((prev) => (prev === 'street' ? 'satellite' : 'street'))}
              />
            </div>

            <p className="text-[10px] text-sage-900/40 text-center font-sans italic">
              💡 Tips: Klik pin hati di peta untuk ngezoom & melihat foto kenangan, atau gunakan kotak pencarian untuk mencari lokasi baru.
            </p>
          </div>

          {/* Right Column: Active Spot Detail & List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Highlight Card */}
            {selectedSpot ? (
              <motion.div
                key={selectedSpot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 border border-cream-200 rounded-3xl p-5 shadow-xs relative"
              >
                {/* Photo Display if available */}
                {selectedSpot.imageUrl ? (
                  <div
                    onClick={() => setViewingPhoto(selectedSpot.imageUrl!)}
                    className="w-full h-44 rounded-2xl overflow-hidden mb-3.5 border border-cream-200 shadow-inner relative group cursor-pointer"
                    title="Klik untuk memperbesar foto"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedSpot.imageUrl}
                      alt={selectedSpot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors flex items-end p-2.5">
                      <span className="text-[10px] text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full font-sans">
                        🔍 Klik untuk perbesar
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3.5">
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-cream-300 hover:border-rose-300 rounded-2xl cursor-pointer bg-cream-50/50 hover:bg-cream-100/50 transition-colors text-xs text-sage-900/70 hover:text-sage-900 font-sans">
                      <Camera className="h-4 w-4 text-rose-400" />
                      <span>+ Tambah Foto di Lokasi Ini</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadPhotoToExistingSpot(selectedSpot.id, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] uppercase font-sans tracking-wider px-2.5 py-0.5 rounded-full border font-medium ${
                      getCategoryBadge(selectedSpot.category).color
                    }`}
                  >
                    {getCategoryBadge(selectedSpot.category).label}
                  </span>
                  
                  <span className="text-[10px] text-sage-900/40 font-sans">
                    {selectedSpot.latitude.toFixed(4)}, {selectedSpot.longitude.toFixed(4)}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-sage-900 font-medium">
                  {selectedSpot.title}
                </h3>

                <p 
                  className="mt-2 text-sm text-sage-900/80 leading-relaxed font-sans"
                >
                  {selectedSpot.description}
                </p>

                <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between text-[11px] text-sage-900/40 font-sans">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-300 fill-rose-100" />
                    <span>Titik Kenangan Denia</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteSpot(selectedSpot.id, e)}
                    className="text-sage-900/30 hover:text-rose-500 transition-colors p-1 rounded-md cursor-pointer"
                    title="Hapus titik ini"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : spots.length === 0 && !loading ? (
              <div className="bg-white/80 border border-dashed border-cream-200 rounded-3xl p-6 text-center space-y-2">
                <Heart className="h-7 w-7 text-rose-300 mx-auto" />
                <h3 className="font-serif text-lg text-sage-900 font-medium">Belum Ada Titik Kenangan</h3>
                <p className="text-xs text-sage-900/50 font-sans max-w-xs mx-auto leading-relaxed">
                  Tandai tempat pertama bertemu, kafe favorit, atau lokasi kencan berdua dengan mencari nama tempat di atas atau mengklik peta.
                </p>
              </div>
            ) : null}

            {/* List of other spots */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <span className="text-xs uppercase tracking-wider text-sage-900/40 font-sans block pl-1">
                Daftar Lokasi ({spots.length})
              </span>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-white/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : spots.length === 0 ? (
                <div className="text-center py-6 bg-white/40 rounded-2xl border border-dashed border-cream-200/80">
                  <p className="text-xs text-sage-900/40 font-serif">Belum ada lokasi yang ditandai.</p>
                </div>
              ) : (
                spots.map((spot) => {
                  const isSelected = selectedSpot?.id === spot.id;
                  return (
                    <div
                      key={spot.id}
                      onClick={() => setSelectedSpot(spot)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                          : 'bg-white/60 hover:bg-white border-cream-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {spot.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={spot.imageUrl}
                            alt={spot.title}
                            className="h-10 w-10 rounded-xl object-cover shrink-0 border border-cream-200"
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-rose-100 text-rose-500' : 'bg-cream-100 text-sage-900/40'
                          }`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-serif text-sm text-sage-900 font-medium truncate">
                            {spot.title}
                          </h4>
                          <span className="text-[10px] text-sage-900/40 font-sans block line-clamp-1 truncate">
                            {spot.description}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSpot(spot.id, e)}
                        className="opacity-40 hover:opacity-100 p-1 text-sage-900/40 hover:text-rose-500 transition-all cursor-pointer shrink-0 ml-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Add Memory Spot */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sage-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cream-50 w-full max-w-md rounded-3xl p-6 border border-cream-200 shadow-xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-sage-900/50 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-1 mb-5">
                <h3 className="font-serif text-xl text-sage-900 font-medium">Tandai Titik Kenangan Baru</h3>
                <p className="text-xs text-sage-900/50 font-sans">
                  Abadikan tempat yang memiliki arti manis bagi kalian
                </p>
              </div>

              <form onSubmit={handleAddSpot} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">
                    Nama Lokasi / Tempat
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Kafe Senja Favorit..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 text-sage-900"
                    autoFocus
                    required
                  />
                </div>

                {/* Upload Foto Kenangan */}
                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">
                    Foto Kenangan di Sini (Opsional)
                  </label>
                  {photoPreview ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-cream-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                        title="Hapus foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-cream-300 hover:border-rose-300 rounded-2xl cursor-pointer bg-white/70 hover:bg-white transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Camera className="w-5 h-5 text-rose-400 mb-1" />
                        <p className="text-xs text-sage-900/70 font-sans">
                          <span className="font-semibold text-rose-500">Unggah Foto</span> dari perangkat
                        </p>
                        <p className="text-[10px] text-sage-900/40 font-sans mt-0.5">JPG, PNG atau WEBP (Maks 6MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPhotoFile(file);
                            setPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 text-sage-900 cursor-pointer"
                  >
                    <option value="first-meet">Awal Pertama Ketemu</option>
                    <option value="date">Kencan Manis</option>
                    <option value="favorite">Tempat Nongkrong Favorit</option>
                    <option value="travel">Perjalanan / Liburan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">
                    Cerita Singkat di Tempat Ini
                  </label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Apa kenangan manis yang terjadi di sini..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 text-sage-900 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-sans text-sage-900/50 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-cream-200 text-xs text-sage-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-sans text-sage-900/50 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-cream-200 text-xs text-sage-900"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formTitle.trim()}
                    className="w-full py-3 bg-rose-200 hover:bg-rose-300 disabled:opacity-50 text-rose-950 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan Titik & Foto...</span>
                      </>
                    ) : (
                      <span>Sematkan ke Peta Jejak ✨</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Fullscreen Preview Modal */}
      <AnimatePresence>
        {viewingPhoto && (
          <div
            onClick={() => setViewingPhoto(null)}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative"
            >
              <button
                onClick={() => setViewingPhoto(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewingPhoto} alt="Kenangan" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Romantic Passcode Dialog for Protected Actions */}
      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => {
          setIsPasscodeOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        description="Masukkan sandi rahasia untuk menandai atau mengubah titik jejak kenangan."
      />
    </div>
  );
}
