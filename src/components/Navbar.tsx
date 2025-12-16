'use client';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="w-full border-b bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <Button variant="ghost" asChild>
                        <Link href="/">Offscreen</Link>
                    </Button>

                    <div className="flex items-center gap-4">
                        <AnimatedThemeToggler className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground" />

                        <Button className="group" asChild>
                            <Link href="/login">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
