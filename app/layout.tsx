import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ECOM HOUSE Full Funnel Audit',
  description: 'AI-powered audit of your Shopify store and Meta Ads. Specific findings, prioritized actions, delivered in under 24 hours.',
  metadataBase: new URL(process.env.APP_URL || 'https://eh-full-audit.vercel.app'),
  openGraph: {
    title: 'ECOM HOUSE Full Funnel Audit',
    description: 'AI-powered audit of your Shopify store and Meta Ads.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-bg text-white min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
