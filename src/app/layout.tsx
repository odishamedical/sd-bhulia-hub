import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SsoBridge from "@/components/SsoBridge";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BHULIA | Heritage Sambalpuri Marketplace",
  description: "Experience the timeless artistry of Sambalpuri handloom weavers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-full flex flex-col`}>
        <SsoBridge />
        {children}
      </body>
    </html>
  );
}
