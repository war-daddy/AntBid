import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { getCurrentUser } from '../lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  
  // Fetch top products with their bids for the preview
  const products = await prisma.product.findMany({
    include: {
      owner: {
        select: { id: true, name: true }
      },
      bids: {
        orderBy: { amount: 'desc' },
        take: 1,
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      },
      _count: {
        select: { bids: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6 // Show top 6 products
  });

  const productsWithBidCount = products.map((p) => ({
    id: p.id,
    title: p.title,
    startingBid: p.startingBid,
    highestBid: p.bids[0]
      ? {
          amount: p.bids[0].amount,
          user: p.bids[0].user
        }
      : null,
    bidCount: p._count.bids
  }));

  return (
    <div className="grid gap-8 md:grid-cols-[3fr,2fr]">
      <section className="space-y-6">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Bid smart. Sell fast.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-pink-400 bg-clip-text text-transparent">
            AntBid
          </span>
        </h1>
        <p className="max-w-xl text-sm text-slate-300 sm:text-base">
          A simple marketplace where users can list products and compete in
          live-style bidding. Highest bidder always stays on top.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="btn-primary text-sm sm:text-base">
            Browse products
          </Link>
          {!user && (
            <Link
              href="/auth"
              className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 hover:border-slate-300 transition-colors"
            >
              Login / Sign up
            </Link>
          )}
        </div>
        <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-3 sm:text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="font-medium text-slate-100">List products</div>
            <div>Add items you want to sell with a starting bid.</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="font-medium text-slate-100">Real-time ranking</div>
            <div>Highest bids float to the top of each product.</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="font-medium text-slate-100">Simple flows</div>
            <div>Clean responsive UI that works on mobile and desktop.</div>
          </div>
        </div>
      </section>
      <section className="card flex flex-col gap-4 p-5 md:h-auto">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Live bidding preview
            </h2>
            {productsWithBidCount.length > 0 && (
              <Link
                href="/products"
                className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2"
              >
                View all
              </Link>
            )}
          </div>
          {productsWithBidCount.length === 0 ? (
            <div className="rounded-lg bg-slate-950/60 px-3 py-4 text-center">
              <p className="text-xs text-slate-400">
                No products yet. Be the first to{' '}
                <Link href="/products/new" className="text-sky-400 underline">
                  add one
                </Link>
                !
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:max-h-none">
              {productsWithBidCount.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2.5 text-xs text-slate-100 transition-colors hover:bg-slate-950/80"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {product.bidCount === 0
                        ? 'No bids yet'
                        : `${product.bidCount} ${product.bidCount === 1 ? 'bid' : 'bids'}`}
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <div className="text-[11px] text-slate-400">Highest bid</div>
                    <div className="text-sm font-semibold text-emerald-400">
                      {product.highestBid
                        ? `$${product.highestBid.amount.toFixed(2)}`
                        : `$${product.startingBid.toFixed(2)}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        {!user && (
          <p className="text-[11px] text-slate-300 mt-auto">
            To start bidding or listing your own items,{' '}
            <Link href="/auth" className="text-sky-400 underline underline-offset-2">
              create an account
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}


