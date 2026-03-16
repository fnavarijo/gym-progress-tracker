import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppSerwistProvider from '@/components/app/serwist-provider';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9f4' },
    { media: '(prefers-color-scheme: dark)',  color: '#0e1110' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Momentum',
  description: 'Track your gym progress',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Momentum',
  },
  icons: {
    icon: [
      { url: '/icon.svg',        type: 'image/svg+xml' },
      { url: '/icon192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/icon192x192.png', sizes: '192x192', type: 'image/png' },
  },
  formatDetection: { telephone: false },
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppSerwistProvider>
            {children}
            <Toaster />
          </AppSerwistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
