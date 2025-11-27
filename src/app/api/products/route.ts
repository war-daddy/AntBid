import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getCurrentUserFromCookie } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/products - list all products with highest bid
export async function GET() {
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
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const mapped = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    startingBid: p.startingBid,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt,
    owner: p.owner,
    highestBid: p.bids[0]
      ? {
          id: p.bids[0].id,
          amount: p.bids[0].amount,
          user: p.bids[0].user
        }
      : null
  }));

  return NextResponse.json({ products: mapped });
}

// POST /api/products - create a new product (auth required)
export async function POST(request: Request) {
  const user = getCurrentUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, startingBid, imageUrl } = await request.json();
  if (!title || !description || typeof startingBid !== 'number') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      startingBid,
      imageUrl,
      ownerId: user.userId
    }
  });

  return NextResponse.json({ product }, { status: 201 });
}


