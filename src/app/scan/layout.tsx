import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Scanner Présence',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Scanner Présence'
  },
  icons: {
    icon: '/icons/scanner-icon.png',
    apple: '/icons/scanner-icon.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#1B2430',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
