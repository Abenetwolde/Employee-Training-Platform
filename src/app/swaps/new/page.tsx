import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, isGroupAvailable, canSwapGroups } from '@/lib/utils';
import Link from 'next/link';
import NewSwapForm from '@/components/forms/new-swap-form';

export const metadata: Metadata = {
  title: 'New Swap Request - Employee Training Platform',
  description: 'Create a new swap request',
};

export default async function NewSwapPage({
  searchParams,
}: {
  searchParams: { targetGroupId?: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Middleware will handle redirect
  }
  
  // Get user's current group
  const currentGroup = user.groupId 
    ? await prisma.group.findUnique({
        where: { id: user.groupId },
        include: { users: true }
      })
    : null;
  
  // Get all available groups
  const groups = await prisma.group.findMany({
    where: {
      id: { not: user.groupId }, // Exclude user's current group
    },
    include: { users: true },
    orderBy: { startDate: 'asc' }
  });
  
  // Filter groups that are available for swapping
  const availableGroups = groups.filter(group => 
    isGroupAvailable(group) && 
    (currentGroup ? canSwapGroups(currentGroup, group) : false)
  );
  
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
  
  // Pre-selected group from URL
  const preselectedGroupId = searchParams.targetGroupId;
  const preselectedGroup = preselectedGroupId 
    ? availableGroups.find(group => group.id === preselectedGroupId)
    : null;

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
            <p>You are not currently assigned to any training group. Please contact an administrator to be assigned to a group.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : availableGroups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Available Groups</CardTitle>
            <CardDescription>There are no groups available for swapping</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There are currently no groups available for swapping. This could be because:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>All groups are full</li>
              <li>Your current group is too small to allow swapping</li>
              <li>No groups meet the balance requirements</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/groups">
              <Button variant="outline">View All Groups</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <NewSwapForm 
          currentGroup={currentGroup} 
          availableGroups={availableGroups} 
          pendingGroupIds={pendingGroupIds}
          preselectedGroupId={preselectedGroupId}
        />
      )}
    </div>
  );
} 