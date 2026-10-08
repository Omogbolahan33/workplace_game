import '@ledger/ui/styles.css';
import './globals.css';

/* `manifest` and `icons` are what make the app installable: the browser reads
   the manifest for the name, the colours, the display mode and the icons, and
   the apple-touch-icon is the one iOS will not infer. Both point at files in
   public/, which are the same drawings the single file ships. */
export const metadata = {
  title: 'LEDGER — A Life in Decisions',
  description: 'A single-player business and life simulation. Every decision compounds.',
  applicationName: 'LEDGER',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  appleWebApp: { capable: true, title: 'LEDGER', statusBarStyle: 'black-translucent' }
};

/* Next 15 moved these two out of `metadata`; they belong to the viewport, which
   is the honest place for them: they are how the page is framed, not what it is
   called. */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080b10',
  colorScheme: 'dark'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
