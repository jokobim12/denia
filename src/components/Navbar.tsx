'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      router.push('/secret');
    }
  };

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Galeri', path: '/gallery' },
    { name: 'Surat', path: '/letters' },
    { name: 'Catatan', path: '/wishes' },
    { name: 'Musik', path: '/music' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-sage-900 hover:text-rose-600 transition-colors group cursor-pointer focus:outline-none"
            title="Klik 5 kali untuk kejutan rahasia"
          >
            <div className="p-1.5 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
              <Heart className="h-4 w-4 text-rose-400 fill-rose-100 group-hover:fill-rose-200 transition-colors" />
            </div>
            <span className="font-serif font-medium tracking-wide">Denia</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative font-sans text-xs md:text-sm font-medium tracking-wide transition-colors duration-200 py-1 ${
                    isActive ? 'text-rose-900' : 'text-sage-900/60 hover:text-sage-900'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-200"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex md:hidden p-2 text-sage-900 hover:text-rose-400 transition-colors cursor-pointer focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu (Moved outside header for Safari fixed-position fix) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-sage-950 md:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-1/2 bg-white border-l border-cream-200 p-6 md:hidden flex flex-col space-y-6"
            >
              {/* Close Button Header */}
              <div className="flex justify-end items-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-sage-900 hover:text-rose-600 transition-colors cursor-pointer focus:outline-none bg-cream-50 rounded-full"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Links Stack */}
              <nav className="flex flex-col space-y-3 mt-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-2xl font-sans text-sm font-medium tracking-wide transition-colors duration-200 ${
                        isActive
                          ? 'bg-rose-50 text-rose-900 font-semibold shadow-xs border border-rose-100'
                          : 'text-sage-900/70 hover:text-sage-900 hover:bg-cream-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Decorative Footer */}
              <div className="mt-auto text-center text-[10px] text-sage-900/30 font-sans italic border-t border-cream-100 pt-4 flex items-center justify-center gap-1.5 select-none">
                <Heart className="h-3 w-3 text-rose-300 fill-rose-100" />
                <span>Ruang spesial untuk Denia</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
