import type { Metadata, ResolvingMetadata } from 'next';
import { getProfileMeta } from '@/lib/server-db';
import ClientSupplierPage from './ClientSupplierPage';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const profile = await getProfileMeta('suppliers', slug);
  
  if (!profile || profile.status === 'pending_approval' || profile.status === 'pending' || profile.status === 'rejected') {
    return {
      title: 'Supplier Not Found | Bhulia.com',
      description: 'This supplier profile does not exist or is under review.',
    };
  }

  return {
    title: `${profile.title} - Verified Supplier | Bhulia.com`,
    description: profile.description,
    openGraph: {
      title: `${profile.title} - Verified Supplier | Bhulia.com`,
      description: profile.description,
      images: [profile.image],
    },
  };
}

export default function Page() {
  return <ClientSupplierPage />;
}
