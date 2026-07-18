'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Mail, MailOpen, X, Heart } from 'lucide-react';

interface Letter {
  id: string;
  title: string;
  content: string;
  category: string;
}

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLetters() {
      try {
        const res = await fetch('/api/letters');
        if (res.ok) {
          const data = await res.json();
          setLetters(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLetters();
  }, []);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'sad':
        return {
          bg: 'bg-indigo-50/70 border-indigo-100 hover:border-indigo-300',
          text: 'text-indigo-900',
          iconColor: 'text-indigo-400',
          accentBg: 'bg-indigo-100/50',
          btn: 'Buka saat sedih',
        };
      case 'tired':
        return {
          bg: 'bg-emerald-50/70 border-emerald-100 hover:border-emerald-300',
          text: 'text-emerald-900',
          iconColor: 'text-emerald-400',
          accentBg: 'bg-emerald-100/50',
          btn: 'Buka saat lelah',
        };
      case 'happy':
        return {
          bg: 'bg-rose-50/70 border-rose-100 hover:border-rose-300',
          text: 'text-rose-900',
          iconColor: 'text-rose-400',
          accentBg: 'bg-rose-100/50',
          btn: 'Buka saat bahagia',
        };
      case 'cheer':
      default:
        return {
          bg: 'bg-amber-50/70 border-amber-100 hover:border-amber-300',
          text: 'text-amber-900',
          iconColor: 'text-amber-400',
          accentBg: 'bg-amber-100/50',
          btn: 'Buka saat butuh semangat',
        };
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-rose-400 font-serif text-lg">Heartfelt Words</span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-sage-900">Surat Digital</h1>
          <p className="text-xs md:text-sm text-sage-900/50 max-w-md mx-auto italic font-sans">
            "Kumpulan surat yang bisa kamu buka sesuai kondisimu saat ini."
          </p>
        </div>

        {/* Envelope list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-44 bg-white/50 border border-cream-200/50 rounded-3xl p-6 animate-pulse flex flex-col justify-between">
                <div className="h-6 bg-cream-100 rounded-full w-2/3" />
                <div className="h-4 bg-cream-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-20 bg-white/20 rounded-3xl border border-dashed border-cream-300">
            <Mail className="h-10 w-10 text-rose-200 mx-auto mb-4" />
            <p className="text-sage-900/60 font-serif">Belum ada surat digital yang ditulis. Tambahkan lewat halaman admin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {letters.map((letter) => {
              const styles = getCategoryStyles(letter.category);
              return (
                <motion.div
                  key={letter.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveLetter(letter)}
                  className={`relative rounded-md border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center min-h-[220px] group cursor-pointer overflow-hidden ${styles.bg}`}
                >
                  {/* Flap Amplop */}
                  <div 
                    className="absolute top-0 left-0 w-full h-[60%] bg-black/5 border-b border-black/10 z-0 drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-2"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  />
                  
                  {/* Segel Lilin (Wax Seal) */}
                  <div className={`absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-white/80 z-10 ${styles.accentBg} transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-3`}>
                    <Heart className={`h-4 w-4 ${styles.iconColor} fill-current`} />
                  </div>

                  {/* Perangko (Stamp) */}
                  <div className="absolute top-3 right-4 w-9 h-11 border-[1.5px] border-dashed border-black/20 flex items-center justify-center bg-white/40 rotate-6 opacity-70 transition-transform duration-500 group-hover:rotate-12">
                    <Mail className={`h-4 w-4 ${styles.iconColor} opacity-50`} />
                  </div>

                  {/* Konten Text */}
                  <div className="z-20 mt-16 text-center px-4 flex flex-col items-center transition-transform duration-500 group-hover:translate-y-2">
                    <h3 
                      className={`text-2xl md:text-3xl font-medium mb-3 tracking-wide ${styles.text}`} 
                      style={{ fontFamily: 'var(--font-caveat)' }}
                    >
                      {letter.title}
                    </h3>
                    <span className={`inline-block text-[9px] md:text-[10px] font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm border shadow-xs bg-white/80 ${styles.text}`}>
                      {styles.btn}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Opening Envelope / Letter Modal */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/60 backdrop-blur-xs"
          >
            {/* Main Letter Board */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-cream-100 rounded-lg max-w-xl w-full p-6 md:p-8 shadow-2xl border border-cream-200 flex flex-col relative"
            >
              {/* Close button */}
              <button
                onClick={() => setActiveLetter(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-cream-50 hover:bg-cream-200/50 text-sage-900 hover:text-rose-600 transition-colors cursor-pointer focus:outline-none z-50 shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Physical Letter Paper Effect */}
              <div 
                className="flex flex-col flex-grow bg-[#fdfcf8] border border-cream-200 rounded-sm p-6 md:p-8 shadow-inner overflow-y-auto max-h-[60vh] custom-scrollbar"
              >
                {/* Header (No lines, like the top margin of a real notebook) */}
                <div className="flex items-center gap-2 text-rose-300 mb-6 w-max pr-2 rounded">
                  <MailOpen className="h-5 w-5 fill-rose-50" />
                  <span className="text-[10px] md:text-xs tracking-widest uppercase font-sans font-medium text-sage-900/40">
                    Sebuah Pesan
                  </span>
                </div>

                <h2 
                  className="text-3xl md:text-4xl text-sage-900 pb-4 mb-4 border-b-2 border-cream-200/80"
                  style={{ fontFamily: 'var(--font-caveat)' }}
                >
                  {activeLetter.title}
                </h2>

                {/* Text Body with Lined Paper Effect */}
                <div 
                  className="flex-grow text-2xl md:text-3xl text-sage-900/90 whitespace-pre-line select-text"
                  style={{ 
                    fontFamily: 'var(--font-caveat)', 
                    lineHeight: '2rem',
                    backgroundImage: 'linear-gradient(#e2d9c8 1px, transparent 1px)',
                    backgroundSize: '100% 2rem',
                    backgroundAttachment: 'local',
                    backgroundPosition: '0 1.7rem', // Shifted down so text sits fully above the line
                    paddingBottom: '1rem'
                  }}
                >
                  {activeLetter.content}
                </div>

                <div className="flex items-center justify-center mt-8 border-t border-cream-200/80 pt-4 bg-[#fdfcf8]">
                  <div className="flex items-center gap-1.5 text-xs text-sage-900/40 font-sans italic">
                    <Heart className="h-3.5 w-3.5 text-rose-300 fill-rose-100" />
                    <span>Dibuat khusus untuk Denia</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
