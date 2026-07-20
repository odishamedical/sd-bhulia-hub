import type { Metadata, ResolvingMetadata } from 'next';
import { getProfileMeta } from '@/lib/server-db';
import ClientWholesalerPage from './ClientWholesalerPage';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const profile = await getProfileMeta('wholesalers', slug);
  
  if (!profile || profile.status === 'pending_approval' || profile.status === 'pending' || profile.status === 'rejected') {
    return {
      title: 'Wholesaler Not Found | Bhulia.com',
      description: 'This wholesaler profile does not exist or is under review.',
    };
  }

  return {
    title: `${profile.title} - B2B Wholesaler | Bhulia.com`,
    description: profile.description,
    openGraph: {
      title: `${profile.title} - B2B Wholesaler | Bhulia.com`,
      description: profile.description,
      images: [profile.image],
    },
  };
}

export default function Page() {
  return <ClientWholesalerPage />;
}
