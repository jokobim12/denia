import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const wishes = await prisma.timeline.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(wishes);
  } catch (error: any) {
    console.error('GET wishes error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 });
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
  } catch (error: any) {
    console.error('POST wish error:', error);
    return NextResponse.json({ error: 'Failed to create wish' }, { status: 500 });
  }
}
