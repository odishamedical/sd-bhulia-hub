import type { Metadata, ResolvingMetadata } from 'next';
import { getProfileMeta } from '@/lib/server-db';
import ClientStorePage from './ClientStorePage';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const profile = await getProfileMeta('stores', slug);
  
  if (!profile || profile.status === 'pending_approval' || profile.status === 'pending' || profile.status === 'rejected') {
    return {
      title: 'Store Not Found | Bhulia.com',
      description: 'This retail shop profile does not exist or is under review.',
    };
  }

  const district = profile.district || "Odisha";
  const title = `${profile.title} - Authentic Retail Shop in ${district} | Bhulia.com`;
  const description = `Visit ${profile.title} in ${district} to buy authentic Sambalpuri Pata, Dress materials, and cotton sarees. Handloom mark certified.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [profile.image],
    },
  };
}

export default function Page() {
  return <ClientStorePage />;
}
