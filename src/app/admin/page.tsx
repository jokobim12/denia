'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import {
  Lock,
  Plus,
  Trash2,
  Image as ImageIcon,
  Mail,
  Calendar,
  Music,
  LogOut,
  Loader2,
  Trash,
  Heart,
  Edit3
} from 'lucide-react';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'photos' | 'letters' | 'timeline'>('photos');

  // Data states
  const [photos, setPhotos] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form states
  const [photoForm, setPhotoForm] = useState({ title: '', description: '', eventDate: '', file: null as File | null });
  const [letterForm, setLetterForm] = useState({ title: '', content: '', category: 'sad' });
  const [timelineForm, setTimelineForm] = useState({ title: '', description: '', eventDate: '', file: null as File | null });

  // Editing states
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);

  // Loading states for actions
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // File input refs
  const photoFileRef = useRef<HTMLInputElement>(null);
  const timelineFileRef = useRef<HTMLInputElement>(null);

  // Verify auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTabData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  const fetchTabData = async () => {
    setLoadingData(true);
    setActionError('');
    try {
      if (activeTab === 'photos') {
        const res = await fetch('/api/photos');
        if (res.ok) setPhotos(await res.json());
      } else if (activeTab === 'letters') {
        const res = await fetch('/api/letters');
        if (res.ok) setLetters(await res.json());
      } else if (activeTab === 'timeline') {
        const res = await fetch('/api/wishes');
        if (res.ok) setTimeline(await res.json());
      }
    } catch (err) {
      console.error(err);
      setActionError('Gagal memuat data.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const errData = await res.json();
        setLoginError(errData.error || 'Password salah.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Terjadi kesalahan koneksi.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setPasswordInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // Helper for uploading image
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengunggah foto.');
    }
    const data = await res.json();
    return data.url;
  };

  const handleEditClick = (item: any, type: 'photos' | 'letters' | 'timeline') => {
    setActiveTab(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (type === 'photos') {
      setEditingPhotoId(item.id);
      setPhotoForm({
        title: item.title,
        description: item.description,
        eventDate: new Date(item.eventDate).toISOString().split('T')[0],
        file: null, 
      });
    } else if (type === 'letters') {
      setEditingLetterId(item.id);
      setLetterForm({
        title: item.title,
        content: item.content,
        category: item.category,
      });
    } else if (type === 'timeline') {
      setEditingTimelineId(item.id);
      setTimelineForm({
        title: item.title,
        description: item.description,
        eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
        file: null,
      });
    }
  };

  const cancelEdit = (type: 'photos' | 'letters' | 'timeline') => {
    if (type === 'photos') {
      setEditingPhotoId(null);
      setPhotoForm({ title: '', description: '', eventDate: '', file: null });
      if (photoFileRef.current) photoFileRef.current.value = '';
    } else if (type === 'letters') {
      setEditingLetterId(null);
      setLetterForm({ title: '', content: '', category: 'sad' });
    } else if (type === 'timeline') {
      setEditingTimelineId(null);
      setTimelineForm({ title: '', description: '', eventDate: '', file: null });
      if (timelineFileRef.current) timelineFileRef.current.value = '';
    }
  };

  // Handle creates / updates
  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      let imageUrl = undefined;
      if (photoForm.file) {
        imageUrl = await uploadImage(photoForm.file);
      } else if (!editingPhotoId) {
        throw new Error('Silakan pilih file foto.');
      }
      
      const method = editingPhotoId ? 'PUT' : 'POST';
      const url = editingPhotoId ? `/api/photos/${editingPhotoId}` : '/api/photos';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: photoForm.title,
          description: photoForm.description,
          eventDate: photoForm.eventDate,
          imageUrl,
        }),
      });

      if (res.ok) {
        cancelEdit('photos');
        fetchTabData();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan foto.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      const method = editingLetterId ? 'PUT' : 'POST';
      const url = editingLetterId ? `/api/letters/${editingLetterId}` : '/api/letters';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letterForm),
      });

      if (res.ok) {
        cancelEdit('letters');
        fetchTabData();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan surat.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      let imageUrl = undefined;
      if (timelineForm.file) {
        imageUrl = await uploadImage(timelineForm.file);
      }

      const method = editingTimelineId ? 'PUT' : 'POST';
      const url = editingTimelineId ? `/api/wishes/${editingTimelineId}` : '/api/wishes';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: timelineForm.title,
          description: timelineForm.description,
          imageUrl,
        }),
      });

      if (res.ok) {
        cancelEdit('timeline');
        fetchTabData();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan item linimasa.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };



  // Handle deletes
  const handleDeleteItem = async (id: string, type: 'photos' | 'letters' | 'timeline') => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
      const apiType = type === 'timeline' ? 'wishes' : type;
      const res = await fetch(`/api/${apiType}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTabData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus item.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
      </div>
    );
  }

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-30">
          <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-rose-100 blur-[80px]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-sage-100 blur-[80px]" />
        </div>

        <div className="max-w-md w-full bg-white/70 border border-cream-200/50 backdrop-blur-xs p-8 rounded-3xl shadow-lg space-y-6 text-center">
          <div className="inline-flex p-4 bg-rose-50 rounded-full">
            <Lock className="h-8 w-8 text-rose-300" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-light text-sage-900">Dashboard Konten</h1>
            <p className="text-xs text-sage-900/50 font-sans">Masukkan kode sandi akses admin untuk mengelola isi website.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan Kode Sandi"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-5 py-3 border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white/60 font-sans text-center text-sm"
                required
              />
            </div>
            {loginError && <p className="text-xs text-rose-600 font-sans font-medium">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-rose-200 hover:bg-rose-300 text-rose-900 font-sans font-medium rounded-full transition-colors duration-200 text-sm shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Masuk'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 2. LOGGED IN CONTENT DASHBOARD
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 space-y-8">
        
        {/* Admin Header info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 border border-cream-200/50 p-6 rounded-3xl shadow-xs">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-bold text-sage-900">Dashboard Konten</h1>
            <p className="text-xs text-sage-900/50">Halo Admin! Anda dapat mengelola seluruh konten dan memori di sini.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-sage-100 hover:bg-rose-100 hover:text-rose-900 text-sage-900/70 text-xs font-medium rounded-full transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Action Error Notice */}
        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-800 font-medium">
            {actionError}
          </div>
        )}

        {/* Grid: Form and list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Navigation tabs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tabs selector */}
            <div className="grid grid-cols-3 gap-2 bg-cream-200/50 p-1.5 rounded-2xl border border-cream-300/30">
              {(['photos', 'letters', 'timeline'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActionError('');
                  }}
                  className={`py-2 text-[10px] md:text-xs font-semibold rounded-xl capitalize transition-all focus:outline-none cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white text-rose-900 shadow-xs'
                      : 'text-sage-900/60 hover:text-sage-900'
                  }`}
                >
                  {tab === 'photos'
                    ? 'Foto'
                    : tab === 'letters'
                    ? 'Surat'
                    : 'Toples Catatan'}
                </button>
              ))}
            </div>

            {/* TAB FORM: Photos */}
            {activeTab === 'photos' && (
              <form onSubmit={handleCreatePhoto} className="bg-white/80 border border-cream-200/50 p-6 rounded-3xl space-y-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-sage-900 flex items-center gap-2 pb-2 border-b border-cream-200/50">
                  <ImageIcon className="h-5 w-5 text-rose-400" />
                  <span>{editingPhotoId ? 'Perbarui Foto' : 'Unggah Foto Galeri'}</span>
                </h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Judul Foto</label>
                  <input
                    type="text"
                    required
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Cerita / Deskripsi</label>
                  <textarea
                    required
                    value={photoForm.description}
                    onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Tanggal Kejadian</label>
                  <input
                    type="date"
                    required
                    value={photoForm.eventDate}
                    onChange={(e) => setPhotoForm({ ...photoForm, eventDate: e.target.value })}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Pilih Foto {editingPhotoId && '(Kosongkan jika tidak diubah)'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingPhotoId}
                    ref={photoFileRef}
                    onChange={(e) => setPhotoForm({ ...photoForm, file: e.target.files?.[0] || null })}
                    className="w-full text-xs text-sage-900/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-900 hover:file:bg-rose-100"
                  />
                </div>

                <div className="flex gap-2">
                  {editingPhotoId && (
                    <button
                      type="button"
                      onClick={() => cancelEdit('photos')}
                      disabled={submitting}
                      className="w-1/3 py-2.5 bg-sage-100 hover:bg-sage-200 text-sage-900 font-medium rounded-full text-xs transition-colors"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${editingPhotoId ? 'w-2/3' : 'w-full'} py-2.5 bg-rose-200 hover:bg-rose-300 text-rose-900 font-medium rounded-full text-xs shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{editingPhotoId ? 'Menyimpan...' : 'Mengunggah...'}</span>
                      </>
                    ) : (
                      <>
                        {editingPhotoId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <span>{editingPhotoId ? 'Simpan' : 'Tambahkan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB FORM: Letters */}
            {activeTab === 'letters' && (
              <form onSubmit={handleCreateLetter} className="bg-white/80 border border-cream-200/50 p-6 rounded-3xl space-y-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-sage-900 flex items-center gap-2 pb-2 border-b border-cream-200/50">
                  <Mail className="h-5 w-5 text-rose-400" />
                  <span>{editingLetterId ? 'Perbarui Surat' : 'Tulis Surat Digital'}</span>
                </h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Judul Surat</label>
                  <input
                    type="text"
                    required
                    value={letterForm.title}
                    onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Kategori Surat</label>
                  <select
                    value={letterForm.category}
                    onChange={(e) => setLetterForm({ ...letterForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  >
                    <option value="sad">Buka saat sedang sedih</option>
                    <option value="tired">Buka saat sedang lelah</option>
                    <option value="happy">Buka saat sedang bahagia</option>
                    <option value="cheer">Buka saat butuh semangat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Isi Surat</label>
                  <textarea
                    required
                    value={letterForm.content}
                    onChange={(e) => setLetterForm({ ...letterForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  {editingLetterId && (
                    <button
                      type="button"
                      onClick={() => cancelEdit('letters')}
                      disabled={submitting}
                      className="w-1/3 py-2.5 bg-sage-100 hover:bg-sage-200 text-sage-900 font-medium rounded-full text-xs transition-colors"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${editingLetterId ? 'w-2/3' : 'w-full'} py-2.5 bg-rose-200 hover:bg-rose-300 text-rose-900 font-medium rounded-full text-xs shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        {editingLetterId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <span>{editingLetterId ? 'Simpan' : 'Tambahkan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB FORM: Timeline / Wishes */}
            {activeTab === 'timeline' && (
              <form onSubmit={handleCreateTimeline} className="bg-white/80 border border-cream-200/50 p-6 rounded-3xl space-y-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-sage-900 flex items-center gap-2 pb-2 border-b border-cream-200/50">
                  <Calendar className="h-5 w-5 text-rose-400" />
                  <span>{editingTimelineId ? 'Perbarui Catatan' : 'Tambah Catatan Harian'}</span>
                </h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Judul Catatan (misal: Pesan Pagi, Pengingat)</label>
                  <input
                    type="text"
                    required
                    value={timelineForm.title}
                    onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Isi Catatan</label>
                  <textarea
                    required
                    value={timelineForm.description}
                    onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sage-900/60">Pilih Gambar/Stiker (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={timelineFileRef}
                    onChange={(e) => setTimelineForm({ ...timelineForm, file: e.target.files?.[0] || null })}
                    className="w-full text-xs text-sage-900/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-900 hover:file:bg-rose-100"
                  />
                </div>

                <div className="flex gap-2">
                  {editingTimelineId && (
                    <button
                      type="button"
                      onClick={() => cancelEdit('timeline')}
                      disabled={submitting}
                      className="w-1/3 py-2.5 bg-sage-100 hover:bg-sage-200 text-sage-900 font-medium rounded-full text-xs transition-colors"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${editingTimelineId ? 'w-2/3' : 'w-full'} py-2.5 bg-rose-200 hover:bg-rose-300 text-rose-900 font-medium rounded-full text-xs shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        {editingTimelineId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <span>{editingTimelineId ? 'Simpan' : 'Tambahkan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}



          </div>

          {/* Right Column: List of items */}
          <div className="lg:col-span-7 bg-white/60 border border-cream-200/50 p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-sage-900 pb-2 border-b border-cream-200/50 flex justify-between items-center">
              <span>Konten Saat Ini</span>
              <span className="text-xs font-sans text-sage-900/40 font-normal">
                {activeTab === 'photos'
                  ? `${photos.length} Foto`
                  : activeTab === 'letters'
                  ? `${letters.length} Surat`
                  : `${timeline.length} Catatan`}
              </span>
            </h3>

            {loadingData ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-rose-300" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[500px] space-y-3 pr-2 scrollbar-thin">
                
                {/* 1. LIST: Photos */}
                {activeTab === 'photos' && (
                  photos.length === 0 ? (
                    <p className="text-xs text-sage-900/40 italic py-10 text-center">Belum ada foto.</p>
                  ) : (
                    photos.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-white border border-cream-200 rounded-2xl items-center justify-between shadow-xs">
                        <div className="flex gap-3 items-center min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-12 w-12 object-cover rounded-lg bg-cream-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm text-sage-900 truncate">{item.title}</h4>
                            <p className="text-[10px] text-sage-900/40 truncate">
                              {new Date(item.eventDate).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(item, 'photos')}
                            className="p-2 text-sage-900/40 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, 'photos')}
                            className="p-2 text-sage-900/40 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* 2. LIST: Letters */}
                {activeTab === 'letters' && (
                  letters.length === 0 ? (
                    <p className="text-xs text-sage-900/40 italic py-10 text-center">Belum ada surat.</p>
                  ) : (
                    letters.map((item) => (
                      <div key={item.id} className="flex p-3 bg-white border border-cream-200 rounded-2xl items-center justify-between shadow-xs">
                        <div className="min-w-0 pr-4">
                          <h4 className="font-medium text-sm text-sage-900 truncate">{item.title}</h4>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {item.category === 'sad'
                              ? 'Sedih'
                              : item.category === 'tired'
                              ? 'Lelah'
                              : item.category === 'happy'
                              ? 'Bahagia'
                              : 'Semangat'}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditClick(item, 'letters')}
                            className="p-2 text-sage-900/40 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, 'letters')}
                            className="p-2 text-sage-900/40 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* 3. LIST: Timeline / Wishes */}
                {activeTab === 'timeline' && (
                  timeline.length === 0 ? (
                    <p className="text-xs text-sage-900/40 italic py-10 text-center">Belum ada catatan.</p>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-white border border-cream-200 rounded-2xl items-center justify-between shadow-xs">
                        <div className="flex gap-3 items-center min-w-0">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-12 w-12 object-cover rounded-lg bg-cream-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-cream-100 text-rose-300 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Heart className="h-5 w-5 fill-rose-50" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm text-sage-900 truncate">{item.title}</h4>
                            <p className="text-[10px] text-sage-900/40 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(item, 'timeline')}
                            className="p-2 text-sage-900/40 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, 'timeline')}
                            className="p-2 text-sage-900/40 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}



              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
