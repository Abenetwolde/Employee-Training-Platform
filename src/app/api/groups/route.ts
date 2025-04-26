import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const group = await prisma.group.create({
      data: {
        name,
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxSize: 10,
        users: { create: [] },
        swapRequests: { create: [] },
        createdAt: now,
        updatedAt: now
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Group creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        _count: {
          select: { users: true }
        }
      }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}