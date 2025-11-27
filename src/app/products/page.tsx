'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  title: string;
  description: string;
  startingBid: number;
  imageUrl?: string | null;
  highestBid?: {
    amount: number;
    user?: { id: number; name: string | null };
  } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Failed to load products');
        } else {
          setProducts(json.products ?? []);
        }
      } catch (err) {
        console.error(err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-slate-300">
            Browse all items available for bidding.
          </p>
        </div>
        <Link href="/products/new" className="btn-primary text-sm">
          + Add product
        </Link>
      </div>
      {loading && <p className="text-sm text-slate-300">Loading products...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="text-sm text-slate-300">
          No products yet. Be the first to{' '}
          <Link href="/products/new" className="text-sky-400 underline">
            add one
          </Link>
          .
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="card flex flex-col justify-between p-4 text-sm hover:-translate-y-0.5 hover:shadow-xl transition-transform overflow-hidden"
          >
            {p.imageUrl && (
              <div className="mb-3 -mx-4 -mt-4">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <h2 className="line-clamp-2 text-base font-semibold">{p.title}</h2>
              <p className="line-clamp-3 text-xs text-slate-300">
                {p.description}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="text-slate-300">
                <div>Starting at</div>
                <div className="font-semibold text-sky-300">
                  ${p.startingBid.toFixed(2)}
                </div>
              </div>
              <div className="text-right text-slate-300">
                <div className="text-[11px]">Highest bid</div>
                {p.highestBid ? (
                  <div className="font-semibold text-emerald-400">
                    ${p.highestBid.amount.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500">No bids yet</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


