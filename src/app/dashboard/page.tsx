import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - Employee Training Platform',
  description: 'View your training schedule and swap requests',
};

export default async function DashboardPage() {
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
  const pendingSwapRequests = await prisma.swapRequest.findMany({
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
  
  // Get user's notifications
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      read: false
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user.name || `Employee ${user.employeeId}`}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Training Group</CardTitle>
            <CardDescription>Your assigned training group</CardDescription>
          </CardHeader>
          <CardContent>
            {currentGroup ? (
                    <Link href={`/groups/${currentGroup.id}`}>
              <div className="space-y-2">
                <p className="font-medium">{currentGroup.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentGroup.startDate)} - {formatDate(currentGroup.endDate)}
                </p>
                <p className="text-sm">
                  {currentGroup.users.length} of {currentGroup.maxSize} participants
                </p>
              </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">You are not assigned to any group yet.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Swap Requests</CardTitle>
            <CardDescription>Your active swap requests</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingSwapRequests.length > 0 ? (
              <div className="space-y-2">
                {pendingSwapRequests.map((request) => (
                  <div key={request.id} className="text-sm">
                    <p className="font-medium">Request to join {request.targetGroup.name}</p>
                    <p className="text-muted-foreground">
                      Expires: {formatDate(request.expiresAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending swap requests.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className="text-sm">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-muted-foreground">{notification.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No new notifications.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 