import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// ── Official Brand Font: Ping AR + LT ─────────────────────────
const pingFont = localFont({
  src: [
    {
      path: '../../public/fonts/PingAR+LT-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PingAR+LT-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PingAR+LT-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PingAR+LT-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PingAR+LT-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-ping',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RASHX — Account & Organization Portal',
  description: 'Manage your RASHX account, organizations, onboarding, and subscriptions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={pingFont.variable}
      suppressHydrationWarning
    >
      <body className="antialiased bg-[#FAF9F8] text-[#54453D]">
        {children}
      </body>
    </html>
  );
}
