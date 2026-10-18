import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: 'Akses ditolak: Silakan masukkan sandi rahasia untuk mengunggah.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dipilih.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran foto terlalu besar. Maksimal 6 MB.' },
        { status: 400 }
      );
    }

    const mimeType = file.type || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan gambar JPG, PNG, atau WEBP.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ambil ekstensi aman
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg';

    // Bersihkan nama file dan gabungkan dengan timestamp + UUID unik
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
    const fileName = `${Date.now()}_${uuidv4().slice(0, 8)}_${cleanFileName}.${safeExt}`;

    // Upload ke Supabase Storage, ke dalam bucket bernama 'scrapbook'
    const { error } = await supabase
      .storage
      .from('scrapbook')
      .upload(`photos/${fileName}`, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error details:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Mendapatkan Public URL dari file yang baru saja diunggah
    const { data: publicUrlData } = supabase
      .storage
      .from('scrapbook')
      .getPublicUrl(`photos/${fileName}`);

    return NextResponse.json({ url: publicUrlData.publicUrl });
    
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

