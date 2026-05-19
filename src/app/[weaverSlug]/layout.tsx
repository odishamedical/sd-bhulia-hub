import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ weaverSlug: string }> }): Promise<Metadata> {
  const { weaverSlug } = await params;
  const formattedTitle = weaverSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `Master Weaver Flagship: ${formattedTitle} | Bhulia Hub`;
  const description = `Explore the sovereign D2C handloom flagship store for ${formattedTitle}. Buy authentic GI-Tagged Sambalpuri sarees directly from the artisan's pit loom with 100% Jan Dhan escrow protection.`;

  return {
    metadataBase: new URL("https://bhulia.com"),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bhulia.com/${weaverSlug.toLowerCase()}`,
      siteName: "Bhulia Hub",
      images: [
        {
          url: "/bhulia-hero.png",
          width: 1200,
          height: 630,
          alt: `Bhulia Master Weaver ${formattedTitle}`,
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

export default function WeaverStoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
