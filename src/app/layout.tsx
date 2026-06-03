import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

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
import MobileBottomNav from "@/components/MobileBottomNav";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full bg-[#051815] ${inter.variable} ${playfair.variable}`}>
      <body className="font-sans min-h-full flex flex-col bg-[#051815] text-white overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="flex-1 flex flex-col min-h-[calc(100vh-200px)] relative pb-16 lg:pb-0">
              {children}
            </div>
            <Footer />
            <BackToTopButton />
            <MobileBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
