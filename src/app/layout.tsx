import type { Metadata } from 'next';
import { Playfair_Display, Outfit, Caveat } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sebuah Ruang Khusus',
  description: 'Digital scrapbook & journey dibuat dengan penuh ketulusan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${outfit.variable} ${caveat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full font-sans bg-cream-50 text-sage-900 selection:bg-rose-200 selection:text-rose-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
