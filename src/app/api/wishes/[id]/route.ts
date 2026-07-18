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

    await prisma.timeline.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Wish deleted successfully' });
  } catch (error: any) {
    console.error('DELETE wish error:', error);
    return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 });
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
    const { title, description, imageUrl, eventDate } = await req.json();

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (eventDate !== undefined) dataToUpdate.eventDate = new Date(eventDate);

    const wish = await prisma.timeline.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(wish);
  } catch (error: any) {
    console.error('PUT wish error:', error);
    return NextResponse.json({ error: 'Failed to update wish' }, { status: 500 });
  }
}
