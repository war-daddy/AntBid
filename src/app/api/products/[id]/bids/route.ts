import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserFromCookie } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

// GET /api/products/:id/bids - list bids for a product ordered by highest first
export async function GET(_request: Request, { params }: Params) {
  const productId = Number(params.id);
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  const bids = await prisma.bid.findMany({
    where: { productId },
    orderBy: { amount: 'desc' },
    include: {
      user: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json({ bids });
}

// POST /api/products/:id/bids - place a bid (auth required)
export async function POST(request: Request, { params }: Params) {
  const user = getCurrentUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const productId = Number(params.id);
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  const { amount } = await request.json();
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const currentHighest = product.bids[0]?.amount ?? product.startingBid;
  if (amount <= currentHighest) {
    return NextResponse.json(
      {
        error: `Bid must be higher than current highest (${currentHighest})`
      },
      { status: 400 }
    );
  }

  const bid = await prisma.bid.create({
    data: {
      amount,
      productId,
      userId: user.userId
    }
  });

  return NextResponse.json({ bid }, { status: 201 });
}


