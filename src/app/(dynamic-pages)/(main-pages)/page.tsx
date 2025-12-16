import { ExternalNavigation } from '@/app/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


export default function LandingPage() {
  return (
    <>
      <ExternalNavigation />

      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent dark:from-primary/10 dark:via-transparent dark:to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Badge variant="outline" className="inline-flex items-center">
                <span className="text-primary">Offscreen</span>
                <span className="mx-1.5 text-muted-foreground">•</span>
                <span>Digital Family Hub</span>
              </Badge>
              <T.H1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
                Keep your family
                <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                  {' '}
                  connected
                </span>
              </T.H1>
              <T.P className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Offscreen helps families stay connected in the digital age. Manage screen time,
                track activities, and create healthy digital habits together.
              </T.P>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="group" asChild>
                <Link href="/login">
                  Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 md:mt-24 flex justify-center">
            <div className="relative w-full max-w-5xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary rounded-xl blur opacity-25"></div>
              <div className="relative overflow-hidden rounded-xl border bg-background shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"></div>
                <Image
                  src="/images/gemini2.png"
                  alt="Offscreen family dashboard preview"
                  className="w-full h-auto"
                  width={1600}
                  height={900}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[850px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-balance">
                Designed for modern families
              </T.H2>
              <T.P className="text-lg text-muted-foreground md:text-xl">
                Offscreen provides the tools you need to create healthy digital habits
                and keep your family connected in today's screen-filled world.
              </T.P>
            </div>

            <div className="w-full grid max-w-6xl gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="h-full flex flex-col transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="flex-none">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-start">
                    <CardDescription className="text-center text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <Badge variant="outline" className="w-fit">
                <Star className="mr-1.5 h-3.5 w-3.5 text-chart-1 fill-chart-1" />
                <span>Why families love Offscreen</span>
              </Badge>
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-balance">
                Built for families, by parents who get it
              </T.H2>
              <T.P className="text-lg text-muted-foreground">
                We understand the challenges of raising kids in a digital world. Offscreen
                was created to help families find the right balance between technology and
                real-life connections, making screen time management simple and stress-free.
              </T.P>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="group" asChild>
                  <Link href="/login">
                    Start Free Trial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">See How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-50 blur-3xl"></div>
              <div className="relative overflow-hidden rounded-xl border bg-background shadow-xl">
                <Image
                  src="/images/gemini.png"
                  alt="Family managing devices together"
                  className="w-full h-auto"
                  width={1200}
                  height={800}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[800px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-balance">
                Ready to reconnect your family?
              </T.H2>
              <T.P className="mx-auto max-w-[700px] text-lg text-primary-foreground/90 md:text-xl">
                Join thousands of families who have found the perfect balance with Offscreen.
                Start your free trial today and take the first step toward healthier digital habits.
              </T.P>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="group" asChild>
                <Link href="/login">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary group"
                asChild
              >
                <Link href="/about">
                  Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const features = [
  {
    title: 'Screen Time Management',
    description:
      'Set healthy limits and track screen time across all devices with easy-to-use parental controls.',
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Activity Insights',
    description:
      'Get detailed insights into how your family spends time online with comprehensive activity reports.',
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
        <rect height="7" rx="2" ry="2" width="18" x="3" y="2" />
        <line x1="7" x2="7" y1="11" y2="15" />
        <line x1="11" x2="11" y1="11" y2="15" />
        <line x1="7" x2="7" y1="2" y2="6" />
      </svg>
    ),
  },
  {
    title: 'Family Dashboard',
    description:
      'Manage all family members from one central dashboard with real-time updates and alerts.',
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
        <line x1="4" x2="8" y1="16" y2="16" />
        <line x1="4" x2="8" y1="20" y2="20" />
        <line x1="16" x2="16" y1="4" y2="8" />
        <line x1="20" x2="20" y1="4" y2="8" />
      </svg>
    ),
  },
  {
    title: 'Safe Browsing',
    description:
      'Protect your family with built-in content filtering and safe browsing controls for all ages.',
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'App Blocking',
    description:
      'Control access to specific apps and set age-appropriate limits for different family members.',
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="19" x2="5" y1="12" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Cross-Platform',
    description:
      'Works seamlessly across iOS, Android, Windows, and Mac to protect all your family devices.',
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];
