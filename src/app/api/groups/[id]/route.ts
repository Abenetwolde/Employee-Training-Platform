import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the group ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Group fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}