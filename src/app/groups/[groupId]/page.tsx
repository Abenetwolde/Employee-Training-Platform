 ''
 import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
// Server action to handle "go back"
async function goBack(formData: FormData) {
  'use server';

  const from = formData.get('from') as string;
  redirect(from || '/dashboard');
}
export async function generateMetadata({
  params,
}: {
  params: { groupId: string };
}): Promise<Metadata> {
  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
  });

  return {
    title: `${group?.name || 'Group'} Details - Employee Training Platform`,
    description: `View details of ${group?.name || 'this group'}`,
  };
}

export default async function GroupDetailsPage({
  params,
  searchParams,
}: {
  params: { groupId: string };
  searchParams: { from?: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Middleware will handle redirect
  }

  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    include: {
      users: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

// Get the 'from' query parameter
const from = searchParams.from || '';
  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <Link href="/dashboard" className="mt-4">
          <Button variant="outline">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
      {/* <Button
      variant="outline"
      size="icon"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button> */}
    <form action={goBack}>
        <input type="hidden" name="from" value={from} />
        <Button
          type="submit"
          variant="outline"
          size="icon"
          aria-label="Go back to the previous page"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </form>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">
            {formatDate(group.startDate)} - {formatDate(group.endDate)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={group.users}
            emptyMessage="No members in this group"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}