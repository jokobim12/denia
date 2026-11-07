'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Image as ImageIcon, Mail, FileText, CheckCircle2, MapPin, PartyPopper } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Celebration100DaysModal, { fire100DaysConfetti } from '@/components/Celebration100Days';

export default function HomePage() {
  const visitorName = process.env.NEXT_PUBLIC_VISITOR_NAME || 'Denia';
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  // Testing & Celebration state
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewTapCount, setPreviewTapCount] = useState(0);
  const [showPreviewToast, setShowPreviewToast] = useState<string | null>(null);

  // Patokan awal hitungan jadian: 31 Juli 2026
  const anniversaryDateStr = process.env.NEXT_PUBLIC_ANNIVERSARY_DATE || '2026-07-31T00:00:00';

  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Check URL parameter: ?preview100=true or ?preview=100 for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview100') === 'true' || params.get('preview') === '100') {
        setIsPreviewMode(true);
      }
    }
  }, []);

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

  const is100Days = timeTogether.days >= 100 || isPreviewMode;
  const displayDays = isPreviewMode && timeTogether.days < 100 ? 100 : timeTogether.days;

  // Auto-open celebration modal when 100 days milestone is reached (once per session)
  useEffect(() => {
    if (is100Days && typeof window !== 'undefined') {
      const hasSeenKey = isPreviewMode ? 'preview_100_seen' : `seen_100_days_${visitorName}`;
      const hasSeen = sessionStorage.getItem(hasSeenKey);
      if (!hasSeen) {
        setIsCelebrationOpen(true);
        sessionStorage.setItem(hasSeenKey, 'true');
      }
    }
  }, [is100Days, isPreviewMode, visitorName]);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      router.push('/secret');
    }
  };

  // Secret shortcut: Tap 3 times on "Bersama Sejak 31 Juli 2026" to toggle 100 days preview
  const handleAnniversaryTap = () => {
    const newCount = previewTapCount + 1;
    setPreviewTapCount(newCount);
    if (newCount >= 3) {
      setPreviewTapCount(0);
      const nextState = !isPreviewMode;
      setIsPreviewMode(nextState);
      if (nextState) {
        setIsCelebrationOpen(true);
        setShowPreviewToast('✨ Mode Preview 100 Hari Dinyalakan!');
      } else {
        setShowPreviewToast('Mode Normal');
      }
      setTimeout(() => setShowPreviewToast(null), 2500);
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
      {/* Preview Mode Alert Banner (Only for testing) */}
      {isPreviewMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 text-white text-xs font-medium shadow-lg animate-bounce">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Mode Preview 100 Hari Aktif</span>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="ml-2 underline text-[11px] hover:text-rose-100 cursor-pointer"
          >
            Tutup Preview
          </button>
        </div>
      )}

      {/* Secret Toast Notification */}
      <AnimatePresence>
        {showPreviewToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-sage-900 text-white text-xs shadow-xl font-medium"
          >
            {showPreviewToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soft Ambient Background Glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-rose-100/40 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-sage-100/40 blur-[100px]" />
      </div>

      {/* Center Section: Greeting & Love Days Counter */}
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

        {/* Clean Love Days Counter Card (with 100 Days festive upgrade) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`w-full max-w-xl rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-500 ${
            is100Days
              ? 'bg-gradient-to-b from-white via-white to-rose-50/30 border-2 border-rose-300/90 shadow-[0_0_35px_rgba(251,113,133,0.2)] ring-2 ring-rose-200/50'
              : 'bg-white/80 border border-cream-200/90 shadow-xs'
          }`}
        >
          {/* Milestone 100 Days Badge */}
          {is100Days && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-rose-50 to-amber-100 border border-rose-300 text-rose-700 text-xs font-semibold shadow-xs"
            >
              <PartyPopper className="h-3.5 w-3.5 text-rose-500" />
              <span>Happy 100 Days of Us! 🎉</span>
              <Sparkles className="h-3 w-3 text-amber-500" />
            </motion.div>
          )}

          {/* Anniversary Header (Tap 3x to toggle preview) */}
          <button
            onClick={handleAnniversaryTap}
            className="flex items-center justify-center gap-2 text-xs font-sans text-sage-900/60 mb-4 mx-auto hover:text-rose-600 transition-colors cursor-pointer group"
            title="Bersama Sejak 31 Juli 2026 (Ketuk 3x untuk testing 100 hari)"
          >
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-200 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Bersama Sejak 31 Juli 2026</span>
          </button>

          {/* 4 Clean Counter Boxes */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3.5 max-w-md mx-auto">
            {/* Days Box */}
            <div
              className={`rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center transition-all ${
                is100Days
                  ? 'bg-gradient-to-b from-rose-100/90 via-rose-50 to-white border-2 border-rose-300 shadow-xs'
                  : 'bg-cream-50/70 border border-cream-200/60'
              }`}
            >
              <span
                className={`font-serif text-2xl sm:text-3xl font-semibold tracking-tight ${
                  is100Days ? 'text-rose-600' : 'text-sage-900'
                }`}
              >
                {displayDays}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans flex items-center gap-0.5">
                Hari {is100Days && <Sparkles className="h-2.5 w-2.5 text-amber-500 inline" />}
              </span>
            </div>

            {/* Hours Box */}
            <div className="bg-cream-50/70 border border-cream-200/60 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl text-sage-900 font-semibold tracking-tight">
                {String(timeTogether.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans">
                Jam
              </span>
            </div>

            {/* Minutes Box */}
            <div className="bg-cream-50/70 border border-cream-200/60 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl text-sage-900 font-semibold tracking-tight">
                {String(timeTogether.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] text-sage-900/50 uppercase tracking-widest mt-1 font-sans">
                Menit
              </span>
            </div>

            {/* Seconds Box */}
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

          {/* Action Buttons for 100 Days Celebration */}
          {is100Days && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-3.5 border-t border-rose-200/60 flex flex-wrap items-center justify-center gap-2.5"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsCelebrationOpen(true);
                  fire100DaysConfetti();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Buka Surat Spesial 100 Hari 💌</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fire100DaysConfetti()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
                title="Tembakkan kembang api confetti"
              >
                <PartyPopper className="h-3.5 w-3.5 text-rose-500" />
                <span>Rayakan 🎉</span>
              </motion.button>
            </motion.div>
          )}
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

      {/* 100 Days Celebration Modal */}
      <Celebration100DaysModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        visitorName={visitorName}
        isPreview={isPreviewMode}
      />
    </main>
  );
}
