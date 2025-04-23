import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canSwapGroups } from '@/lib/utils';

const swapRequestSchema = z.object({
  targetGroupId: z.string().min(1, 'Target group ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const result = swapRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { targetGroupId } = result.data;
    
    // Get user's current group
    const currentGroup = user.groupId 
      ? await prisma.group.findUnique({
          where: { id: user.groupId },
          include: { users: true }
        })
      : null;
    
    if (!currentGroup) {
      return NextResponse.json(
        { error: 'You must be assigned to a group to request a swap' },
        { status: 400 }
      );
    }
    
    // Get target group
    const targetGroup = await prisma.group.findUnique({
      where: { id: targetGroupId },
      include: { users: true }
    });
    
    if (!targetGroup) {
      return NextResponse.json(
        { error: 'Target group not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has a pending request for this group
    const existingRequest = await prisma.swapRequest.findFirst({
      where: {
        requestingUserId: user.id,
        targetGroupId,
        status: 'pending',
        expiresAt: { gt: new Date() }
      }
    });
    
    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this group' },
        { status: 400 }
      );
    }
    
    // Check if swap is allowed (group balance constraints)
    if (!canSwapGroups(currentGroup, targetGroup)) {
      return NextResponse.json(
        { error: 'This swap would violate group balance constraints' },
        { status: 400 }
      );
    }
    
    // Create swap request (expires in 48 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    const swapRequest = await prisma.swapRequest.create({
      data: {
        requestingUserId: user.id,
        targetGroupId,
        status: 'pending',
        expiresAt
      }
    });
    
    // Create notification for users in the target group
    const targetGroupUsers = await prisma.user.findMany({
      where: { groupId: targetGroupId }
    });
    
    if (targetGroupUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetGroupUsers.map(targetUser => ({
          userId: targetUser.id,
          title: 'New Swap Request',
          message: `${user.name || `Employee ${user.employeeId}`} has requested to swap into your group.`,
          type: 'swap_request'
        }))
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      swapRequest: {
        id: swapRequest.id,
        status: swapRequest.status,
        expiresAt: swapRequest.expiresAt
      }
    });
  } catch (error) {
    console.error('Swap request error:', error);
    return NextResponse.json(
      { error: 'Failed to create swap request' },
      { status: 500 }
    );
  }
} 