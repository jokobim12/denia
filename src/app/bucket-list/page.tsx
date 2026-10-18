'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PasscodeModal from '@/components/PasscodeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Heart, Sparkles, X, Loader2, Trash2 } from 'lucide-react';

interface BucketItem {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export default function BucketListPage() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Passcode Protection State
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('date');
  const [newNotes, setNewNotes] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bucket-list');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching bucket list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Helper untuk memastikan user sudah memasukkan sandi rahasia sebelum CRUD
  const checkAuthAndExecute = async (action: () => void) => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) {
        action();
        return;
      }
    } catch {
      // ignore
    }
    setPendingAction(() => action);
    setIsPasscodeOpen(true);
  };

  const handleOpenAddModal = () => {
    checkAuthAndExecute(() => setIsAddModalOpen(true));
  };

  const executeToggleComplete = async (item: BucketItem) => {
    const updatedStatus = !item.isCompleted;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isCompleted: updatedStatus,
              completedAt: updatedStatus ? new Date().toISOString() : null,
            }
          : i
      )
    );

    try {
      const res = await fetch('/api/bucket-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isCompleted: updatedStatus }),
      });
      if (!res.ok) fetchItems();
    } catch (err) {
      console.error('Error updating status:', err);
      fetchItems();
    }
  };

  const handleToggleComplete = (item: BucketItem) => {
    checkAuthAndExecute(() => executeToggleComplete(item));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bucket-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          notes: newNotes.trim() || null,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        setNewTitle('');
        setNewNotes('');
        setNewCategory('date');
        setIsAddModalOpen(false);
      } else {
        alert('Gagal menyimpan impian. Pastikan sudah memasukkan sandi rahasia.');
      }
    } catch (err) {
      console.error('Error creating bucket item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteItem = async (id: string) => {
    if (!confirm('Hapus impian ini dari daftar?')) return;

    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/bucket-list?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting bucket item:', err);
      fetchItems();
    }
  };

  const handleDeleteItem = (id: string) => {
    checkAuthAndExecute(() => executeDeleteItem(id));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'travel':
        return 'Perjalanan';
      case 'food':
        return 'Kuliner';
      case 'activity':
        return 'Aktivitas';
      case 'date':
        return 'Kencan';
      case 'dream':
      default:
        return 'Impian';
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedFilter === 'pending') return !item.isCompleted;
    if (selectedFilter === 'completed') return item.isCompleted;
    return true;
  });

  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col text-sage-900 select-none">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-rose-400 font-serif text-lg flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Our Dreams &amp; Wishlist</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-sage-900">Daftar Impian Berdua</h1>
          <p className="text-xs md:text-sm text-sage-900/50 max-w-md mx-auto italic font-sans px-4">
            &ldquo;Semua hal manis dan tempat indah yang ingin kita lalui bersama.&rdquo;
          </p>

          {/* Progress Counter Minimalist */}
          <div className="pt-4 flex flex-col items-center">
            <div className="bg-white/80 border border-cream-200 px-5 py-2.5 rounded-full shadow-xs flex items-center gap-3 text-xs font-sans text-sage-900/70">
              <span className="font-medium text-sage-900">
                {completedCount} dari {items.length} impian terwujud
              </span>
              <div className="w-24 bg-cream-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-rose-500 font-medium">{progressPercent}%</span>
            </div>

            <div className="pt-6">
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 bg-rose-200 hover:bg-rose-300 text-rose-950 px-6 py-2.5 rounded-full text-xs md:text-sm font-medium shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                Tambah Impian Baru
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'all', label: `Semua (${items.length})` },
            { id: 'pending', label: `Belum (${items.length - completedCount})` },
            { id: 'completed', label: `Tercapai ✨ (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as 'all' | 'pending' | 'completed')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-sage-900 text-cream-50 font-medium'
                  : 'bg-white/60 text-sage-900/60 hover:text-sage-900 hover:bg-white border border-cream-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Bucket Items */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white/60 border border-cream-200 p-4 rounded-2xl animate-pulse h-16"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white/40 rounded-3xl border border-dashed border-cream-200">
            <Heart className="h-8 w-8 text-rose-200 mx-auto mb-2" />
            <p className="text-xs text-sage-900/50 font-serif">
              {items.length === 0
                ? 'Belum ada impian yang ditambahkan. Yuk buat impian pertama kita!'
                : 'Belum ada daftar di kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`group flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                  item.isCompleted
                    ? 'bg-rose-50/30 border-rose-100/70'
                    : 'bg-white/80 hover:bg-white border-cream-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-grow">
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className="mt-0.5 text-sage-900/40 hover:text-rose-500 transition-colors cursor-pointer shrink-0 focus:outline-none"
                    title={item.isCompleted ? 'Tandai belum tercapai' : 'Tandai sudah tercapai'}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-rose-400 fill-rose-100 transition-transform scale-110" />
                    ) : (
                      <Circle className="h-5 w-5 group-hover:text-rose-300 transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-cream-100 text-sage-900/60 font-medium">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm md:text-base font-serif transition-colors ${
                        item.isCompleted
                          ? 'line-through text-sage-900/40 italic'
                          : 'text-sage-900 font-medium'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.notes && (
                      <p
                        className={`text-xs ${
                          item.isCompleted ? 'text-sage-900/30' : 'text-sage-900/60'
                        } font-sans`}
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side delete button */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-sage-900/30 hover:text-rose-500 transition-opacity rounded-lg cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Add Bucket Item */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sage-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cream-50 w-full max-w-md rounded-3xl p-6 border border-cream-200 shadow-xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-sage-900/50 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-1 mb-6">
                <h3 className="font-serif text-xl text-sage-900 font-medium">Tambah Impian Baru</h3>
                <p className="text-xs text-sage-900/50 font-sans">
                  Tuliskan satu hal yang ingin kita lakukan bersama
                </p>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">
                    Judul Impian / Rencana
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Piknik sore di kebun raya..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 transition-all text-sage-900"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 transition-all text-sage-900 cursor-pointer"
                  >
                    <option value="date">Kencan &amp; Momen Manis</option>
                    <option value="travel">Perjalanan &amp; Wisata</option>
                    <option value="food">Kuliner &amp; Masak</option>
                    <option value="activity">Aktivitas Seru</option>
                    <option value="dream">Impian Masa Depan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans text-sage-900/70 mb-1">
                    Catatan Kecil (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Contoh: Bawa kamera analog dan bekal..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-cream-200 text-sm focus:outline-none focus:border-rose-300 transition-all text-sage-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTitle.trim()}
                    className="w-full py-3 bg-rose-200 hover:bg-rose-300 disabled:opacity-50 text-rose-950 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan ke Daftar Impian ✨</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Romantic Passcode Dialog for Protected Actions */}
      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => {
          setIsPasscodeOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        description="Masukkan sandi rahasia untuk mengubah atau menambah daftar impian kita."
      />
    </div>
  );
}
