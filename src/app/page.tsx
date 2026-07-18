'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function OpeningScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = async () => {
    setIsExiting(true);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen API not supported or blocked:', err);
    }

    setTimeout(() => {
      router.push('/home');
    }, 400);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.main
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-50 px-6 text-center select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Background shapes */}
          <div className="absolute inset-0 -z-10 overflow-hidden opacity-40">
            <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-rose-100 blur-[80px]" />
            <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-sage-100 blur-[80px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="max-w-md space-y-8"
          >
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="rounded-full bg-rose-50 p-4 shadow-xs"
              >
                <Heart className="h-8 w-8 text-rose-300 fill-rose-100" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-serif text-sage-900 leading-relaxed font-light">
                Selamat datang di tempat kecil yang aku buat khusus untukmu.
              </h1>
              <p className="text-sm md:text-base text-sage-900/60 font-sans italic">
                "Beberapa hal lebih baik dijelajahi daripada dijelaskan."
              </p>
            </div>

            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 px-8 py-3 bg-rose-200 hover:bg-rose-300 text-rose-900 font-medium rounded-full shadow-xs hover:shadow-md transition-all duration-300 tracking-wide font-sans text-sm md:text-base cursor-pointer"
            >
              Jelajahi
            </motion.button>
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
