// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tumkur AutoConnect — ERP & Marketplace',
  description:
    'Enterprise platform bridging factories, workers, training institutes, transport, and contractors in the Tumkur auto-component industrial sector.',
  keywords: ['Tumkur', 'auto components', 'ERP', 'workers', 'factory', 'jobs'],
  authors: [{ name: 'Roaring Thunders' }],
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
