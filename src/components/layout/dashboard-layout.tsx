'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xl font-bold">
              Training Platform
            </Link>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </header>
      
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <aside className="hidden md:block">
            <Card className="p-4">
              <Tabs value={pathname} className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <Link href="/dashboard" className="w-full">
                    <TabsTrigger value="/dashboard" className="w-full justify-start">
                      Dashboard
                    </TabsTrigger>
                  </Link>
                  <Link href="/groups" className="w-full">
                    <TabsTrigger value="/groups" className="w-full justify-start">
                      Training Groups
                    </TabsTrigger>
                  </Link>
                  <Link href="/swaps" className="w-full">
                    <TabsTrigger value="/swaps" className="w-full justify-start">
                      Swap Requests
                    </TabsTrigger>
                  </Link>
                  <Link href="/notifications" className="w-full">
                    <TabsTrigger value="/notifications" className="w-full justify-start">
                      Notifications
                    </TabsTrigger>
                  </Link>
                </TabsList>
              </Tabs>
            </Card>
          </aside>
          
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
} 