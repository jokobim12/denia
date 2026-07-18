'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

export default function SecretPage() {
  const [growthStage, setGrowthStage] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const handleWatering = () => {
    if (growthStage < 4) {
      setGrowthStage((prev) => prev + 1);
      if (growthStage === 3) {
        // Ketika mencapai mekar, tampilkan surat cinta/persahabatan
        setTimeout(() => setShowCard(true), 800);
      }
    }
  };

  const getGrowthText = () => {
    switch (growthStage) {
      case 0:
        return 'Sebuah benih kecil tertanam di sini. Butuh sedikit kehangatan untuk tumbuh.';
      case 1:
        return 'Lihat! Tunas kecil mulai muncul. Terus beri dia perhatian.';
      case 2:
        return 'Batangnya mulai tumbuh tinggi dan kuat.';
      case 3:
        return 'Kuncup bunga telah terbentuk. Satu siraman lagi untuk mekar!';
      case 4:
      default:
        return 'Bunga persahabatan telah mekar dengan indah!';
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative">
        {/* Decorative sparkles */}
        <div className="absolute top-12 left-10 opacity-30">
          <Sparkles className="h-6 w-6 text-rose-300 animate-pulse" />
        </div>
        <div className="absolute bottom-16 right-12 opacity-30">
          <Sparkles className="h-5 w-5 text-sage-300 animate-pulse" />
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-12 z-10">
          
          {/* Left Column: Interactive Grow Area */}
          <div className="flex flex-col items-center space-y-6 md:w-1/2">
            <div className="h-64 flex items-end justify-center w-full relative">
              {/* Plant Pot */}
              <div className="w-32 h-14 bg-cream-300 border-2 border-cream-300 rounded-b-2xl relative shadow-xs">
                <div className="absolute top-0 left-0 right-0 h-2 bg-cream-300 border-b border-cream-300/40 rounded-t-xs" />
                <div className="absolute inset-x-2 bottom-1 h-3 bg-sage-900/10 rounded-full blur-xs" />
              </div>

              {/* Sprout / Flower growth animation using SVG */}
              <div className="absolute bottom-12 flex flex-col items-center">
                {growthStage >= 1 && (
                  <motion.svg
                    width="120"
                    height="180"
                    viewBox="0 0 100 150"
                    className="origin-bottom"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  >
                    {/* Stem */}
                    <motion.path
                      d="M50,150 Q48,100 50,60"
                      fill="none"
                      stroke="#A8C3A0"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: growthStage >= 2 ? 1 : 0.4 }}
                      transition={{ duration: 0.8 }}
                    />

                    {/* Left Leaf */}
                    {growthStage >= 1 && (
                      <motion.path
                        d="M48,110 C30,105 25,90 40,85 C45,83 48,95 48,110 Z"
                        fill="#A8C3A0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="origin-bottom-right"
                        style={{ transformOrigin: '48px 110px' }}
                        transition={{ delay: 0.2 }}
                      />
                    )}

                    {/* Right Leaf */}
                    {growthStage >= 2 && (
                      <motion.path
                        d="M52,90 C70,85 75,70 60,65 C55,63 52,75 52,90 Z"
                        fill="#A8C3A0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="origin-bottom-left"
                        style={{ transformOrigin: '52px 90px' }}
                        transition={{ delay: 0.3 }}
                      />
                    )}

                    {/* Flower Bud */}
                    {growthStage === 3 && (
                      <motion.circle
                        cx="50"
                        cy="60"
                        r="12"
                        fill="#FFD1DC"
                        stroke="#FFA8BA"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}

                    {/* Blossom Flower */}
                    {growthStage >= 4 && (
                      <motion.g
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 80, damping: 10 }}
                        className="origin-center"
                        style={{ transformOrigin: '50px 60px' }}
                      >
                        {/* Petals */}
                        <circle cx="50" cy="42" r="14" fill="#FFE4E8" />
                        <circle cx="50" cy="78" r="14" fill="#FFE4E8" />
                        <circle cx="32" cy="60" r="14" fill="#FFE4E8" />
                        <circle cx="68" cy="60" r="14" fill="#FFE4E8" />
                        
                        <circle cx="38" cy="48" r="12" fill="#FFD1DC" />
                        <circle cx="62" cy="48" r="12" fill="#FFD1DC" />
                        <circle cx="38" cy="72" r="12" fill="#FFD1DC" />
                        <circle cx="62" cy="72" r="12" fill="#FFD1DC" />
                        
                        {/* Flower Center */}
                        <circle cx="50" cy="60" r="10" fill="#F9F5EC" stroke="#FFA8BA" strokeWidth="2" />
                        <circle cx="50" cy="60" r="6" fill="#FFA8BA" />
                      </motion.g>
                    )}
                  </motion.svg>
                )}
              </div>
            </div>

            {/* Growth explanation */}
            <div className="text-center max-w-xs space-y-4">
              <p className="text-xs md:text-sm text-sage-900/60 font-sans italic leading-relaxed min-h-[40px]">
                {getGrowthText()}
              </p>
              
              {growthStage < 4 && (
                <button
                  onClick={handleWatering}
                  className="px-6 py-2.5 bg-rose-200 hover:bg-rose-300 text-rose-900 text-xs md:text-sm font-sans font-medium rounded-full shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer focus:outline-none"
                >
                  Siram Benih
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Special Letter card appears once blossomed */}
          <div className="md:w-1/2 w-full flex justify-center">
            <AnimatePresence>
              {showCard && (
                <motion.div
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="bg-white/80 border border-rose-100 rounded-3xl p-6 md:p-8 shadow-lg max-w-sm relative"
                >
                  {/* Decorative icon */}
                  <div className="absolute -top-4 -left-4 bg-rose-100 p-2.5 rounded-full border border-white shadow-sm">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-200" />
                  </div>

                  <h3 className="font-serif text-lg md:text-xl font-bold text-sage-900 mb-4 pl-4">
                    Kejutan Rahasia Untukmu
                  </h3>
                  
                  <div className="h-[1px] w-full bg-rose-100/60 mb-4" />

                  <div className="space-y-4 font-serif text-sm text-sage-900/80 leading-relaxed italic select-text">
                    <p>
                      "Terima kasih sudah meluangkan waktu menjelajahi setiap sudut tempat ini."
                    </p>
                    <p>
                      "Ruang digital sederhana ini dibuat khusus sebagai tempat penyimpanan setiap cerita, canda tawa, dan kenangan."
                    </p>
                    <p>
                      "Semoga hari-harimu selalu menyenangkan. Ingatlah bahwa ada tempat kecil di sini yang selalu terbuka kapan pun kamu ingin merenung atau tersenyum kembali."
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between items-center text-[10px] text-sage-900/40 font-sans border-t border-cream-200/50 pt-3">
                    <span>With ketulusan,</span>
                    <span>100% Mekar ✨</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
