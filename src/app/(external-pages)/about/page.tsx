import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { T } from '@/components/ui/Typography';
import {
  ArrowRight,
  BarChart3,
  Clock,
  Monitor,
  Rocket,
  Shield,
  Smartphone,
  Users
} from 'lucide-react';
import Link from 'next/link';


export default function About() {
  return (
    <>
      <div className="container mx-auto py-12 space-y-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            About Offscreen
          </Badge>
          <T.H1 className="text-4xl sm:text-5xl md:text-6xl">
            Digital Family{' '}
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              Connection Hub
            </span>
          </T.H1>
          <T.P className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            Helping families build healthy digital habits and stay connected in today's
            screen-filled world through intelligent screen time management and activity tracking.
          </T.P>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="group" asChild>
              <Link href="/login">
                Start Free Trial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <T.H2 className="text-3xl">Built for Modern Families</T.H2>
            <T.P className="text-muted-foreground">
              Everything you need to create healthy digital habits and stay connected
            </T.P>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Screen Time Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set healthy limits and track screen time across all devices with
                  easy-to-use parental controls and real-time monitoring.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                    <BarChart3 className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle>Activity Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get detailed insights into how your family spends time online with
                  comprehensive activity reports and usage analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Family Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage all family members from one central dashboard with
                  real-time updates, alerts, and comprehensive controls.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                    <Shield className="h-6 w-6 text-chart-4" />
                  </div>
                  <CardTitle>Safe Browsing</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Protect your family with built-in content filtering and safe
                  browsing controls for all ages and devices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                    <Smartphone className="h-6 w-6 text-chart-1" />
                  </div>
                  <CardTitle>App Blocking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Control access to specific apps and set age-appropriate limits
                  for different family members with flexible scheduling.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10">
                    <Monitor className="h-6 w-6 text-chart-5" />
                  </div>
                  <CardTitle>Cross-Platform</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Works seamlessly across iOS, Android, Windows, and Mac to
                  protect all your family devices with one unified solution.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Empty className="border-2 border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Rocket />
            </EmptyMedia>
            <EmptyTitle>Ready to Reconnect Your Family?</EmptyTitle>
            <EmptyDescription>
              Start your free trial today and take the first step toward healthier
              digital habits and stronger family connections.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" className="group" asChild>
                <Link href="/login">
                  Start Free Trial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>

        {/* Tech Stack Section */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>
              Built with modern, secure technologies to protect your family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <Badge>React</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>TypeScript</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Next.js</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Tailwind CSS</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Supabase</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Real-time Sync</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Secure Auth</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Cross-Platform</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
