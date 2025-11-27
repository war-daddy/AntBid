import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';
import { getCurrentUser } from '../lib/auth';
import LogoutButton from '../components/LogoutButton';

export const metadata = {
  title: 'AntBid - Product Bidding',
  description: 'Bid on products and sell your own items.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-lg font-semibold tracking-tight hover:text-white">
                AntBid
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/" className="text-slate-200 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/products" className="text-slate-200 hover:text-white transition-colors">
                  Products
                </Link>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      <span className="text-xs font-medium text-slate-200">{user.name}</span>
                    </div>
                    <LogoutButton />
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    Login / Signup
                  </Link>
                )}
              </nav>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800 bg-slate-900/80">
            <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-400">
              AntBid &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}


