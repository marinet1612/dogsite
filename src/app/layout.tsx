import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';
import { BRAND_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `${BRAND_NAME} — платформа для владельцев собак и кинологов`,
  description: 'Подбор кинолога, дневник прогресса, прогулки и чаты для владельцев собак.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
