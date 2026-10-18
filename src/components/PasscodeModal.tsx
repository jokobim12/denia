'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Loader2 } from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function PasscodeModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Ruang Khusus Kita',
  description = 'Masukkan sandi rahasia untuk melanjutkan perubahan kenangan.',
}: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setIsVerifying(true);
    setPasscodeError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode }),
      });

      if (res.ok) {
        setPasscode('');
        setPasscodeError('');
        onClose();
        onSuccess();
      } else {
        setPasscodeError('Sandi belum tepat, coba lagi ya 💕');
      }
    } catch {
      setPasscodeError('Gagal memverifikasi sandi. Coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sage-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-cream-50 w-full max-w-sm rounded-3xl p-6 border border-cream-200 shadow-xl relative"
          >
            <button
              onClick={() => {
                setPasscode('');
                setPasscodeError('');
                onClose();
              }}
              className="absolute top-4 right-4 p-2 text-sage-900/50 hover:text-rose-500 rounded-full transition-colors cursor-pointer focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex p-3 rounded-full bg-rose-50 border border-rose-100 text-rose-400">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl text-sage-900 font-medium">{title}</h3>
              <p className="text-xs text-sage-900/60 italic font-sans leading-relaxed">
                {description}
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Sandi rahasia..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300 transition-all text-center text-sage-900 tracking-wider"
                  autoFocus
                  required
                />
                {passcodeError && (
                  <p className="text-xs text-rose-500 text-center mt-2 font-medium">
                    {passcodeError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying || !passcode}
                className="w-full py-3 bg-rose-200 hover:bg-rose-300 disabled:opacity-50 text-rose-950 text-sm font-medium rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <span>Buka Kunci ✨</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
