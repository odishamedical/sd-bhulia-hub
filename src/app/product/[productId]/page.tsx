import type { Metadata, ResolvingMetadata } from 'next';
import { getProductMeta } from '@/lib/server-db';
import ClientProductPage from './ClientProductPage';

type Props = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { productId } = await params;
  
  const product = await getProductMeta(productId);
  
  if (!product) {
    return {
      title: 'Product Not Found | Bhulia.com',
      description: 'This product does not exist or has been removed.',
    };
  }

  const title = ` | Bhulia Hub`;
  const description = product.description;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [product.image],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [product.image],
    }
  };
}

export default function Page() {
  return <ClientProductPage />;
}