import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { siteMeta } from '@/content/baExpress';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#bf1d23',
};

export const metadata: Metadata = {
  title: `${siteMeta.name} | Last-mile delivery London & Kent`,
  description: siteMeta.description,
  metadataBase: new URL(siteMeta.url),
  openGraph: {
    title: `${siteMeta.name} — London logistics`,
    description: siteMeta.description,
    url: siteMeta.url,
    siteName: siteMeta.name,
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${montserrat.variable}`}>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
