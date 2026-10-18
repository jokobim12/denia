import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { eventDate: 'desc' },
    });
    return NextResponse.json(photos, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    console.error('GET photos error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch photos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Masukkan sandi rahasia untuk menyimpan foto.' }, { status: 401 });
    }

    const { imageUrl, title, description, eventDate } = await req.json();

    if (!imageUrl || !title || !description || !eventDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const photo = await prisma.photo.create({
      data: {
        imageUrl,
        title,
        description,
        eventDate: new Date(eventDate),
      },
    });

    return NextResponse.json(photo);
  } catch (error: unknown) {
    console.error('POST photo error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create photo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

