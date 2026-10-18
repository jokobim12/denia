'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Camera, X, Heart, Plus, Download, Lock, Loader2, Trash2 } from 'lucide-react';
import CameraModal from '@/components/CameraModal';

interface Photo {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  eventDate: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Passcode modal state for Tambah Momen
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch('/api/photos');
        if (res.ok && isMounted) {
          const data = await res.json();
          setPhotos(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleOpenAddMoment = async () => {
    // Check if user already has an active session
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsCameraOpen(true);
        return;
      }
    } catch {
      // ignore
    }
    // If not authenticated, prompt for secret passcode
    setPasscode('');
    setPasscodeError('');
    setPendingAction(() => () => setIsCameraOpen(true));
    setIsPasscodeOpen(true);
  };

  const executeDeletePhoto = async (id: string) => {
    if (!confirm('Hapus foto kenangan ini?')) return;
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        setSelectedPhoto(null);
      } else {
        alert('Gagal menghapus foto.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus foto.');
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) {
        executeDeletePhoto(id);
        return;
      }
    } catch {
      // ignore
    }
    setPasscode('');
    setPasscodeError('');
    setPendingAction(() => () => executeDeletePhoto(id));
    setIsPasscodeOpen(true);
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setIsVerifying(true);
    setPasscodeError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode }),
      });

      if (res.ok) {
        setIsPasscodeOpen(false);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        } else {
          setIsCameraOpen(true);
        }
      } else {
        setPasscodeError('Sandi belum tepat, coba lagi ya 💕');
      }
    } catch {
      setPasscodeError('Gagal memverifikasi sandi. Coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  const getRotationClass = (index: number) => {
    const rotations = [
      'rotate-1',
      '-rotate-1',
      'rotate-0',
      'rotate-1',
      '-rotate-1',
      'rotate-0',
    ];
    return rotations[index % rotations.length];
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed, opening in new tab', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center space-y-3 mb-16 select-none">
          <span className="text-rose-400 font-serif text-lg flex items-center justify-center gap-1.5">
            <Camera className="h-4 w-4" />
            <span>Snapshots of You</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-sage-900">Koleksi Foto</h1>
          <p className="text-xs md:text-sm text-sage-900/50 max-w-md mx-auto italic font-sans px-4">
            &ldquo;Kumpulan foto&rdquo;
          </p>
          <div className="pt-6">
            <button
              onClick={handleOpenAddMoment}
              className="mx-auto flex items-center gap-2 bg-rose-200 hover:bg-rose-300 text-rose-950 px-6 py-3 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Tambah Momen
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-cream-200 p-4 pb-12 animate-pulse h-80 flex flex-col justify-between shadow-sm"
              >
                <div className="w-full h-60 bg-cream-100 rounded-sm" />
                <div className="h-4 bg-cream-100 rounded-full w-2/3 mt-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 bg-white/20 rounded-3xl border border-dashed border-cream-300">
            <Heart className="h-10 w-10 text-rose-200 mx-auto mb-4" />
            <p className="text-sage-900/60 font-serif">Papan foto masih kosong. Unggah pap pertamanya dari admin!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Bagian Koleksi Foto Normal */}
            <div>
              {photos.filter(p => !p.description.includes('#photobooth')).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {photos.filter(p => !p.description.includes('#photobooth')).map((photo, idx) => (
                    <motion.div
                      key={photo.id}
                      layoutId={`photo-card-${photo.id}`}
                      onClick={() => setSelectedPhoto(photo)}
                      className={`w-full bg-white p-2 md:p-3 pt-0 pb-4 md:pb-6 shadow-sm hover:shadow-xl cursor-pointer group flex flex-col items-center transition-all duration-300 hover:scale-[1.03] group-hover:rotate-0 hover:z-20 border border-cream-200 ${getRotationClass(idx)}`}
                    >
                      {/* Selotip / Tape effect in normal document flow to prevent CSS Column positioning bugs */}
                      <div className="w-12 md:w-14 h-4 md:h-5 bg-white/70 backdrop-blur-md shadow-sm border border-black/5 rotate-2 -mt-2 mb-2 z-10" />
                      
                      <div className="relative overflow-hidden w-full aspect-square bg-cream-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <p 
                        className="mt-3 md:mt-4 text-lg md:text-xl text-sage-900/90 text-center px-1"
                        style={{ fontFamily: 'var(--font-caveat)' }}
                      >
                        {photo.title}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Bagian Sudut Photobooth */}
            {photos.filter(p => p.description.includes('#photobooth')).length > 0 && (
              <div className="border-t border-cream-200/60 pt-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-serif text-sage-900">Sudut Photobooth</h2>
                  <p className="text-xs text-sage-900/50 italic font-sans">Kumpulan cetakan panjang penuh cerita</p>
                </div>
                
                {/* Horizontal Scroll Layout for Photobooth strips */}
                <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar items-start px-2">
                  {photos.filter(p => p.description.includes('#photobooth')).map((photo) => (
                    <motion.div
                      key={photo.id}
                      layoutId={`photo-card-${photo.id}`}
                      onClick={() => setSelectedPhoto(photo)}
                      className="shrink-0 bg-white p-2 pb-6 shadow-sm hover:shadow-md cursor-pointer group flex flex-col items-center transition-all duration-300 hover:scale-105 hover:z-10 border border-cream-200 w-40 md:w-56"
                    >
                      <div className="relative overflow-hidden w-full bg-cream-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Romantic Passcode Dialog for Upload Protection */}
      <AnimatePresence>
        {isPasscodeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-cream-50 w-full max-w-sm rounded-3xl p-6 border border-cream-200 shadow-xl relative"
            >
              <button
                onClick={() => setIsPasscodeOpen(false)}
                className="absolute top-4 right-4 p-2 text-sage-900/50 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-3 mb-6">
                <div className="inline-flex p-3 rounded-full bg-rose-50 border border-rose-100 text-rose-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl text-sage-900">Ruang Khusus Kita</h3>
                <p className="text-xs text-sage-900/60 italic font-sans leading-relaxed">
                  Masukkan sandi rahasia untuk membuka kamera &amp; menambah momen kenangan.
                </p>
              </div>

              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Sandi rahasia..."
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300 transition-all text-center text-sage-900 tracking-wider"
                    autoFocus
                    required
                  />
                  {passcodeError && (
                    <p className="text-xs text-rose-500 text-center mt-2 font-medium">
                      {passcodeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !passcode}
                  className="w-full py-3 bg-rose-200 hover:bg-rose-300 disabled:opacity-50 text-rose-950 text-sm font-medium rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    <span>Buka Kunci ✨</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Large Polaroid Modal Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPhoto(null);
            }}
          >
            {/* The giant polaroid frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, rotate: 2 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#fdfcf8] p-5 md:p-7 pb-8 md:pb-12 shadow-2xl border border-cream-200/80 max-w-sm md:max-w-lg w-full relative flex flex-col items-center max-h-[95vh]"
            >
              {/* Tape effect top center */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm -rotate-2 z-20" />

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer shadow-sm focus:outline-none"
                  title="Tutup (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownload(selectedPhoto.imageUrl, selectedPhoto.title || 'kenangan')}
                  className="p-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white backdrop-blur-md transition-colors cursor-pointer shadow-sm focus:outline-none"
                  title="Simpan Foto"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="p-2.5 rounded-full bg-black/40 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer shadow-sm focus:outline-none"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Polaroid Photo */}
              <div className={`w-full overflow-hidden bg-cream-50 border border-cream-200 mt-2 relative shadow-inner ${selectedPhoto.description.includes('#photobooth') ? 'h-auto max-h-[60vh] flex items-center justify-center' : 'h-auto max-h-[65vh] flex items-center justify-center'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className={`w-full ${selectedPhoto.description.includes('#photobooth') ? 'h-full object-contain' : 'max-h-[65vh] object-contain'}`}
                />
              </div>

              {/* Polaroid bottom caption & stories */}
              <div className="w-full text-center mt-6 md:mt-8 space-y-4 overflow-y-auto custom-scrollbar px-2">
                <h2 
                  className="text-4xl md:text-5xl font-bold text-sage-900 leading-none"
                  style={{ fontFamily: 'var(--font-caveat)' }}
                >
                  {selectedPhoto.title}
                </h2>
                
                <p 
                  className="text-xl md:text-2xl text-sage-900/80 leading-relaxed whitespace-pre-line px-2"
                  style={{ fontFamily: 'var(--font-caveat)' }}
                >
                  &ldquo;{selectedPhoto.description.replace('#photobooth', '').trim()}&rdquo;
                </p>
                
                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-sage-900/40 font-sans pt-4 mt-4 border-t border-cream-200 w-full uppercase tracking-widest select-none">
                  <Heart className="h-3 w-3 text-rose-400 fill-rose-100" />
                  <span>{formatDate(selectedPhoto.eventDate)}</span>
                  <Heart className="h-3 w-3 text-rose-400 fill-rose-100" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onSuccess={() => fetchPhotos()} 
      />
    </div>
  );
}
