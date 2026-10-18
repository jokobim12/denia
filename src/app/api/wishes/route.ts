import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const wishes = await prisma.timeline.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(wishes, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    console.error('GET wishes error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch wishes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, imageUrl } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wish = await prisma.timeline.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        eventDate: new Date(), // Simpan tanggal saat ini sebagai default
      },
    });

    return NextResponse.json(wish);
  } catch (error: unknown) {
    console.error('POST wish error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create wish';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
