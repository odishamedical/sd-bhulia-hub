import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { artisanId: string } }): Promise<Metadata> {
  const artisanId = params.artisanId.toUpperCase();
  const title = `Master Weaver Store: ${artisanId} | Bhulia Hub`;
  const description = `Explore the sovereign handloom store for ${artisanId}. Buy authentic GI-Tagged Sambalpuri sarees directly from the artisan's pit loom with 100% Jan Dhan escrow protection.`;

  return {
    metadataBase: new URL("https://bhulia.com"),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bhulia.com/artisan/${artisanId.toLowerCase()}`,
      siteName: "Bhulia Hub",
      images: [
        {
          url: "/bhulia-hero.png",
          width: 1200,
          height: 630,
          alt: `Bhulia Artisan Store ${artisanId}`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/bhulia-hero.png"],
    },
  };
}

export default function ArtisanStoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
