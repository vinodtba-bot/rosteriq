import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RosterIQ™',
  description: 'Provider roster management and compliance',
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
