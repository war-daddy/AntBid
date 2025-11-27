import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold text-slate-100">404</h1>
      <h2 className="text-xl font-semibold text-slate-300">Page Not Found</h2>
      <p className="max-w-md text-sm text-slate-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary text-sm">
          Go Home
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 hover:border-slate-300 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}

