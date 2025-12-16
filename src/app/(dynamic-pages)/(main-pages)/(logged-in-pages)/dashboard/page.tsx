'use client';

import { FamilySectionWrapper } from '@/components/Dashboard/FamilySectionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { T } from '@/components/ui/Typography';
import { PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <T.H1>Dashboard</T.H1>
      <div className="flex gap-2">
        <Link href="/dashboard/new">
          <Button variant="outline" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New Private Item
          </Button>
        </Link>
        <Link href="/dashboard/sessions">
          <Button className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Coaching Sessions
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const handleChildAdded = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Heading />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <FamilySectionWrapper onChildAdded={handleChildAdded} />
      </Suspense>
      <Suspense fallback={<ListSkeleton />}>
      </Suspense>
    </div>
  );
}
