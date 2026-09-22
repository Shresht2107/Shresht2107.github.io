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

/**
 * Runs before anything paints, so the page never visibly jumps.
 *
 * Browsers restore the previous scroll position on reload, which would drop a
 * returning visitor into the middle of the page with the intro already playing
 * above them. Turning restoration off has to happen before the browser acts on
 * it, which is why this is an inline head script and not an effect.
 *
 * Nav clicks never write a hash, but one can still arrive from an external
 * link or an old bookmark; it is cleared so the intro plays from the top.
 */
const SCROLL_RESET = `(function(){try{
if('scrollRestoration' in history){history.scrollRestoration='manual';}
if(location.hash){history.replaceState(null,'',location.pathname+location.search);}
window.scrollTo(0,0);
document.addEventListener('DOMContentLoaded',function(){window.scrollTo(0,0);},{once:true});
}catch(e){}})();`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCROLL_RESET }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
