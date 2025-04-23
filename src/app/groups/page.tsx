import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, isGroupAvailable, canSwapGroups } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Training Groups - Employee Training Platform',
  description: 'View and manage training groups',
};

export default async function GroupsPage() {
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
  
  // Get all groups
  const groups = await prisma.group.findMany({
    include: { users: true },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Groups</h1>
        <p className="text-muted-foreground">
          View all training groups and request swaps
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const isUserInGroup = currentGroup?.id === group.id;
          const hasPendingRequest = pendingGroupIds.includes(group.id);
          const isAvailable = isGroupAvailable(group);
          const canSwap = currentGroup ? canSwapGroups(currentGroup, group) : false;
          
          return (
            <Card key={group.id} className={isUserInGroup ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {formatDate(group.startDate)} - {formatDate(group.endDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{group.users.length}</span> of <span className="font-medium">{group.maxSize}</span> participants
                  </p>
                  {isUserInGroup && (
                    <p className="text-sm text-primary font-medium">Your current group</p>
                  )}
                  {hasPendingRequest && (
                    <p className="text-sm text-amber-600 font-medium">Swap request pending</p>
                  )}
                  {!isUserInGroup && !hasPendingRequest && isAvailable && (
                    <p className="text-sm text-green-600 font-medium">Available for swap</p>
                  )}
                  {!isUserInGroup && !hasPendingRequest && !isAvailable && (
                    <p className="text-sm text-red-600 font-medium">Group is full</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {isUserInGroup ? (
                  <Button variant="outline" className="w-full" disabled>
                    Your Current Group
                  </Button>
                ) : hasPendingRequest ? (
                  <Button variant="outline" className="w-full" disabled>
                    Request Pending
                  </Button>
                ) : canSwap ? (
                  <Link href={`/swaps/new?targetGroupId=${group.id}`} className="w-full">
                    <Button className="w-full">Request Swap</Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {isAvailable ? 'Not Eligible' : 'Group Full'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 