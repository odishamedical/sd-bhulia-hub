import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bhulia.com"),
  title: "BHULIA | Original Sambalpuri Saree & Handloom from Odisha",
  description: "Experience the timeless artistry of Sambalpuri handloom weavers. Buy original Sambalpuri sarees, Sambalpuri silk sarees, Sambalpuri cotton, Ikat, Bandha, and Pata sarees directly from grassroots pit looms in Odisha.",
  openGraph: {
    title: "BHULIA | Original Sambalpuri Saree & Handloom from Odisha",
    description: "Experience the timeless artistry of Sambalpuri handloom weavers. Buy original Sambalpuri sarees, Sambalpuri silk sarees, Sambalpuri cotton, Ikat, Bandha, and Pata sarees directly from grassroots pit looms in Odisha.",
    url: "https://bhulia.com",
    siteName: "Bhulia Hub",
    images: [
      {
        url: "/bhulia-hero.png",
        width: 1200,
        height: 630,
        alt: "Bhulia Original Sambalpuri Sarees & Handloom",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-1792783864518197"
  },
  twitter: {
    card: "summary_large_image",
    title: "BHULIA | Original Sambalpuri Saree & Handloom from Odisha",
    description: "Experience the timeless artistry of Sambalpuri handloom weavers. Buy original Sambalpuri sarees, Sambalpuri silk sarees, Sambalpuri cotton, Ikat, Bandha, and Pata sarees.",
    images: ["/bhulia-hero.png"],
  },
};

import { Suspense } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LeadCaptureProvider } from "@/context/LeadCaptureContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Header from "@/components/Header";
import GlobalSearchConsole from "@/components/GlobalSearchConsole";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import GlobalMaintenanceGate from "@/components/GlobalMaintenanceGate";
import GlobalAffiliateTracker from "@/components/GlobalAffiliateTracker";

import BetaBanner from "@/components/BetaBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full bg-[#051815]`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1792783864518197"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-sans min-h-full flex flex-col bg-[#051815] text-white overflow-x-hidden">
        <GoogleAnalytics gaId="G-BJTLQMQZDV" />
        <AuthProvider>
          <CartProvider>
            <LeadCaptureProvider>
              <GlobalMaintenanceGate>
                <BetaBanner />
                <Header />
              <Suspense fallback={null}>
                <GlobalSearchConsole />
                <GlobalAffiliateTracker />
              </Suspense>
              <div className="flex-1 flex flex-col min-h-[calc(100vh-200px)] relative pb-16 lg:pb-0">
                {children}
              </div>
              <Footer />
              <BackToTopButton />
              <MobileBottomNav />
              </GlobalMaintenanceGate>
            </LeadCaptureProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
