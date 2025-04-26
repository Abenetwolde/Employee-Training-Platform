"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Group, SwapRequest } from '@prisma/client';

interface SwapRequestWithRelations extends SwapRequest {
  requestingUser: User;
  targetGroup: Group & { users: User[] };
  offeringUser?: User | null;
}

interface SwapRequestActionsProps {
  swapRequest: SwapRequestWithRelations;
  currentUser: User;
  isRequester: boolean;
  isInTargetGroup: boolean;
}

export default function SwapRequestActions({
  swapRequest,
  currentUser,
  isRequester,
  isInTargetGroup,
}: SwapRequestActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/swaps/${swapRequest.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to accept swap request');
      }

      toast.success('Swap request accepted successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept swap request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/swaps/${swapRequest.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel swap request');
      }

      toast.success('Swap request cancelled successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel swap request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>
          {isRequester
            ? 'You can cancel this swap request'
            : 'You can accept this swap request to swap groups'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isRequester ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  Cancel Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Swap Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this swap request? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
                    Yes, cancel request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isLoading}>
                  Accept Swap Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accept Swap Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to accept this swap request? You will be swapped with{' '}
                    {swapRequest.requestingUser.name || `Employee ${swapRequest.requestingUser.employeeId}`} into their group.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAccept} disabled={isLoading}>
                    Yes, accept swap
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 