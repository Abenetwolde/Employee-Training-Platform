'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Group {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  _count: { users: number };
}

export default function LoginForm() {
  const [employeeId, setEmployeeId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/dashboard';
  const preFilledGroupId = searchParams.get('groupId');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(data);
        if (preFilledGroupId) setGroupId(preFilledGroupId);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups');
      }
    };

    fetchGroups();
  }, [preFilledGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId.trim()) {
      toast.error('Please enter your employee ID');
      return;
    }

    if (!groupId) {
      toast.error('Please select a group');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        employeeId,
        groupId,
        redirect: false,
      });
      
      if (result?.error) throw new Error(result.error);
      
      toast.success('Login successful');
      router.push(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="employeeId" className="text-sm font-medium">
                Employee ID
              </label>
              <Input
                id="employeeId"
                type="text"
                placeholder="Enter your employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="group" className="text-sm font-medium">
                Group
              </label>
              <Select
                value={groupId}
                onValueChange={setGroupId}
                disabled={isLoading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem
                      key={group.id}
                      value={group.id}
                      disabled={group._count.users >= 10}
                    >
                      {group.name} ({group._count.users}/10 members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have a group?{' '}
              <Link href="/groups/create" className="text-primary hover:underline">
                Create one
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}