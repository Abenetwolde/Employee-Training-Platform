'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Group {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  maxSize: number;
  users: any[];
}

interface NewSwapFormProps {
  currentGroup: Group;
  availableGroups: Group[];
  pendingGroupIds: string[];
  preselectedGroupId?: string;
}

export default function NewSwapForm({ 
  currentGroup, 
  availableGroups, 
  pendingGroupIds,
  preselectedGroupId
}: NewSwapFormProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(preselectedGroupId || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroupId) {
      toast.error('Please select a group to swap with');
      return;
    }
    
    if (pendingGroupIds.includes(selectedGroupId)) {
      toast.error('You already have a pending request for this group');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetGroupId: selectedGroupId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create swap request');
      }
      
      toast.success('Swap request created successfully');
      router.push('/swaps');
    } catch (error) {
      console.error('Swap request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create swap request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Swap Request</CardTitle>
        <CardDescription>
          Select a group you want to swap with
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium">Your Current Group</h3>
              <p>{currentGroup.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(currentGroup.startDate)} - {formatDate(currentGroup.endDate)}
              </p>
              <p className="text-sm">
                {currentGroup.users.length} of {currentGroup.maxSize} participants
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="targetGroup" className="text-sm font-medium">
                Select Target Group
              </label>
              <div className="grid gap-2">
                {availableGroups.map((group) => {
                  const isPending = pendingGroupIds.includes(group.id);
                  
                  return (
                    <div 
                      key={group.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedGroupId === group.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isPending && setSelectedGroupId(group.id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(group.startDate)} - {formatDate(group.endDate)}
                          </p>
                        </div>
                        <div className="text-sm">
                          {group.users.length} of {group.maxSize} participants
                        </div>
                      </div>
                      {isPending && (
                        <p className="text-sm text-amber-600 mt-1">Request already pending</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/swaps')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!selectedGroupId || isLoading}
          >
            {isLoading ? 'Creating Request...' : 'Create Swap Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 