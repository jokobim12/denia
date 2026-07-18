'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Video, X, Check, Loader2, Play, Grid3X3 } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = 'idle' | 'camera_single' | 'camera_photobooth' | 'preview';
type TemplateType = 'coquette' | 'floral' | 'y2k' | 'vintage' | 'clouds';
type GridType = '3-vert' | '4-vert';

export default function CameraModal({ isOpen, onClose, onSuccess }: CameraModalProps) {
  const [mode, setMode] = useState<Mode>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPhotoboothResult, setIsPhotoboothResult] = useState(false);
  
  // Photobooth state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('coquette');
  const [gridType, setGridType] = useState<GridType>('3-vert');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [rawPhotos, setRawPhotos] = useState<string[]>([]); // base64 raw snaps for re-stitching
  const [snapCount, setSnapCount] = useState<number>(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ref for re-stitching state tracking so we don't spam
  const [isStitching, setIsStitching] = useState(false);

  // Stop camera when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setMode('idle');
    setImageBlob(null);
    setPreviewUrl(null);
    setIsPhotoboothResult(false);
    setRawPhotos([]);
    setCountdown(null);
    setSnapCount(0);
    setSelectedTemplate('coquette');
    setGridType('3-vert');
    setTitle('');
    setDescription('');
    setErrorMsg('');
    setIsStitching(false);
  };

  const startCamera = async (isPhotobooth = false) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      setMode(isPhotobooth ? 'camera_photobooth' : 'camera_single');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setErrorMsg('Gagal mengakses kamera. Pastikan browser memiliki izin akses kamera.');
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, mode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureSinglePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        setImageBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setIsPhotoboothResult(false);
        stopCamera();
        setMode('preview');
      }
    }, 'image/jpeg', 0.9);
  };

  const startPhotoboothSequence = async () => {
    const totalPhotos = gridType === '3-vert' ? 3 : 4;
    const snapped: string[] = [];
    
    for (let i = 0; i < totalPhotos; i++) {
      setSnapCount(i + 1);
      // Countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(0); // Snap!
      
      // Capture frame
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Crop slightly if needed, but for now just take the full frame and we will stretch/fit it in stitch
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          snapped.push(canvas.toDataURL('image/jpeg', 0.9));
        }
      }
      
      await new Promise(r => setTimeout(r, 500)); // Show flash/snap effect briefly
    }
    
    setCountdown(null);
    setSnapCount(0);
    setRawPhotos(snapped);
    stopCamera();
    
    // We start with the currently selected template
    await stitchPhotoboothPhotos(snapped, selectedTemplate);
  };

  // Changed to async to better handle loading
  const stitchPhotoboothPhotos = async (dataUrls: string[], template: TemplateType) => {
    if (dataUrls.length === 0) return;
    setIsStitching(true);
    
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    try {
      const firstImg = await loadImage(dataUrls[0]);
      // We will make the frames a 4:3 aspect ratio landscape internally for stitching, 
      // or we just use the raw width/height of the captured webcam image.
      const rawW = firstImg.width;
      const rawH = firstImg.height;
      
      // Target frame dimensions (crop to 4:3)
      const frameW = rawW;
      const frameH = Math.floor(rawW * (3/4)); 
      
      const border = Math.floor(frameW * 0.05);
      const spacing = border;
      const totalHeight = (frameH * dataUrls.length) + (spacing * (dataUrls.length - 1)) + (border * 2) + 120; // extra space at bottom
      
      const canvas = document.createElement('canvas');
      canvas.width = frameW + (border * 2);
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Load background template
      const bgImg = await loadImage(`/templates/${template}.png`);
      // Draw background stretching over the canvas
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      
      // Draw images
      for (let idx = 0; idx < dataUrls.length; idx++) {
        const img = await loadImage(dataUrls[idx]);
        const yPos = border + (idx * (frameH + spacing));
        
        // Solid background (no shadow) behind the image for aesthetic
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(border - 10, yPos - 10, frameW + 20, frameH + 20);
        
        // The raw image might be 16:9 or 4:3. We crop the center to frameH.
        // sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        const sWidth = rawW;
        const sHeight = Math.floor(rawW * (3/4));
        const sy = (rawH - sHeight) / 2; // center vertically
        
        ctx.drawImage(img, 0, sy, sWidth, sHeight, border, yPos, frameW, frameH);
      }
      
      // Draw text at the bottom
      ctx.fillStyle = '#4c5c54';
      ctx.font = `italic ${Math.floor(frameW * 0.08)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Photobooth', canvas.width / 2, totalHeight - (border * 1.5));
      
      canvas.toBlob((blob) => {
        if (blob) {
          setImageBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
          setIsPhotoboothResult(true);
          setMode('preview');
          setIsStitching(false);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (err) {
      console.error('Error stitching:', err);
      setIsStitching(false);
    }
  };

  // Re-stitch when template changes in preview mode
  const handleTemplateChange = (newTemplate: TemplateType) => {
    setSelectedTemplate(newTemplate);
    if (rawPhotos.length > 0 && !isStitching) {
      stitchPhotoboothPhotos(rawPhotos, newTemplate);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageBlob(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsPhotoboothResult(false);
      setMode('preview');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBlob || !title) return;
    
    setIsUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', imageBlob);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Gagal mengunggah foto.');
      const { url: imageUrl } = await uploadRes.json();
      
      const finalDesc = isPhotoboothResult ? `${description} #photobooth` : description;
      const saveRes = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: finalDesc, eventDate: new Date().toISOString(), imageUrl }),
      });
      if (!saveRes.ok) throw new Error('Gagal menyimpan detail foto.');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-cream-50 w-full ${mode === 'preview' ? 'max-w-4xl' : 'max-w-xl'} rounded-3xl overflow-hidden relative border border-cream-200 transition-all duration-300`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur-sm rounded-full text-sage-900 hover:bg-rose-50 hover:text-rose-500 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* --- IDLE MODE (Selection) --- */}
        {mode === 'idle' && (
          <div key="idle" className="p-8 text-center space-y-6 mt-4">
            <h2 className="text-2xl font-serif text-sage-900 mb-2">Tambah Momen</h2>
            <p className="text-sm text-sage-900/60 font-sans italic mb-8">Pilih cara kamu ingin menyimpan momen ini.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-cream-200 rounded-2xl hover:border-rose-200 transition-all group cursor-pointer"
              >
                <div className="p-3 bg-cream-50 rounded-full group-hover:bg-rose-50 transition-colors">
                  <ImageIcon className="h-6 w-6 text-sage-500 group-hover:text-rose-400" />
                </div>
                <span className="font-medium text-sm text-sage-900">Galeri HP</span>
              </button>

              <button 
                onClick={() => startCamera(false)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-cream-200 rounded-2xl hover:border-rose-200 transition-all group cursor-pointer"
              >
                <div className="p-3 bg-cream-50 rounded-full group-hover:bg-rose-50 transition-colors">
                  <Camera className="h-6 w-6 text-sage-500 group-hover:text-rose-400" />
                </div>
                <span className="font-medium text-sm text-sage-900">Selfie</span>
              </button>

              <button 
                onClick={() => startCamera(true)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-cream-200 rounded-2xl hover:border-rose-200 transition-all group cursor-pointer"
              >
                <div className="p-3 bg-cream-50 rounded-full group-hover:bg-rose-50 transition-colors">
                  <Video className="h-6 w-6 text-sage-500 group-hover:text-rose-400" />
                </div>
                <span className="font-medium text-sm text-sage-900">Photobooth</span>
              </button>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            {errorMsg && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
          </div>
        )}

        {/* --- CAMERA SINGLE MODE --- */}
        {mode === 'camera_single' && (
          <div key="camera-single" className="relative bg-black h-[80vh] sm:h-[600px] flex flex-col items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transition-opacity"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-10">
              <button 
                onClick={captureSinglePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all bg-white/20 cursor-pointer"
              >
                <div className="w-12 h-12 bg-white rounded-full" />
              </button>
            </div>
          </div>
        )}
        
        {/* --- CAMERA PHOTOBOOTH MODE --- */}
        {mode === 'camera_photobooth' && (
          <div key="camera-photobooth" className="relative bg-black h-[85vh] sm:h-[700px] flex flex-col items-center justify-center">
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity ${countdown === 0 ? 'opacity-50' : 'opacity-100'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Grid Selection & Start Overlay (Before Snap) */}
            {countdown === null && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl max-w-sm w-full flex flex-col items-center text-center">
                  <Grid3X3 className="h-10 w-10 text-sage-500 mb-4" />
                  <h3 className="font-serif text-2xl text-sage-900 mb-2">Pilih Kisi</h3>
                  <p className="text-xs text-sage-500 mb-8 font-sans">Tentukan jumlah foto yang ingin diambil</p>
                  
                  <div className="flex gap-4 w-full mb-8">
                    <button 
                      onClick={() => setGridType('3-vert')}
                      className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${gridType === '3-vert' ? 'border-rose-300 bg-rose-50' : 'border-cream-200 hover:border-cream-300 bg-white'}`}
                    >
                      <div className="w-12 flex flex-col gap-1 mb-3">
                         <div className="h-8 w-full bg-sage-300 rounded-sm"></div>
                         <div className="h-8 w-full bg-sage-300 rounded-sm"></div>
                         <div className="h-8 w-full bg-sage-300 rounded-sm"></div>
                      </div>
                      <span className={`text-sm font-medium ${gridType === '3-vert' ? 'text-rose-500' : 'text-sage-700'}`}>3 Foto</span>
                    </button>
                    
                    <button 
                      onClick={() => setGridType('4-vert')}
                      className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${gridType === '4-vert' ? 'border-rose-300 bg-rose-50' : 'border-cream-200 hover:border-cream-300 bg-white'}`}
                    >
                      <div className="w-12 flex flex-col gap-0.5 mb-3">
                         <div className="h-6 w-full bg-sage-300 rounded-sm"></div>
                         <div className="h-6 w-full bg-sage-300 rounded-sm"></div>
                         <div className="h-6 w-full bg-sage-300 rounded-sm"></div>
                         <div className="h-6 w-full bg-sage-300 rounded-sm"></div>
                      </div>
                      <span className={`text-sm font-medium ${gridType === '4-vert' ? 'text-rose-500' : 'text-sage-700'}`}>4 Foto</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={startPhotoboothSequence} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-medium transition-all cursor-pointer"
                  >
                    <Camera className="h-5 w-5" />
                    Mulai Foto
                  </button>
                </div>
              </div>
            )}
            
            {/* Countdown Overlay */}
            {countdown !== null && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <span className="text-[150px] text-white font-bold leading-none">
                    {countdown === 0 ? '' : countdown}
                  </span>
                  {countdown > 0 && (
                     <span className="text-white text-xl mt-4 font-medium bg-black/20 px-4 py-1 rounded-full">
                       Foto {snapCount} dari {gridType === '3-vert' ? 3 : 4}
                     </span>
                  )}
               </div>
            )}
            
            {/* Flash Effect */}
            {countdown === 0 && (
               <div className="absolute inset-0 bg-white animate-pulse pointer-events-none z-20" />
            )}
          </div>
        )}

        {/* --- PREVIEW & FORM MODE --- */}
        {mode === 'preview' && previewUrl && (
          <div key="preview" className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto custom-scrollbar md:h-[600px]">
            {/* Left/Top: Image Preview & Template Selector (if photobooth) */}
            <div className="bg-cream-100 h-[450px] shrink-0 md:h-full md:w-1/2 p-4 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-cream-200">
              
              <div className="relative mb-4 max-h-[75%] md:max-h-[80%] flex justify-center w-full">
                {isStitching && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-sm">
                    <Loader2 className="h-8 w-8 text-rose-400 animate-spin" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-full w-auto object-contain rounded-sm" />
              </div>
              
              {isPhotoboothResult && (
                <div className="w-full max-w-sm mt-auto mb-2 shrink-0">
                  <p className="text-xs font-medium text-sage-900/60 mb-2 text-center">Pilih Template Background</p>
                  <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-2 rounded-xl overflow-x-auto custom-scrollbar border border-white/50 justify-start sm:justify-center px-4">
                    {['coquette', 'floral', 'y2k', 'vintage', 'clouds'].map(t => (
                        <button 
                          key={t} 
                          disabled={isStitching}
                          onClick={() => handleTemplateChange(t as TemplateType)} 
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize shrink-0 ${selectedTemplate === t ? 'bg-sage-900 text-white' : 'text-sage-700 hover:bg-white'}`}
                        >
                          {t}
                        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right/Bottom: Form */}
            <div className="p-6 md:p-8 bg-white shrink-0 md:w-1/2 flex flex-col justify-center">
              <h3 className="font-serif text-xl text-sage-900 mb-1">Simpan Momen</h3>
              <p className="text-xs text-sage-900/50 mb-6 italic">Tambahkan cerita untuk kenangan ini.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-sage-900/70 mb-1.5">Judul</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senja di Pantai"
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-900/70 mb-1.5">Cerita Singkat</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Hari ini sangat menyenangkan..."
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300 resize-none"
                  />
                </div>
                
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                
                <div className="pt-2 pb-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!previewUrl) return;
                      const a = document.createElement('a');
                      a.href = previewUrl;
                      a.download = isPhotoboothResult ? 'photobooth_strip.jpg' : 'photo.jpg';
                      a.click();
                    }}
                    className="w-full py-3 bg-white border border-sage-200 hover:bg-sage-50 text-sage-900 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Simpan ke Galeri HP
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || isStitching}
                    className="w-full py-3 bg-rose-200 hover:bg-rose-300 text-rose-950 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Unggah ke Website
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </div>
  );
}
