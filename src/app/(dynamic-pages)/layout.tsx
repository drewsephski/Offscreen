

import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/images/logo-black-main.ico',
  },
  title: 'Offscreen - Digital Family Hub',
  description: 'Keep your family connected with healthy digital habits and screen time management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
