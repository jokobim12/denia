import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const spots = await prisma.memorySpot.findMany({
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(spots, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    console.error('GET memory-spots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch memory spots';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Silakan masukkan sandi rahasia.' }, { status: 401 });
    }

    const { title, description, category, latitude, longitude, imageUrl, date } = await req.json();

    if (!title || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Judul dan koordinat lokasi wajib diisi' }, { status: 400 });
    }

    const newSpot = await prisma.memorySpot.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category || 'date',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl: imageUrl || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(newSpot);
  } catch (error: unknown) {
    console.error('POST memory-spots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create memory spot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Silakan masukkan sandi rahasia.' }, { status: 401 });
    }

    const { id, title, description, category, imageUrl, date } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });
    }

    const updated = await prisma.memorySpot.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(category ? { category } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('PATCH memory-spots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update memory spot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Silakan masukkan sandi rahasia.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });
    }

    await prisma.memorySpot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE memory-spots error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete memory spot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
