import type { Metadata } from 'next';
import { Courier_Prime, Inter, Newsreader } from 'next/font/google';
import { site } from '@/content/site';
import './globals.css';

/**
 * Newsreader is loaded at 700 as well as 400/500/600. The export's Google Fonts
 * URL requested only 400;500;600 while styling every section heading at
 * font-weight 700, so those headings were rendering as synthesised bold. 700 is
 * loaded here so they render in the real cut.
 */
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-newsreader',
  display: 'swap',
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier-prime',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: site.locale,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: [site.ogImage],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${courierPrime.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
