import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RASHX — Salon Application',
  description: 'Public salon website and management dashboard powered by RASHX.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-[#FAF9F8] text-[#54453D]">
        {children}
      </body>
    </html>
  );
}

