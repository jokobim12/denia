'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, Gift } from 'lucide-react';

interface Wish {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    async function fetchWishes() {
      try {
        const res = await fetch('/api/wishes');
        if (res.ok) {
          const data = await res.json();
          setWishes(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishes();
  }, []);

  const handleDraw = () => {
    if (wishes.length === 0 || isDrawing) return;

    setIsDrawing(true);
    setSelectedWish(null);

    // Mainkan efek suara / jeda animasi menggambar selama 1.2 detik
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * wishes.length);
      setSelectedWish(wishes[randomIndex]);
      setIsDrawing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative">
        
        {/* Decorative elements */}
        <div className="absolute top-12 left-10 opacity-30">
          <Sparkles className="h-6 w-6 text-rose-300 animate-pulse" />
        </div>
        <div className="absolute bottom-16 right-12 opacity-30">
          <Sparkles className="h-5 w-5 text-sage-300 animate-pulse" />
        </div>

        {/* Header */}
        <div className="text-center space-y-3 mb-10 z-10 select-none">
          <span className="text-rose-400 font-serif text-lg">Comfort Jar</span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-sage-900">Toples Catatan</h1>
          <p className="text-xs md:text-sm text-sage-900/50 max-w-md mx-auto italic font-sans px-4">
            "Pesan-pesan singkat di dalam toples."
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-44 w-32 bg-white/50 border border-cream-200/50 rounded-3xl animate-pulse" />
            <div className="h-8 bg-cream-200 rounded-full w-24 animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full max-w-md relative z-10">
            
            {/* The Glass Jar Visual */}
            <div className="relative h-64 flex items-end justify-center w-full">
              
              {/* Glowing Aura inside jar when drawing */}
              <AnimatePresence>
                {isDrawing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-14 h-32 w-32 rounded-full bg-rose-200/40 blur-xl z-0"
                  />
                )}
              </AnimatePresence>

              {/* Glass Jar Body */}
              <motion.div
                animate={isDrawing ? {
                  scale: [1, 1.05, 1],
                  rotate: [0, -3, 3, -3, 3, 0],
                  y: [0, -4, 0, -4, 0]
                } : {
                  opacity: 1, scale: 1, y: [0, -5, 0]
                }}
                transition={isDrawing ? {
                  duration: 0.8,
                  ease: 'easeInOut',
                  repeat: 1
                } : {
                  duration: 6,
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
                className="w-56 h-72 md:w-64 md:h-80 relative z-10 flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/isolated-jar.png"
                  alt="Comfort Jar"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </motion.div>
            </div>

            {/* Draw Action Button */}
            <div className="mt-8 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <button
                onClick={handleDraw}
                disabled={wishes.length === 0 || isDrawing}
                className="relative px-8 py-3.5 bg-rose-200/90 hover:bg-rose-300 disabled:opacity-50 text-rose-900 font-sans font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer focus:outline-none select-none text-sm tracking-wide flex items-center justify-center gap-2"
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-rose-700" />
                    <span>Mengocok Toples...</span>
                  </>
                ) : (
                  <>
                    <span>Ambil Catatan Harian</span>
                    <Heart className="h-4 w-4 text-rose-700" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Unfolding Drawn Note Overlay Modal */}
      <AnimatePresence>
        {selectedWish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/80 backdrop-blur-sm"
          >
            {/* The Unfolded Paper Note Card */}
            <motion.div
              initial={{ scale: 0.85, y: 100, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 2 }}
              exit={{ scale: 0.85, y: 100, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-[#fdfcf8] border border-cream-200/80 rounded-sm p-6 md:p-8 max-w-sm w-full shadow-2xl relative flex flex-col justify-between"
            >
              {/* Selotip / Tape effect */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/50 backdrop-blur-md shadow-sm border border-black/5 rotate-1 z-20" />

              {/* Paper line background decor (removed rigid lines, kept plain cream) */}
              <div className="absolute inset-0 z-0 pointer-events-none rounded-sm" />

              {/* Close card button */}
              <button
                onClick={() => setSelectedWish(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-cream-100/50 hover:bg-rose-100 hover:text-rose-900 text-sage-900/60 transition-colors cursor-pointer focus:outline-none z-20"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Scrollable Content Area */}
              <div className="space-y-4 z-10 mt-4 text-center overflow-y-auto overflow-x-hidden max-h-[50vh] px-2 pb-4">
                {selectedWish.title && (
                  <h3 
                    className="text-3xl md:text-4xl font-bold text-sage-900 leading-none"
                    style={{ fontFamily: 'var(--font-caveat)' }}
                  >
                    {selectedWish.title}
                  </h3>
                )}

                {selectedWish.title && <div className="h-[1px] w-12 bg-rose-200/60 mx-auto my-3" />}

                {selectedWish.imageUrl && (
                  <div className="relative mx-auto mt-2 overflow-hidden bg-cream-50 p-2 pb-6 shadow-sm border border-cream-200 rotate-1 hover:rotate-0 transition-transform max-w-[200px]">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/60 backdrop-blur-md shadow-sm border border-white/20 rotate-3 z-20" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedWish.imageUrl}
                      alt={selectedWish.title}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                )}

                <p 
                  className="text-xl md:text-2xl text-sage-900/90 leading-snug whitespace-pre-wrap select-text mt-4 px-2"
                  style={{ fontFamily: 'var(--font-caveat)' }}
                >
                  {selectedWish.description}
                </p>
              </div>

              {/* Heart icon footer */}
              <div className="mt-8 pt-4 flex flex-col items-center gap-3 text-[10px] text-sage-900/40 font-sans z-10">
                <button
                  onClick={() => setSelectedWish(null)}
                  className="px-6 py-2 bg-sage-100 hover:bg-rose-100 text-sage-900 hover:text-rose-900 font-medium rounded-full shadow-xs transition-colors focus:outline-none cursor-pointer"
                >
                  Kembalikan ke Toples
                </button>
                <div className="flex items-center gap-1 italic uppercase tracking-widest text-[9px] mt-2">
                  <Heart className="h-3 w-3 text-rose-300 fill-rose-100" />
                  <span>Simpan pesan ini dalam hati</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
