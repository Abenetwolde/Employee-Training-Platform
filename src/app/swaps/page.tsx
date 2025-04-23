import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, getTimeRemaining } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Swap Requests - Employee Training Platform',
  description: 'View and manage swap requests',
};

export default async function SwapsPage() {
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
  
  // Get user's pending swap requests
  const mySwapRequests = await prisma.swapRequest.findMany({
    where: {
      requestingUserId: user.id,
      status: 'pending',
      expiresAt: { gt: new Date() }
    },
    include: {
      targetGroup: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Get swap requests for user's current group
  const incomingSwapRequests = currentGroup
    ? await prisma.swapRequest.findMany({
        where: {
          targetGroupId: currentGroup.id,
          status: 'pending',
          expiresAt: { gt: new Date() },
          requestingUserId: { not: user.id } // Exclude user's own requests
        },
        include: {
          requestingUser: true,
          targetGroup: true
        },
        orderBy: { createdAt: 'desc' }
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
          <p className="text-muted-foreground">
            View and manage your swap requests
          </p>
        </div>
        <Link href="/swaps/new">
          <Button>New Swap Request</Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Swap Requests</CardTitle>
            <CardDescription>Requests you've made to join other groups</CardDescription>
          </CardHeader>
          <CardContent>
            {mySwapRequests.length > 0 ? (
              <div className="space-y-4">
                {mySwapRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Request to join {request.targetGroup.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-amber-600">
                        {getTimeRemaining(request.expiresAt)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link href={`/swaps/${request.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You don't have any pending swap requests.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Incoming Swap Requests</CardTitle>
            <CardDescription>Requests from others to join your group</CardDescription>
          </CardHeader>
          <CardContent>
            {incomingSwapRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingSwapRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {request.requestingUser.name || `Employee ${request.requestingUser.employeeId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-amber-600">
                        {getTimeRemaining(request.expiresAt)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link href={`/swaps/${request.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No incoming swap requests.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 