import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '멍냥로그 🐾',
  description: 'AI가 써주는 우리 아이 일기',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F59E0B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto min-h-screen pb-20 relative">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
