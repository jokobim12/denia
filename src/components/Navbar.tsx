'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Home, Camera, Mail, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      router.push('/secret');
    }
  };

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Galeri', path: '/gallery', icon: Camera },
    { name: 'Surat', path: '/letters', icon: Mail },
    { name: 'Catatan', path: '/wishes', icon: FileText },
    { name: 'Impian', path: '/bucket-list', icon: CheckCircle2 },
    { name: 'Jejak', path: '/map', icon: MapPin },
  ];

  return (
    <>
      {/* Top Header Navbar (Desktop Full Nav & Mobile Minimal Brand Header) */}
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-200/50">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-sage-900 hover:text-rose-500 transition-colors group cursor-pointer focus:outline-none"
            title="Klik 5 kali untuk kejutan rahasia"
          >
            <div className="p-1.5 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
              <Heart className="h-4 w-4 text-rose-400 fill-rose-100 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-serif font-medium tracking-wide text-sm md:text-base">Denia</span>
          </button>

          {/* Desktop Navigation Links (Layar Laptop / PC) */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  prefetch={true}
                  className={`relative font-sans text-xs md:text-sm font-medium tracking-wide transition-colors duration-200 py-1 ${
                    isActive ? 'text-rose-900 font-semibold' : 'text-sage-900/60 hover:text-sage-900'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-300 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile App-Style Bottom Navigation Bar (Layar HP / Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1001] md:hidden bg-white/95 backdrop-blur-xl border-t border-cream-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-1 py-1.5 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? 'text-rose-600 font-medium'
                    : 'text-sage-900/40 hover:text-sage-900'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-rose-50 text-rose-500 scale-105' : 'text-sage-900/45'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-[10px] font-sans tracking-tight mt-0.5 ${
                    isActive ? 'text-rose-600 font-semibold' : 'text-sage-900/50'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveDot"
                    className="w-1 h-1 bg-rose-400 rounded-full mt-0.5"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer bawah di mobile agar konten tidak tertutup bottom navbar */}
      <div className="h-14 md:hidden pointer-events-none" aria-hidden="true" />
    </>
  );
}
