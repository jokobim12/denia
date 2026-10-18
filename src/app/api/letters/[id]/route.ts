import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.letter.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Letter deleted successfully' });
  } catch (error: unknown) {
    console.error('DELETE letter error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete letter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, category } = await req.json();

    const dataToUpdate: Prisma.LetterUpdateInput = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (content !== undefined) dataToUpdate.content = content;
    if (category !== undefined) dataToUpdate.category = category;

    const letter = await prisma.letter.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(letter);
  } catch (error: unknown) {
    console.error('PUT letter error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update letter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

