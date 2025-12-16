import { T } from '@/components/ui/Typography';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import CopyrightYear from './CopyrightYear';


const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={'/logos/acme-logo-dark.png'}
              className="dark:hidden"
              width={24}
              height={24}
              alt="Offscreen Logo"
            />
            <Image
              src={'/logos/acme-logo-light.png'}
              className="hidden dark:block"
              width={24}
              height={24}
              alt="Offscreen Logo"
            />
            <T.H3 className="text-lg font-semibold mb-8">Offscreen</T.H3>
          </Link>

          <nav className="flex items-center space-x-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </nav>

          <T.Small className="text-muted-foreground">
            © <Suspense fallback={<span>2024</span>}>
              <CopyrightYear />
            </Suspense> Offscreen. All rights reserved.
          </T.Small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
