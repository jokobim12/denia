import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { eventDate: 'desc' },
    });
    return NextResponse.json(photos);
  } catch (error: any) {
    console.error('GET photos error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
  } catch (error: any) {
    console.error('POST photo error:', error);
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 });
  }
}
