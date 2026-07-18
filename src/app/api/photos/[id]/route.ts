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

    await prisma.photo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error: any) {
    console.error('DELETE photo error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
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

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (eventDate !== undefined) dataToUpdate.eventDate = new Date(eventDate);
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;

    const photo = await prisma.photo.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(photo);
  } catch (error: any) {
    console.error('PUT photo error:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
