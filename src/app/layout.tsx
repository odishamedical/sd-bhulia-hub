import type { Metadata } from "next";
import "./globals.css";
import SsoBridge from "@/components/SsoBridge";

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
    <html lang="en" className="h-full bg-[#0A2520]">
      <body className="font-sans min-h-full flex flex-col bg-[#0A2520] text-white">
        <SsoBridge />
        {children}
      </body>
    </html>
  );
}
