import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, getTimeRemaining } from '@/lib/utils';
import SwapRequestActions from '@/components/forms/swap-request-actions';

export const metadata: Metadata = {
  title: 'Swap Request Details - Employee Training Platform',
  description: 'View and manage swap request details',
};

export default async function SwapRequestPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Middleware will handle redirect
  }
  
  // Get swap request
  const swapRequest = await prisma.swapRequest.findUnique({
    where: { id: params.id },
    include: {
      requestingUser: true,
      targetGroup: {
        include: { users: true }
      }
    }
  });
  
  if (!swapRequest) {
    notFound();
  }
  
  // Get user's current group
  const currentGroup = user.groupId 
    ? await prisma.group.findUnique({
        where: { id: user.groupId },
        include: { users: true }
      })
    : null;
  
  // Check if user is the requester or in the target group
  const isRequester = swapRequest.requestingUserId === user.id;
  const isInTargetGroup = currentGroup?.id === swapRequest.targetGroupId;
  
  // Check if request is still valid
  const isExpired = new Date(swapRequest.expiresAt) < new Date();
  const isActive = swapRequest.status === 'pending' && !isExpired;
  
  // Get requesting user's current group
  const requesterGroup = swapRequest.requestingUser.groupId
    ? await prisma.group.findUnique({
        where: { id: swapRequest.requestingUser.groupId },
        include: { users: true }
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Swap Request Details</h1>
        <p className="text-muted-foreground">
          View and manage swap request details
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Information about this swap request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className={`text-sm ${
                  swapRequest.status === 'pending' 
                    ? isExpired 
                      ? 'text-red-600' 
                      : 'text-amber-600' 
                    : swapRequest.status === 'accepted' 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                }`}>
                  {swapRequest.status === 'pending' 
                    ? isExpired 
                      ? 'Expired' 
                      : 'Pending' 
                    : swapRequest.status.charAt(0).toUpperCase() + swapRequest.status.slice(1)}
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm">{formatDate(swapRequest.createdAt)}</p>
              </div>
              
              {swapRequest.status === 'pending' && !isExpired && (
                <div>
                  <p className="text-sm font-medium">Expires</p>
                  <p className="text-sm text-amber-600">{getTimeRemaining(swapRequest.expiresAt)}</p>
                </div>
              )}
              
              {swapRequest.status === 'accepted' && swapRequest.offeringUserId && (
                <div>
                  <p className="text-sm font-medium">Accepted By</p>
                  <p className="text-sm">
                    {swapRequest.offeringUser?.name || `Employee ${swapRequest.offeringUser?.employeeId}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Groups Involved</CardTitle>
            <CardDescription>
              The groups involved in this swap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">From Group</p>
                {requesterGroup ? (
                  <>
                    <p>{requesterGroup.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(requesterGroup.startDate)} - {formatDate(requesterGroup.endDate)}
                    </p>
                    <p className="text-sm">
                      {requesterGroup.users.length} of {requesterGroup.maxSize} participants
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No group assigned</p>
                )}
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="font-medium">To Group</p>
                <p>{swapRequest.targetGroup.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(swapRequest.targetGroup.startDate)} - {formatDate(swapRequest.targetGroup.endDate)}
                </p>
                <p className="text-sm">
                  {swapRequest.targetGroup.users.length} of {swapRequest.targetGroup.maxSize} participants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isActive && (isRequester || isInTargetGroup) && (
        <SwapRequestActions 
          swapRequest={swapRequest} 
          currentUser={user} 
          isRequester={isRequester} 
          isInTargetGroup={isInTargetGroup} 
        />
      )}
    </div>
  );
} 