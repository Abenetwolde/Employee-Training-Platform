import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import NewSwapForm from '@/components/forms/new-swap-form';

export const metadata: Metadata = {
  title: 'New Swap Request - Employee Training Platform',
  description: 'Create a new swap request',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewSwapPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Middleware will handle redirect
  }
  
  // Get user's current group with required fields
  const currentGroup = user.groupId 
    ? await prisma.group.findUnique({
        where: { id: user.groupId },
        include: { 
          users: { select: { id: true } } // Only include necessary fields
        }
      })
    : null;
  
  // Get all available groups with required fields
  const groups = await prisma.group.findMany({
    where: {
      id: { not: user.groupId }, // Exclude user's current group
      endDate: { gt: new Date() } // Only active groups
    },
    include: { 
      users: { select: { id: true } } // Only include necessary fields
    },
    orderBy: { startDate: 'asc' }
  });
  
  // Get user's pending swap requests
  const pendingSwapRequests = await prisma.swapRequest.findMany({
    where: {
      requestingUserId: user.id,
      status: 'pending',
      expiresAt: { gt: new Date() }
    },
    select: { targetGroupId: true }
  });
  
  const pendingGroupIds = pendingSwapRequests.map(request => request.targetGroupId);
  
  // Pre-selected group from URL with proper type checking
  const preselectedGroupId = typeof searchParams?.targetGroupId === 'string' 
    ? searchParams?.targetGroupId 
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Swap Request</h1>
        <p className="text-muted-foreground">
          Request to swap with another training group
        </p>
      </div>
      
      {!currentGroup ? (
        <Card>
          <CardHeader>
            <CardTitle>No Current Group</CardTitle>
            <CardDescription>You need to be assigned to a group first</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are not currently assigned to any training group.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Available Groups</CardTitle>
            <CardDescription>There are no groups available for swapping</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There are currently no groups available for swapping.</p>
          </CardContent>
          <CardFooter>
            <Link href="/groups">
              <Button variant="outline">View All Groups</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <NewSwapForm 
          currentGroup={{
            id: currentGroup.id,
            name: currentGroup.name,
            startDate: currentGroup.startDate,
            endDate: currentGroup.endDate,
            maxSize: currentGroup.maxSize,
            users: currentGroup.users
          }} 
          availableGroups={groups.map(g => ({
            id: g.id,
            name: g.name,
            startDate: g.startDate,
            endDate: g.endDate,
            maxSize: g.maxSize,
            users: g.users
          }))} 
          pendingGroupIds={pendingGroupIds}
          preselectedGroupId={preselectedGroupId}
        />
      )}
    </div>
  );
}