"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";

export default function WholesalerPublicPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug.toLowerCase() : "";

  const [wholesaler, setWholesaler] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        const q = query(collection(db, "wholesalers"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setWholesaler({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.error(e);
        setNotFound(true);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-12 h-12 border-4 border-[#0074E4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !wholesaler) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] gap-4">
        <div className="text-6xl">🏢</div>
        <h1 className="text-2xl font-black text-gray-900">Wholesaler not found</h1>
        <p className="text-gray-500">This profile may not exist or the link may be incorrect.</p>
        <Link href="/" className="text-[#0074E4] font-bold hover:underline">← Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* SEO */}
      <title>{wholesaler.companyName || "Wholesaler"} — B2B Wholesale Partner | Bhulia.com</title>
      <meta name="description" content={wholesaler.companyDesc || `${wholesaler.companyName} is a verified B2B wholesale partner on Bhulia.com.`} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Bhulia" className="h-8 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-black text-lg text-gray-900">Bhulia<span className="text-[#0074E4]">.com</span></span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Marketplace</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <GlobalBannerSlot slot="wholesaler_top" />

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-8">
          {wholesaler.profileImage ? (
            <img src={wholesaler.profileImage} alt={wholesaler.companyName} className="w-28 h-28 rounded-2xl object-cover border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-black flex-shrink-0">
              {(wholesaler.companyName || "W")[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-black text-gray-900">{wholesaler.companyName || "Wholesaler"}</h1>
              {wholesaler.gstNumber && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✅ GST Verified</span>
              )}
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">B2B Wholesale Partner</span>
            </div>
            {(wholesaler.district || wholesaler.state) && (
              <p className="text-gray-500 mb-2">📍 {[wholesaler.city, wholesaler.district, wholesaler.state].filter(Boolean).join(", ")}</p>
            )}
            {wholesaler.companyDesc && (
              <p className="text-gray-700 leading-relaxed max-w-2xl">{wholesaler.companyDesc}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 md:col-span-1">
            <h2 className="text-lg font-bold text-gray-900">Contact</h2>
            {wholesaler.phone && (
              <a href={`tel:${wholesaler.phone}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                <span className="text-2xl">📞</span>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Phone</div>
                  <div className="font-bold text-gray-900 group-hover:text-[#0074E4]">{wholesaler.phone}</div>
                </div>
              </a>
            )}
            {wholesaler.whatsapp && (
              <a href={`https://wa.me/${wholesaler.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="text-xs text-gray-500 font-medium">WhatsApp</div>
                  <div className="font-bold text-gray-900 group-hover:text-green-700">{wholesaler.whatsapp}</div>
                </div>
              </a>
            )}
            {wholesaler.businessAddress && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📦</span>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Address</div>
                  <div className="text-sm text-gray-700">{wholesaler.businessAddress}</div>
                </div>
              </div>
            )}
          </div>

          {/* Operations Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Business Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {wholesaler.gstNumber && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">GST Number</div>
                  <div className="font-bold text-gray-900 uppercase text-sm">{wholesaler.gstNumber}</div>
                </div>
              )}
              {wholesaler.udyamNumber && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">Udyam Registration</div>
                  <div className="font-bold text-gray-900 text-sm">{wholesaler.udyamNumber}</div>
                </div>
              )}
              {wholesaler.moq && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">Min. Order Qty (MOQ)</div>
                  <div className="font-bold text-[#0074E4] text-xl">{wholesaler.moq} <span className="text-sm text-gray-500">units</span></div>
                </div>
              )}
              {wholesaler.monthlyCapacity && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">Monthly Capacity</div>
                  <div className="font-bold text-emerald-700 text-xl">{wholesaler.monthlyCapacity} <span className="text-sm text-gray-500">pcs</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <GlobalBannerSlot slot="wholesaler_bottom" />
      </div>
    </div>
  );
}
