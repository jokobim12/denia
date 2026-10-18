import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const letters = await prisma.letter.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(letters, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    console.error('GET letters error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch letters';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const letter = await prisma.letter.create({
      data: {
        title,
        content,
        category,
      },
    });

    return NextResponse.json(letter);
  } catch (error: unknown) {
    console.error('POST letter error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create letter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
