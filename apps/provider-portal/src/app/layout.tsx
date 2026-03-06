import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RosterIQ™ Provider Portal',
  description: 'Provider roster and schedule management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
