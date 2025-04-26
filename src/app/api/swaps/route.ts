// src/app/api/swaps/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { targetGroupId } = await request.json();

    if (!targetGroupId) {
      return NextResponse.json(
        { error: 'Target group ID is required' },
        { status: 400 }
      );
    }

    // Verify the requesting user exists with proper where clause
    const requestingUser = await prisma.user.findUnique({
      where: { 
        id: session.user.id // Use the ID from session
      },
      include: { 
        currentGroup: true 
      }
    });

    if (!requestingUser || !requestingUser.currentGroup) {
      return NextResponse.json(
        { error: 'User not found or not in a group' },
        { status: 400 }
      );
    }

    // Rest of your swap request creation logic...
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const swapRequest = await prisma.swapRequest.create({
      data: {
        requestingUserId: requestingUser.id,
        targetGroupId: targetGroupId,
        status: 'pending',
        expiresAt,
        createdAt: now,
        updatedAt: now
      }
    });

    return NextResponse.json(swapRequest);
    
  } catch (error) {
    console.error('Swap request creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create swap request' },
      { status: 500 }
    );
  }
}