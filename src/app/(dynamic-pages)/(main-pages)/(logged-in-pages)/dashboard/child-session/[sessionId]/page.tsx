import { notFound } from 'next/navigation';
import SessionFlow from '@/components/SessionFlow';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChildSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  // In a real app, validate session exists and user has access
  // For now, just render the component

  if (!sessionId) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <SessionFlow sessionId={sessionId} />
    </div>
  );
}
