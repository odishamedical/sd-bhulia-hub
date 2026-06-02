"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MASTER_STORES, DEFAULT_STORE } from "../data";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "maa-samaleswari-weavers";
  const storeSlug = rawSlug.toLowerCase();

  const store = MASTER_STORES.find((s) => s.slug === storeSlug || s.id.toLowerCase() === storeSlug) || {
    ...DEFAULT_STORE,
    id: storeSlug.toUpperCase(),
    slug: storeSlug,
    name: `Store/PWCS (${storeSlug.replace(/-/g, " ")})`,
  };

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
      } else {
        setUserName(null);
        setUserAvatar(null);
        setUserRole(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  // Helper to determine active tab class
  const getTabClass = (pathSuffix: string) => {
    const targetPath = pathSuffix === "" 
      ? `/store/${store.slug}` 
      : `/store/${store.slug}/${pathSuffix}`;
    const isActive = pathname === targetPath;
    
    return `hover:text-[#C5A059] transition-colors pb-1 border-b-2 uppercase text-xs font-bold tracking-widest ${
      isActive ? "text-[#C5A059] border-[#C5A059]" : "text-gray-300 border-transparent"
    }`;
  };

  return (
    <div className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href={`/store/${store.slug}`} onClick={() => setMobileNavOpen(false)} className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href={`/store/${store.slug}/catalog`} onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Saree Catalog</Link>
            <Link href={`/store/${store.slug}/legacy`} onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Our Legacy</Link>
            <Link href={`/store/${store.slug}/contact`} onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Contact</Link>
            {!userAvatar && (
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider">
                <span>Sign In / Register</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Children Content Wrapper */}
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* Global Footer */}
      

    </div>
  );
}
