import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://bhulia.com"),
  title: "BHULIA | Heritage Sambalpuri Marketplace",
  description: "Experience the timeless artistry of Sambalpuri handloom weavers.",
  openGraph: {
    title: "BHULIA | Heritage Sambalpuri Marketplace",
    description: "Experience the timeless artistry of Sambalpuri handloom weavers. Direct from grassroots pit looms.",
    url: "https://bhulia.com",
    siteName: "Bhulia Hub",
    images: [
      {
        url: "/bhulia-hero.png",
        width: 1200,
        height: 630,
        alt: "Bhulia Heritage Sambalpuri Sarees",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BHULIA | Heritage Sambalpuri Marketplace",
    description: "Experience the timeless artistry of Sambalpuri handloom weavers.",
    images: ["/bhulia-hero.png"],
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0A2520]">
      <body className="font-sans min-h-full flex flex-col bg-[#0A2520] text-white overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
