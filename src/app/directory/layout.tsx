import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://bhulia.com"),
  title: "Master Weaver Directory | Bhulia.com",
  description: "Explore the sovereign directory of authentic GI-Tagged Sambalpuri saree weavers, Primary Weaving Cooperative Societies (PWCS), and master artisans across Bargarh, Sonepur, Sambalpur, Boudh, and Balangir.",
  openGraph: {
    title: "Master Weaver Directory | Bhulia.com",
    description: "Connect directly with Odisha's elite handloom artisans. Verify GI-Tag certificates and explore traditional pit loom capacities.",
    url: "https://bhulia.com/directory",
    siteName: "Bhulia Hub",
    images: [
      {
        url: "/bhulia-hero.png",
        width: 1200,
        height: 630,
        alt: "Bhulia Master Weaver Directory",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Master Weaver Directory | Bhulia.com",
    description: "Connect directly with Odisha's elite handloom artisans.",
    images: ["/bhulia-hero.png"],
  },
};

export default function DirectoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
