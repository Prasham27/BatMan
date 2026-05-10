import type { Metadata } from 'next';
import { Rajdhani, JetBrains_Mono, Inter } from 'next/font/google';
import { cn } from '@/lib/cn';
import { content } from '@/content/data';
import { CommandPalette } from '@/components/nav/CommandPalette';
import { PrimaryNav } from '@/components/nav/PrimaryNav';
import { TelemetryStrip } from '@/components/HUD/TelemetryStrip';
import { VaultUnlock } from '@/components/effects/VaultUnlock';
import { JokerGlitch } from '@/components/effects/JokerGlitch';
import { TrackBeacon } from '@/components/effects/TrackBeacon';
import { AlfredFloater } from '@/components/alfred/AlfredFloater';
import './globals.css';

// Use || (not ??) so empty-string env values fall through to the default —
// `new URL('')` throws ERR_INVALID_URL during the build.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Prasham // Batcomputer',
    template: '%s // Batcomputer',
  },
  description: content.identity.bio,
  applicationName: 'Batcomputer',
  authors: [{ name: content.identity.name }],
  openGraph: {
    type: 'website',
    siteName: 'Batcomputer',
    title: 'Prasham // Batcomputer',
    description: content.identity.bio,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prasham // Batcomputer',
    description: content.identity.bio,
  },
  robots: { index: true, follow: true },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: content.identity.name,
  url: SITE_URL,
  sameAs: content.identity.socials.map((s) => s.href),
  jobTitle: content.identity.role,
  description: content.identity.bio,
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'Dhirubhai Ambani University',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: content.identity.location,
    addressCountry: 'IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(rajdhani.variable, jetbrainsMono.variable, inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <a
          href="#content"
          className={cn(
            'sr-only',
            'focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200]',
            'focus:bg-signal focus:px-3 focus:py-2 focus:text-ink',
            'focus:font-mono focus:text-xs focus:tracking-widest',
          )}
        >
          SKIP TO CONTENT
        </a>
        <PrimaryNav />
        <TelemetryStrip />
        <div id="content">{children}</div>
        <CommandPalette />
        <AlfredFloater />
        <VaultUnlock />
        <JokerGlitch />
        <TrackBeacon />
        {/* AmbientHum removed — user feedback: not useful enough to keep */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
