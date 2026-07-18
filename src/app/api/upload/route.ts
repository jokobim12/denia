import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan menggunakan ekstensi yang benar
    const fileExt = file.name.split('.').pop() || 'jpg';
    // Membersihkan nama file dan menambahkan UUID agar unik
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const fileName = `${Date.now()}_${uuidv4()}_${cleanFileName}.${fileExt}`;

    // Upload ke Supabase Storage, ke dalam bucket bernama 'scrapbook'
    const { data, error } = await supabase
      .storage
      .from('scrapbook')
      .upload(`photos/${fileName}`, buffer, {
        contentType: file.type || 'image/jpeg',
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
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
