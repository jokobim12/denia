import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';



export async function GET() {
  try {
    const items = await prisma.bucketItem.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(items, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    console.error('GET bucket-list error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch bucket list';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Silakan masukkan sandi rahasia.' }, { status: 401 });
    }

    const { title, category, notes } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Judul impian wajib diisi' }, { status: 400 });
    }

    const newItem = await prisma.bucketItem.create({
      data: {
        title: title.trim(),
        category: category || 'dream',
        notes: notes ? notes.trim() : null,
        isCompleted: false,
      },
    });

    return NextResponse.json(newItem);
  } catch (error: unknown) {
    console.error('POST bucket-list error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create bucket item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Silakan masukkan sandi rahasia.' }, { status: 401 });
    }

    const { id, isCompleted, notes } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });
    }

    const updated = await prisma.bucketItem.update({
      where: { id },
      data: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('PATCH bucket-list error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update bucket item';
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

    await prisma.bucketItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE bucket-list error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete bucket item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
