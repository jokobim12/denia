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

    const existing = await prisma.photo.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (existing?.imageUrl) {
      await deleteFromSupabaseStorage(existing.imageUrl);
    }

    await prisma.photo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error: unknown) {
    console.error('DELETE photo error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete photo';
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
    const body = await req.json();
    const { title, description, eventDate, imageUrl } = body;

    const existing = await prisma.photo.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (imageUrl && existing?.imageUrl && existing.imageUrl !== imageUrl) {
      await deleteFromSupabaseStorage(existing.imageUrl);
    }

    const dataToUpdate: Prisma.PhotoUpdateInput = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (eventDate !== undefined) dataToUpdate.eventDate = new Date(eventDate);
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;

    const photo = await prisma.photo.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(photo);
  } catch (error: unknown) {
    console.error('PUT photo error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update photo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

