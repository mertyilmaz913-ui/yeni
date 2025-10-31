import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TraderPro',
  description: 'Crypto trader marketplace built with Next.js and Supabase.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="mx-auto w-full max-w-4xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
