'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, PartyPopper, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Celebration100DaysProps {
  isOpen: boolean;
  onClose: () => void;
  visitorName?: string;
  isPreview?: boolean;
}

export const fire100DaysConfetti = () => {
  if (typeof window === 'undefined') return;

  // Multi-stage celebratory confetti
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#FF7597', '#FFAAA6', '#FFD3B6', '#D5AAFF', '#B5EAD7', '#FFDFBA'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export default function Celebration100DaysModal({
  isOpen,
  onClose,
  visitorName = 'Denia',
  isPreview = false,
}: Celebration100DaysProps) {
  const [hugCount, setHugCount] = useState(0);
  const [showHeartBubble, setShowHeartBubble] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti when modal opens
      const timer = setTimeout(() => {
        fire100DaysConfetti();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendHug = () => {
    setHugCount((prev) => prev + 1);
    setShowHeartBubble(true);

    // Fire smaller heart-themed confetti
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#FDA4AF', '#F43F5E', '#FB7185', '#FFF1F2'],
    });

    setTimeout(() => setShowHeartBubble(false), 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-sm overflow-y-auto">
          {/* Floating celebratory particles in backdrop */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: '105vh',
                  x: `${(i * 8.5) + (i % 3 * 3)}vw`,
                  opacity: 0,
                  scale: 0.6 + (i % 4) * 0.2,
                }}
                animate={{
                  y: '-10vh',
                  opacity: [0, 0.7, 0.7, 0],
                  rotate: [0, (i % 2 === 0 ? 30 : -30)],
                }}
                transition={{
                  duration: 8 + (i % 5) * 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'linear',
                }}
                className="absolute text-rose-300/40"
              >
                <Heart className="h-6 w-6 fill-current" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#FFFDF9] border border-rose-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
          >
            {/* Top decorative ribbon glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-200 via-rose-400 to-amber-200" />

            {/* Subtle background stamps / decorations */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-sage-900/40 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none z-10"
              title="Tutup surat"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-4 pt-2">
              {/* Badge Milestone */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium tracking-wide uppercase shadow-xs">
                <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>100 Days Milestone</span>
                <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              {/* Title */}
              <h2 className="font-serif text-3xl sm:text-4xl text-sage-900 font-normal leading-tight">
                Selamat 100 Hari, <span className="text-rose-500">{visitorName}</span>! 💕
              </h2>

              <p
                className="text-lg text-rose-500/80"
                style={{ fontFamily: 'var(--font-caveat)' }}
              >
                &ldquo;Dan setiap detiknya selalu terasa berharga bila bersamamu.&rdquo;
              </p>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="h-[1px] w-12 bg-rose-200/80" />
                <Heart className="h-4 w-4 text-rose-400 fill-rose-300" />
                <div className="h-[1px] w-12 bg-rose-200/80" />
              </div>

              {/* The Letter Body */}
              <div className="bg-cream-50/80 border border-cream-200/80 rounded-2xl p-5 text-left text-sm sm:text-base text-sage-900/80 space-y-3 leading-relaxed select-text shadow-2xs font-sans">
                <p>
                  Nggak terasa ya, hitungan hari kita sudah menyentuh angka <strong>100</strong>. Rasanya baru kemarin kita mulai saling cerita dan berbagi tawa kecil setiap hari.
                </p>
                <p>
                  Terima kasih sudah hadir di hidupku. Terima kasih untuk setiap obrolan manis, perhatian tulus, dan senyuman yang selalu berhasil bikin hari-hariku jadi jauh lebih cerah.
                </p>
                <p>
                  Semoga di 100 hari berikutnya, dan hari-hari panjang setelahnya, kita bisa terus saling menggenggam, saling menguatkan, dan merajut lebih banyak kenangan indah berdua.
                </p>
                <p className="pt-1 text-right text-rose-600 font-medium" style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }}>
                  Selalu bersamamu, dengan sepenuh hati ✨
                </p>
              </div>

              {/* Interactive Celebration Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={fire100DaysConfetti}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <PartyPopper className="h-4 w-4" />
                  <span>Rayakan Lagi (Confetti! 🎉)</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSendHug}
                  className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-rose-300 text-rose-500" />
                  <span>Kirim Peluk & Sayang {hugCount > 0 ? `(${hugCount})` : ''}</span>

                  <AnimatePresence>
                    {showHeartBubble && (
                      <motion.span
                        initial={{ opacity: 0, y: 0, scale: 0.8 }}
                        animate={{ opacity: 1, y: -25, scale: 1.1 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs pointer-events-none"
                      >
                        +1 Sayang 💕
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Preview Notice for Joko if in testing mode */}
              {isPreview && (
                <div className="mt-3 p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                  ⚡ <strong>Mode Testing:</strong> Ini tampilan preview 100 hari. Begitu countdown asli mencapai 100 hari nanti, tampilan ini akan otomatis aktif sendiri untuk Denia!
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

