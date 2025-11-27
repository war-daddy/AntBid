'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const startingBid = Number(formData.get('startingBid'));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          startingBid,
          imageUrl: formData.get('imageUrl') || undefined
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to create product (maybe not logged in)');
      } else {
        router.push(`/products/${json.product.id}`);
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add a new product</h1>
        <p className="text-sm text-slate-300">
          Set a clear title, description and starting bid to attract bidders.
        </p>
      </div>
      <div className="card p-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label htmlFor="title" className="text-slate-200">
              Title
            </label>
            <input id="title" name="title" className="input" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="description" className="text-slate-200">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="input min-h-[80px]"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="startingBid" className="text-slate-200">
              Starting bid (USD)
            </label>
            <input
              id="startingBid"
              name="startingBid"
              type="number"
              step="0.01"
              min="0"
              className="input"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="imageUrl" className="text-slate-200">
              Image URL (optional)
            </label>
            <input id="imageUrl" name="imageUrl" className="input" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create product'}
          </button>
        </form>
      </div>
    </div>
  );
}


