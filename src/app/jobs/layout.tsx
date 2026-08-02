import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Handloom Jobs & Careers | Bhulia Hub Job Portal',
  description: 'Find the perfect career in the jewelry industry. Apply to top shops across India or create a Seeker Profile to let shops find you.',
  openGraph: {
    title: 'Jewelry Jobs & Careers | Gold Dunia',
    description: 'Find the perfect career in the jewelry industry. Apply to top shops across India or let shops find you.',
    url: 'https://sd-gold-hub.vercel.app/jobs',
    siteName: 'Gold Dunia',
    images: [
      {
        url: 'https://sd-gold-hub.vercel.app/stock/jobs-hero-pc.png',
        width: 1200,
        height: 630,
        alt: 'Jewelry Jobs',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    title: "Jewelry Jobs & Careers | Gold Dunia",
    description: "Find the perfect career in the jewelry industry.",
    images: ["https://sd-gold-hub.vercel.app/stock/jobs-hero-pc.png"],
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
