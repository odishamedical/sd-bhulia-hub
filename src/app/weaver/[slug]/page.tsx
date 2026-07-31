import type { Metadata, ResolvingMetadata } from 'next';
import { getProfileMeta } from '@/lib/server-db';
import ClientWeaverPage from './ClientWeaverPage';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const profile = await getProfileMeta('weavers', slug);
  
  if (!profile || profile.status === 'pending_approval' || profile.status === 'pending' || profile.status === 'rejected') {
    return {
      title: 'Weaver Not Found | Bhulia.com',
      description: 'This weaver profile does not exist or is under review.',
    };
  }

  const district = profile.district || "Odisha";
  const title = `${profile.title} - Authentic Sambalpuri Saree Weaver in ${district} | Bhulia.com`;
  const description = `Buy 100% original Sambalpuri Pata, Dress materials, and cotton sarees directly from ${profile.title} in ${district}. Handloom mark certified.`;

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
  return <ClientWeaverPage />;
}
