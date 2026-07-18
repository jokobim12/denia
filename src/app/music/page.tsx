'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Music, Disc, Heart, Edit3, Link as LinkIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPage() {
  const [herPlaylist, setHerPlaylist] = useState<string>('');
  const [inputUrl, setInputUrl] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const savedPlaylist = localStorage.getItem('herPlaylistUrl');
    if (savedPlaylist) {
      setHerPlaylist(savedPlaylist);
      setIsEditing(false);
    }
  }, []);

  const handleHerPlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    
    // Auto-convert standard Spotify URL to Embed URL for convenience
    let finalUrl = inputUrl;
    if (inputUrl.includes('spotify.com') && !inputUrl.includes('/embed/')) {
      finalUrl = inputUrl.replace('spotify.com/', 'spotify.com/embed/');
    }
    setHerPlaylist(finalUrl);
    localStorage.setItem('herPlaylistUrl', finalUrl);
    setIsEditing(false);
  };


  return (
    <div className="min-h-screen bg-cream-50 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-rose-400 font-serif text-lg">Melodious Memories</span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-sage-900">Ruang Musik</h1>
          <p className="text-xs md:text-sm text-sage-900/50 max-w-md mx-auto italic font-sans">
            "Kumpulan playlist musik favorit."
          </p>
        </div>

        <div className="flex justify-center w-full">
          
          {/* HER PLAYLIST (USER INTERACTIVE) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between border-b border-cream-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-full shadow-sm border border-rose-100">
                  <Heart className="h-5 w-5 text-rose-400 fill-rose-100" />
                </div>
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-rose-950">Playlist Spesialmu</h2>
                  <p className="text-xs text-sage-900/40 italic font-sans">Pilih dan putar playlistmu di sini</p>
                </div>
              </div>
              
              {/* Edit button if she already submitted one */}
              {!isEditing && herPlaylist && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-sage-900/40 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                  title="Ganti Playlist"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isEditing || !herPlaylist ? (
                <motion.div
                  key="input-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/80 border border-rose-100 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center h-full min-h-[420px] text-center"
                >
                  <div className="bg-rose-50 p-4 rounded-full mb-6 border border-rose-100">
                    <Music className="h-8 w-8 text-rose-300" />
                  </div>
                  <h3 className="font-serif text-xl text-sage-900 mb-2">Masukkan Playlistmu</h3>
                  <p className="text-xs text-sage-900/50 italic mb-8 max-w-xs px-2">
                    Salin link (URL) dari playlist Spotify kamu dan tempelkan di bawah.
                  </p>

                  <form onSubmit={handleHerPlaylistSubmit} className="w-full max-w-sm space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-sage-400" />
                      </div>
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://open.spotify.com/playlist/..."
                        className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300 transition-all text-sage-900"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!inputUrl}
                      className="w-full flex items-center justify-center gap-2 bg-rose-200 hover:bg-rose-300 text-rose-950 py-3 rounded-2xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <Check className="h-4 w-4" />
                      Simpan & Putar
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-rose-50/50 border border-rose-100/60 p-6 rounded-3xl shadow-sm flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-medium text-rose-900">
                      Harmoni Pilihanmu
                    </h3>
                    <Disc className="h-5 w-5 text-rose-400 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-transparent border border-rose-100 shadow-inner">
                    <iframe
                      src={herPlaylist}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
