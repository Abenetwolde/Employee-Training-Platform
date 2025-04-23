import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: params.id },
      include: {
        requestingUser: true,
        targetGroup: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!swapRequest) {
      return new NextResponse('Swap request not found', { status: 404 });
    }

    if (swapRequest.status !== 'pending') {
      return new NextResponse('Swap request is not pending', { status: 400 });
    }

    // Check if the current user is in the target group
    const isInTargetGroup = swapRequest.targetGroup.users.some(
      (user: { id: string }) => user.id === currentUser.id
    );

    if (!isInTargetGroup) {
      return new NextResponse('You are not in the target group', { status: 403 });
    }

    // Start a transaction to update both users' groups
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update the swap request status
      const updatedSwapRequest = await tx.swapRequest.update({
        where: { id: params.id },
        data: {
          status: 'accepted',
          offeringUser: {
            connect: { id: currentUser.id },
          },
        },
      });

      // Move the requesting user to the target group
      await tx.user.update({
        where: { id: swapRequest.requestingUser.id },
        data: {
          groupId: swapRequest.targetGroupId,
        },
      });

      // Move the accepting user to the requesting user's group
      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          groupId: swapRequest.requestingUser.groupId,
        },
      });

      return updatedSwapRequest;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error accepting swap request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 