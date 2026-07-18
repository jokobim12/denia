import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

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
  } catch (error: any) {
    console.error('DELETE letter error:', error);
    return NextResponse.json({ error: 'Failed to delete letter' }, { status: 500 });
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

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (content !== undefined) dataToUpdate.content = content;
    if (category !== undefined) dataToUpdate.category = category;

    const letter = await prisma.letter.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(letter);
  } catch (error: any) {
    console.error('PUT letter error:', error);
    return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
  }
}
