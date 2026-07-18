import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(playlists);
  } catch (error: any) {
    console.error('GET playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, embedUrl } = await req.json();

    if (!title || !embedUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const playlist = await prisma.playlist.create({
      data: {
        title,
        embedUrl,
      },
    });

    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error('POST playlist error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
