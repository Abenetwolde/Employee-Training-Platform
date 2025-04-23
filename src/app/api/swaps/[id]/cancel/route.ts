import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
      },
    });

    if (!swapRequest) {
      return new NextResponse('Swap request not found', { status: 404 });
    }

    if (swapRequest.status !== 'pending') {
      return new NextResponse('Swap request is not pending', { status: 400 });
    }

    // Only the requesting user can cancel the swap request
    if (swapRequest.requestingUser.id !== currentUser.id) {
      return new NextResponse('Only the requesting user can cancel the swap request', { status: 403 });
    }

    // Update the swap request status to cancelled
    const updatedSwapRequest = await prisma.swapRequest.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
      },
    });

    return NextResponse.json(updatedSwapRequest);
  } catch (error) {
    console.error('Error cancelling swap request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 