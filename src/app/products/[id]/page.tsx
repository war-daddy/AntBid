import { prisma } from '../../../lib/prisma';
import BiddingClient from './product-bid-client';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return <p className="text-red-400">Invalid product id.</p>;
  }

  const product = await prisma.product.findUnique({
    where: { id },
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
    }
  });

  if (!product) {
    return <p className="text-sm text-slate-300">Product not found.</p>;
  }

  const productData = {
    id: product.id,
    title: product.title,
    description: product.description,
    startingBid: product.startingBid,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    owner: product.owner,
    highestBid: product.bids[0]
      ? {
          id: product.bids[0].id,
          amount: product.bids[0].amount,
          user: product.bids[0].user
        }
      : null
  };

  return <BiddingClient product={productData} />;
}


