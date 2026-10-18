'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Image as ImageIcon, Mail, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const visitorName = process.env.NEXT_PUBLIC_VISITOR_NAME || 'Denia';
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  // Patokan awal hitungan jadian: 31 Juli 2026
  const anniversaryDateStr = process.env.NEXT_PUBLIC_ANNIVERSARY_DATE || '2026-07-31T00:00:00';

  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const startDate = new Date(anniversaryDateStr).getTime();

    const updateCounter = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, now - startDate);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDateStr]);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      router.push('/secret');
    }
  };

  const menuItems = [
    { name: 'Galeri', path: '/gallery', desc: 'Koleksi foto & pap', icon: ImageIcon },
    { name: 'Surat', path: '/letters', desc: 'Surat kecil pelipur hari', icon: Mail },
    { name: 'Catatan', path: '/wishes', desc: 'Toples pesan & harapan', icon: FileText },
    { name: 'Impian', path: '/bucket-list', desc: 'Daftar impian berdua', icon: CheckCircle2 },
    { name: 'Jejak', path: '/map', desc: 'Peta jejak tempat kita', icon: MapPin },
  ];

  return (
    <main className="relative min-h-screen bg-cream-50 text-sage-900 select-none flex flex-col justify-between overflow-x-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-rose-100/40 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-sage-100/40 blur-[100px]" />
      </div>

      {/* Center Section: Greeting & Love Days Counter (Tanpa Navbar Atas) */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-8 max-w-3xl mx-auto w-full text-center">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-2 mb-8"
        >
          <button
            onClick={handleSecretClick}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-cream-200 text-[10px] sm:text-[11px] font-sans tracking-widest text-sage-900/60 hover:text-rose-500 uppercase transition-colors cursor-pointer"
            title="Klik 5 kali untuk kejutan rahasia"
          >
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-100" />
            <span>Digital Scrapbook Denia</span>
          </button>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-sage-900 font-light tracking-tight select-text pt-2">
            Halo, {visitorName}
          </h1>
          
          <p 
            className="text-base sm:text-lg text-sage-900/70 select-text"
            style={{ fontFamily: 'var(--font-caveat)' }}
          >
            &ldquo;Ruang kecil untuk menyimpan setiap cerita manis kita.&rdquo;
          </p>
        </motion.div>

        {/* Clean Love Days Counter Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full max-w-xl bg-white/80 border border-cream-200/90 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-sans text-sage-900/60 mb-4">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-200 animate-pulse" />
            <span className="tracking-wide">Bersama Sejak 31 Juli 2026</span>
          </div>

          {/* 4 Clean Counter Boxes */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3.5 max-w-md mx-auto">
            <div className="bg-cream-50/70 border border-cream-200/60 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl text-sage-900 font-semibold tracking-tight">
                {timeTogether.days}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans">
                Hari
              </span>
            </div>

            <div className="bg-cream-50/70 border border-cream-200/60 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl text-sage-900 font-semibold tracking-tight">
                {String(timeTogether.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans">
                Jam
              </span>
            </div>

            <div className="bg-cream-50/70 border border-cream-200/60 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl text-sage-900 font-semibold tracking-tight">
                {String(timeTogether.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans">
                Menit
              </span>
            </div>

            <div className="bg-cream-50/70 border border-cream-200/60 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl text-rose-500 font-semibold tracking-tight">
                {String(timeTogether.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans">
                Detik
              </span>
            </div>
          </div>

          <p 
            className="mt-4 text-xs sm:text-sm text-sage-900/70 italic"
            style={{ fontFamily: 'var(--font-caveat)' }}
          >
            Dan setiap detiknya selalu terasa berharga bila bersamamu.
          </p>
        </motion.div>
      </div>

      {/* Navigation Cards Menu (Clean & Compact) */}
      <section className="px-6 max-w-4xl mx-auto w-full mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                className="group flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-cream-200/70 hover:border-rose-200 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-cream-50 group-hover:bg-rose-50 text-sage-900/70 group-hover:text-rose-500 transition-colors mb-2">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-serif text-sm text-sage-900 font-medium group-hover:text-rose-950 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] text-sage-900/50 mt-0.5 line-clamp-1 font-sans">
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Clean Bottom Footer */}
      <footer className="text-center text-[11px] text-sage-900/40 font-sans py-4 border-t border-cream-200/50 max-w-xl mx-auto px-6 w-full">
        <p>Dibuat dengan ketulusan hati untuk Denia ✨</p>
      </footer>
    </main>
  );
}
