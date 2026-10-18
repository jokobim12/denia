import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { deleteFromSupabaseStorage } from '@/lib/supabase';
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

    const existing = await prisma.timeline.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (existing?.imageUrl) {
      await deleteFromSupabaseStorage(existing.imageUrl);
    }

    await prisma.timeline.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Wish deleted successfully' });
  } catch (error: unknown) {
    console.error('DELETE wish error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete wish';
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
    const { title, description, imageUrl, eventDate } = await req.json();

    const existing = await prisma.timeline.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (imageUrl && existing?.imageUrl && existing.imageUrl !== imageUrl) {
      await deleteFromSupabaseStorage(existing.imageUrl);
    }

    const dataToUpdate: Prisma.TimelineUpdateInput = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (eventDate !== undefined) dataToUpdate.eventDate = new Date(eventDate);

    const wish = await prisma.timeline.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(wish);
  } catch (error: unknown) {
    console.error('PUT wish error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update wish';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

