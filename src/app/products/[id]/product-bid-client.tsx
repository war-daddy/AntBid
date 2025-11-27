'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Bid {
  id: number;
  amount: number;
  user: { id: number; name: string | null };
}

interface ProductBidClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
}

export default function BiddingClient({ product }: ProductBidClientProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadBids() {
    try {
      const res = await fetch(`/api/products/${product.id}/bids`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load bids');
      } else {
        setBids(json.bids ?? []);
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  }

  useEffect(() => {
    loadBids();
  }, []);

  async function handleBid(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const value = Number(amount);

    try {
      const res = await fetch(`/api/products/${product.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to place bid (maybe not logged in)');
      } else {
        setAmount('');
        await loadBids();
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const currentHighest =
    bids[0]?.amount ?? product.highestBid?.amount ?? product.startingBid;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="card p-5">
        <h1 className="text-xl font-semibold">{product.title}</h1>
        <p className="mt-2 text-sm text-slate-300">{product.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-slate-300">Starting bid</div>
            <div className="font-semibold text-sky-300">
              ${product.startingBid.toFixed(2)}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-slate-300">Current highest bid</div>
            <div className="font-semibold text-emerald-400">
              ${currentHighest.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <div className="card p-4 text-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-100">
            Place a bid
          </h2>
          <form onSubmit={handleBid} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="amount" className="text-slate-200">
                Bid amount (must be higher than current highest)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min={currentHighest + 0.01}
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Placing bid...' : 'Place bid'}
            </button>
          </form>
          <p className="mt-2 text-[11px] text-slate-400">
            You must be logged in to place a bid.
          </p>
        </div>

        <div className="card flex flex-col p-4 text-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-100">
            Bids (highest on top)
          </h2>
          {bids.length === 0 ? (
            <p className="text-xs text-slate-300">No bids yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {bids.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2"
                >
                  <div>
                    <div className="font-medium text-slate-100">
                      ${b.amount.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.user?.name ?? 'Unknown user'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


