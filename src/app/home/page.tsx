'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const visitorName = process.env.NEXT_PUBLIC_VISITOR_NAME || 'Denia';
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      router.push('/secret');
    }
  };

  const menuItems = [
    { name: 'Galeri', path: '/gallery', desc: 'Galeri kenangan' },
    { name: 'Surat', path: '/letters', desc: 'Surat kecil untuk dibaca' },
    { name: 'Catatan', path: '/wishes', desc: 'Toples pesan hangat' },
    { name: 'Musik', path: '/music', desc: 'Melodi yang menemani' },
  ];

  return (
    <main className="relative min-h-screen flex flex-col justify-between bg-cream-50 p-6 md:p-12 overflow-hidden select-none">
      {/* Background soft shapes and glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] h-[60%] w-[60%] rounded-full bg-rose-100/40 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[10%] h-[60%] w-[60%] rounded-full bg-sage-100/40 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Top Header */}
      <div className="flex justify-between items-center w-full z-10">
        <button
          onClick={handleSecretClick}
          className="flex items-center gap-2 text-sage-900/60 hover:text-rose-400 transition-colors group cursor-pointer focus:outline-none"
          title="Klik 5 kali untuk kejutan rahasia"
        >
          <Heart className="h-5 w-5 text-rose-300 fill-rose-100 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-serif font-medium tracking-wide text-xs md:text-sm">Denia</span>
        </button>
        <span className="text-sage-900/30 font-sans text-xs md:text-sm tracking-widest uppercase">
          Digital Scrapbook
        </span>
      </div>

      {/* Center - Immersive Name */}
      <div className="flex flex-col items-center justify-center flex-grow py-12 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="space-y-4"
        >
          <p className="text-xs md:text-sm font-sans tracking-[0.25em] text-sage-900/40 uppercase">
            Halo,
          </p>
          <h1 className="text-6xl md:text-8xl font-serif text-sage-900 tracking-wide font-light select-text">
            {visitorName}
          </h1>
          <div className="h-[1px] w-24 bg-rose-200/60 mx-auto mt-6" />
          <p className="text-xs md:text-sm font-sans italic text-sage-900/50 mt-4 max-w-sm mx-auto leading-relaxed px-4">
            Website untuk menyimpan kenangan.
          </p>
        </motion.div>
      </div>

      {/* Bottom Nav - Minimalist */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="w-full max-w-xl mx-auto z-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 border-t border-cream-200/50 pt-8"
      >
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center p-3 rounded-2xl bg-white/40 hover:bg-white/85 border border-cream-200/30 hover:border-rose-100 transition-all duration-300 shadow-xs hover:shadow-md text-center group cursor-pointer"
          >
            <span className="font-serif text-sm md:text-base text-sage-900 group-hover:text-rose-900 transition-colors">
              {item.name}
            </span>
            <span className="text-[10px] md:text-xs text-sage-900/40 mt-1 hidden md:inline">
              {item.desc}
            </span>
          </Link>
        ))}
      </motion.div>
    </main>
  );
}
