import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Banner: React.FC = () => {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-primary text-primary-foreground">
      <AlertDescription className="text-center">
        Start your free trial with Offscreen and help your family build healthier digital habits{' '}
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:text-primary-foreground/80"
        >
          Get Started
          <ExternalLink className="h-3 w-3" />
        </Link>
      </AlertDescription>
    </Alert>
  );
};

export default Banner;
