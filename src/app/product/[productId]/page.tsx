"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useProductBySlug, useProducts, addOrder, useWeavers, useStores } from "@/lib/db-hooks";
import { MASTER_FRANCHISES } from "@/app/reseller/data";
import { useCart } from "@/context/CartContext";
import { useLeadCapture } from "@/context/LeadCaptureContext";
import ShareWidget from "@/components/ShareWidget";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";
import ProfileBlockerModal from "../../../components/ProfileBlockerModal";
import { FastAverageColor } from 'fast-average-color';
import Breadcrumbs from "@/components/Breadcrumbs";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function ProductDetailPage() {
  const { addToCart, addToWishlist, wishlist } = useCart();
  const { requireLeadCapture } = useLeadCapture();
  const params = useParams();
  const rawId = typeof params?.productId === "string" ? params.productId : "";
  const productSlug = rawId; // Removed .toLowerCase() to support case-sensitive Firebase IDs

  const { product, loading: productLoading } = useProductBySlug(productSlug);
  const { products, loading: allProductsLoading } = useProducts({ status: "approved" });
  
  const { weavers } = useWeavers();
  const { stores } = useStores();
  
  const allSellers = [...(weavers || []).map(w => ({...w, type: 'weaver'})), ...(stores || []).map(v => ({...v, type: 'store'}))];
  const actualSeller = product ? allSellers.find(s => s.id === (product as any).sellerId) : null;
  const sellerDisplayTitle = actualSeller ? (actualSeller.title || actualSeller.name || actualSeller.id) : (product ? (product as any).sellerId : null);
  const sellerUrl = actualSeller ? (actualSeller.type === 'weaver' ? `/weaver/${actualSeller.slug || actualSeller.id}` : `/store/${actualSeller.slug || actualSeller.id}`) : '#';
  const sellerButtonText = actualSeller ? (actualSeller.type === 'weaver' ? 'Visit Weaver Hub' : 'Visit Storefront') : 'Store Coming Soon';

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>("rgba(197,160,89,0.15)");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [showB2BInquiryModal, setShowB2BInquiryModal] = useState<boolean>(false);
  const [inquiryQuantity, setInquiryQuantity] = useState<number>(10);
  const [b2bInquiryStatus, setB2bInquiryStatus] = useState<string>("");

  const allImages = product ? [product.img, product.img2, product.img3, product.img4, ...(product.images || [])].filter(Boolean) : [];
  
  const allMedia = [
    ...(product?.youtubeUrl ? [{ type: "video" as const, url: product.youtubeUrl }] : []),
    ...allImages.map(img => ({ type: "image" as const, url: img }))
  ];

  const activeMedia = allMedia[activeMediaIndex] || { type: 'image', url: product?.img || "" };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allMedia.length === 0) return;
    setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allMedia.length === 0) return;
    setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  useEffect(() => {
    if (product) {
      setActiveMediaIndex(0);
    }
  }, [product]);

  useEffect(() => {
    if (activeMedia && activeMedia.type === 'image' && activeMedia.url) {
      const fac = new FastAverageColor();
      fac.getColorAsync(activeMedia.url, { crossOrigin: 'anonymous' })
        .then(color => {
          setBgColor(color.rgba);
        })
        .catch(e => {
          console.log("Color extraction error:", e);
          setBgColor("rgba(197,160,89,0.15)");
        });
    }
  }, [activeMedia]);

  const submitB2BInquiry = async () => {
    if (!userUid || userUid === "sd_super_admin_custom_uid") return;
    setB2bInquiryStatus("submitting");
    try {
      await addDoc(collection(db, "b2b_inquiries"), {
        productId: product?.id || productSlug,
        productName: product?.title,
        supplierId: (product as any)?.sellerId || "",
        inquirerId: userUid,
        inquirerName: userName,
        inquirerRole: userRole,
        requestedQuantity: inquiryQuantity,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setB2bInquiryStatus("success");
      setTimeout(() => {
        setShowB2BInquiryModal(false);
        setB2bInquiryStatus("");
      }, 2000);
    } catch (e) {
      console.error(e);
      setB2bInquiryStatus("error");
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid") || "sd_super_admin_custom_uid";

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
        setUserUid(uid);
      } else {
        setUserName(null);
        setUserAvatar(null);
        setUserRole(null);
        setUserUid("sd_super_admin_custom_uid");
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);

    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const ref = p.get("ref");
      const refId = ref || localStorage.getItem("sd_referral_id");
      if (refId) {
        localStorage.setItem("sd_referral_id", refId);
        document.cookie = `sd_referral_id=${refId}; path=/; max-age=${30 * 24 * 60 * 60};`;
        
        const matched = MASTER_FRANCHISES.find(
          (f) => f.id.toLowerCase() === refId.toLowerCase() || f.slug.toLowerCase() === refId.toLowerCase()
        );
        if (matched) {
        } else {
        }
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);



  return (
    <main className="relative flex-1 w-full text-white font-sans flex flex-col min-h-screen transition-colors duration-1000 overflow-x-hidden" style={{ backgroundColor: bgColor ? `color-mix(in srgb, ${bgColor} 8%, #051815)` : '#051815' }}>
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--bg-glow)] via-transparent to-transparent pointer-events-none opacity-40 blur-[100px] transition-all duration-1000 z-0" style={{ '--bg-glow': bgColor } as React.CSSProperties}></div>
      
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/#cotton-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Saree Products</Link>
            {!userAvatar && (
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider">
                <span>Sign In / Register</span>
              </a>
            )}
          </div>
        </div>
      )}

      {referrerName && (
        <div className="bg-[#C5A059] text-[#051815] py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider shadow-inner flex justify-center items-center gap-2 z-30">
          <span>✨</span>
          <span>Shopping curated collection referred by <strong>{referrerName}</strong> — Authenticity Payout Protected</span>
          <span>✨</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {product && (
          <Breadcrumbs items={[
            { label: "Products", href: "/#cotton-sambalpuri" },
            { label: product.category || "Collection", href: `/search?category=${encodeURIComponent(product.category || '')}` },
            { label: product.title }
          ]} />
        )}

        {product && <GlobalBannerSlot placementId="content_top" context={{ audience: "products", specificId: product.id, category: product.category, material: product.material, design: product.design }} />}
        
        {(() => {
          const isB2BApproved = typeof window !== 'undefined' && (
            userRole === "super_admin" ||
            localStorage.getItem("sd_global_b2b_access") === "true" ||
            (localStorage.getItem("sd_approved_b2b_suppliers") || "").split(",").includes(String((product as any)?.sellerId))
          );
          const isRetail = product?.availableForRetail !== false;
          const isWholesale = product?.availableForWholesale === true;

          // If it's wholesale ONLY and user is not approved, we still let them see the page, but the price/cart will be hidden and replaced with inquiry button.
          // We removed the full-page blocker here so they can actually view the product details and click "Contact for Bulk Price".
        })()}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
            <div className="lg:col-span-6 h-[500px] bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl"></div>
            <div className="lg:col-span-6 space-y-6">
              <div className="h-[300px] bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl"></div>
              <div className="h-[200px] bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl"></div>
            </div>
          </div>
        ) : !product ? (
          <div className="space-y-12">
            <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl shadow-[0_0_40px_rgba(197,160,89,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/10 via-transparent to-transparent pointer-events-none"></div>
              <span className="text-5xl mb-4 block">🔍</span>
              <h2 className="text-3xl font-serif font-bold text-white mb-3">Product Not Available</h2>
              <p className="text-gray-300 max-w-lg mx-auto font-sans leading-relaxed text-sm mb-6">
                The handcrafted masterpiece you are looking for has either been sold or is no longer listed in our inventory. Please explore our other authentic Sambalpuri collections below.
              </p>
              <Link href="/" className="inline-flex items-center justify-center bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg">
                Browse Full Catalog
              </Link>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold text-[#C5A059] flex items-center gap-3">
                <span className="w-8 h-px bg-[#C5A059]"></span>
                Discover More Heritage Sarees
                <span className="flex-1 h-px bg-gradient-to-r from-[#C5A059] to-transparent"></span>
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                {allProductsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[380px] animate-pulse"></div>
                  ))
                ) : products.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                    <div className="relative w-full aspect-[9/16] overflow-hidden bg-[#0B2B26] rounded-t-xl">
                      <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-2.5 right-2.5 bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 text-[9px] font-mono text-[#C5A059] font-bold">
                        {item.id}
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{item.title}</h4>
                        <p className="text-base font-serif font-bold text-[#C5A059]">{item.price}</p>
                      </div>
                      <Link href={`/product/${item.slug}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-md text-center block">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* Column 1: Media Player */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-max">
              
            <div 
              onClick={() => { if (activeMedia?.type === 'image') setIsLightboxOpen(true); }}
              className={`relative w-full flex justify-center items-center rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 p-1 transition-all duration-500 hover:border-[#C5A059] ${activeMedia?.type === 'image' ? 'cursor-zoom-in' : ''}`}
            >
              <div className="relative w-full h-[50vh] sm:h-[65vh] rounded-[22px] overflow-hidden bg-[#0B2B26] flex items-center justify-center">
                {activeMedia?.type === 'video' ? (
                  <iframe 
                    src={getYouTubeEmbedUrl(activeMedia.url) || ""} 
                    title="Product Video Demo" 
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <Image src={activeMedia?.url || product.img} alt={product.title} fill className="object-contain transition-transform duration-700 hover:scale-105 animate-fadeIn" />
                )}
              </div>
              
              {/* Premium Verified Hallmark - Bottom Right */}
              {product.isBhuliaVerified && (
                <div className="absolute bottom-4 right-4 z-20 group/seal flex items-center justify-end pointer-events-none">
                  {/* Glassmorphic expanding container */}
                  <div className="absolute right-6 opacity-0 group-hover/seal:opacity-100 group-hover/seal:right-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-black/60 backdrop-blur-md border border-[#C5A059]/40 pl-6 pr-12 py-2.5 rounded-l-full shadow-2xl flex items-center whitespace-nowrap overflow-hidden pointer-events-auto">
                    <span className="text-xs font-bold text-[#FFF5C0] tracking-[0.2em] uppercase flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#00FF00] drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]"><path d="M20 6L9 17l-5-5"></path></svg>
                      BHULIA.COM VERIFIED SAMBALPURI
                    </span>
                  </div>
                  
                  {/* The Golden Seal Logo */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/seal:scale-110 group-hover/seal:rotate-3 z-10 pointer-events-auto">
                    <Image src="/bhulia-verified-seal.png" alt="Bhulia.com Verified Sambalpuri Seal" fill className="object-contain drop-shadow-2xl" unoptimized />
                    {/* Subtle Pulse Glow */}
                    <div className="absolute inset-0 bg-[#C5A059]/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setActiveMediaIndex(index)}
                  className={`relative aspect-[9/16] rounded-2xl overflow-hidden border bg-[#0B2B26] p-0.5 transition-all cursor-pointer ${
                    activeMediaIndex === index ? "border-[#C5A059] ring-1 ring-[#C5A059]/40" : "border-[#C5A059]/20 hover:border-[#C5A059]/50"
                  }`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {media.type === 'video' ? (
                      <>
                        <Image src={extractYouTubeId(media.url) ? `https://i.ytimg.com/vi/${extractYouTubeId(media.url)}/0.jpg` : "/placeholder-video.jpg"} alt="Video Thumbnail" fill className="object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="bg-red-600 text-white rounded-full p-2 shadow-lg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          </span>
                        </div>
                      </>
                    ) : (
                      <Image src={media.url || ""} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

            {/* Column 2: Product Details */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-max pb-12">
              
              <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl text-white space-y-6">
              <div>
                <Link href={`/search?category=${encodeURIComponent(product.category || '')}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-bold uppercase tracking-widest mb-3 hover:bg-[#C5A059]/40 transition-colors cursor-pointer">
                  <span>{product.category}</span>
                </Link>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] leading-tight">{product.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 font-bold">★★★★★</span>
                  <span className="text-xs text-gray-300">({product.rating || "5.0 (New Listing)"})</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-b border-[#C5A059]/20 py-4">
                <div className="flex flex-col items-start gap-4">
                  {(() => {
                    const isB2BApproved = typeof window !== 'undefined' && (
                      userRole === "super_admin" ||
                      localStorage.getItem("sd_global_b2b_access") === "true" ||
                      (localStorage.getItem("sd_approved_b2b_suppliers") || "").split(",").includes(String((product as any)?.sellerId))
                    );
                    const isRetail = product.availableForRetail !== false;
                    const isWholesale = product.availableForWholesale === true;
                    
                    return (
                      <div className="w-full space-y-4">
                        {/* Retail Pricing Block */}
                        {isRetail && (
                          <div className="flex items-baseline gap-4">
                            <span className={`text-3xl font-serif font-bold ${userRole === "reseller" && product.allowResellerMargin ? "text-gray-400 line-through text-2xl" : "text-[#C5A059]"}`}>{product.price}</span>
                            {(!userRole || userRole !== "reseller" || !product.allowResellerMargin) && (
                              <span className="text-sm text-gray-400 line-through">{product.mrp || `₹ ${(parseFloat(product.price.toString().replace(/[^0-9]/g, '')) * 1.2).toLocaleString('en-IN')}`}</span>
                            )}
                            {(!userRole || userRole !== "reseller" || !product.allowResellerMargin) && (
                              <span className="text-xs text-green-400 font-bold">Direct Weaver Price</span>
                            )}
                          </div>
                        )}

                        {/* Wholesale Pricing Block */}
                        {isWholesale && (
                          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                B2B Wholesale Status
                              </span>
                              {isB2BApproved && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase border border-green-500/30">Verified</span>}
                            </div>
                            
                            {isB2BApproved ? (
                              <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-serif font-bold text-purple-300">₹{product.commercialPrice?.toLocaleString() || product.price}</span>
                                <span className="text-xs text-purple-200">Bulk Rate</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <span className="text-sm text-gray-400 italic">Bulk pricing is hidden for unverified users.</span>
                                <button onClick={() => {
                                  if (!userRole) {
                                    alert("Please login to request bulk pricing.");
                                    return;
                                  }
                                  setShowB2BInquiryModal(true);
                                }} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg border border-purple-400/50 transition-all self-start flex items-center gap-2">
                                  <span>Contact for Bulk Price</span>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                {userRole === "reseller" && product.allowResellerMargin && product.resellerPrice && product.availableForRetail !== false && (
                  <div className="flex items-baseline gap-4 mt-1 bg-[#C5A059]/10 p-2 rounded-lg border border-[#C5A059]/30">
                    <span className="text-3xl font-serif font-bold text-green-400">₹{product.resellerPrice}</span>
                    <span className="text-xs text-[#C5A059] font-bold uppercase tracking-wider">Your Dropship Margin ({product.resellerMarginPercentage}%)</span>
                  </div>
                )}
                
                {(() => {
                  const isB2BApproved = typeof window !== 'undefined' && (
                    userRole === "super_admin" ||
                    localStorage.getItem("sd_global_b2b_access") === "true" ||
                    (localStorage.getItem("sd_approved_b2b_suppliers") || "").split(",").includes(String((product as any)?.sellerId))
                  );
                  if (isB2BApproved && product.availableForWholesale && product.wholesaleTerms) {
                    return (
                      <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                        <span className="block text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Wholesale Terms (MOQ & Dispatch)
                        </span>
                        <p className="text-xs text-purple-200 leading-relaxed font-medium">{product.wholesaleTerms}</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="text-gray-300 text-sm italic border-l-2 border-[#C5A059] pl-3 py-1">
                {product.desc || product.longDesc?.substring(0, 100) + '...'}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Material</span>
                  <Link href={`/search?material=${encodeURIComponent(product.material || product.sareeType || '')}`} className="text-xs font-semibold text-white hover:text-[#C5A059] transition-colors underline decoration-[#C5A059]/50 underline-offset-4">{product.material || product.sareeType || "Handloom"}</Link>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Design</span>
                  <Link href={`/search?design=${encodeURIComponent(product.design || '')}`} className="text-xs font-semibold text-white hover:text-[#C5A059] transition-colors underline decoration-[#C5A059]/50 underline-offset-4">{product.design || "Traditional"}</Link>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Color Palette</span>
                  <span className="text-xs font-semibold text-white">{product.colorUse || "Traditional Colors"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Length & Blouse</span>
                  <span className="text-xs font-semibold text-white">{product.length || "6.2 Meters"} {product.hasBlouse ? "(With Blouse)" : ""}</span>
                </div>
                {product.weaverName && product.weaverName.toLowerCase() !== "new" && (
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Weaver / Designer</span>
                    <span className="text-xs font-semibold text-white">{product.weaverName}</span>
                  </div>
                )}
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Payout Protocol</span>
                  <span className="text-xs font-semibold text-green-400">Payment Protected</span>
                </div>
              </div>

              <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block mb-0.5">Sold By</span>
                  <span className="text-sm font-bold text-white uppercase">{sellerDisplayTitle || "Verified Bhulia Hub"}</span>
                </div>
                {actualSeller ? (
                  <Link href={sellerUrl} className="px-3 py-2 bg-[#C5A059]/20 hover:bg-[#C5A059]/40 border border-[#C5A059]/50 text-[#C5A059] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg flex-shrink-0 ml-2 transition-colors">
                    {sellerButtonText}
                  </Link>
                ) : (
                  <button 
                    disabled
                    className="px-3 py-2 bg-gray-800/80 border border-gray-600 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg flex-shrink-0 ml-2 cursor-not-allowed"
                  >
                    Store Coming Soon
                  </button>
                )}
              </div>

              <div className="space-y-2 border-t border-[#C5A059]/20 pt-4 text-gray-200">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Artisan Masterpiece Story</h3>
                <p className="text-xs sm:text-sm font-sans leading-relaxed">{product.longDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {(product.availableForRetail === false) ? (
                  <button 
                    disabled
                    className="w-full py-4 bg-gray-800 text-gray-400 font-bold uppercase tracking-wider rounded-xl cursor-not-allowed border border-gray-700"
                  >
                    B2B Bulk Order Only
                  </button>
                ) : (product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
                  <button 
                    disabled
                    className="w-full py-4 bg-gray-800 text-gray-500 font-bold uppercase tracking-wider rounded-xl cursor-not-allowed border border-gray-700"
                  >
                    SOLD OUT
                  </button>
                ) : (
                  <button 
                    onClick={() => requireLeadCapture(() => addToCart(product), "cart")}
                    className="w-full py-4 bg-gradient-to-r from-[#E57138] to-[#D56128] text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(229,113,56,0.3)] hover:shadow-[0_0_25px_rgba(229,113,56,0.5)] hover:-translate-y-1 transition-all"
                  >
                    🛒 Add to Cart
                  </button>
                )}
                <button 
                  onClick={() => requireLeadCapture(() => addToWishlist(product), "wishlist")}
                  className={`w-full py-4 border-2 ${wishlist.some(w => w.id === product.id) ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]' : 'border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10'} font-bold uppercase tracking-wider rounded-xl transition-all`}
                >
                  {wishlist.some(w => w.id === product.id) ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist'}
                </button>
              </div>
            </div>

            <ShareWidget title={product.title} />

            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-3">Direct Connect (Masked)</span>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  const msg = `Hello ${(product as any).sellerId || "Bhulia Hub"}, I am interested in Product ID #${product.id || product.slug}. Please share details.`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                }} className="flex items-center justify-center gap-2 py-3 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center">
                  <span>💬 WhatsApp</span>
                </button>
                <button onClick={() => {
                  alert(`Connecting you to ${(product as any).sellerId || "Bhulia Hub"} via secure masked call...`);
                }} className="flex items-center justify-center gap-2 py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center">
                  <span>📞 Call</span>
                </button>
              </div>
              <p className="text-[9px] text-gray-400 leading-normal mt-3 text-center">
                For your privacy, direct numbers are masked.
              </p>
            </div>

          </div>

          {/* Column 3: The Right Sidebar */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 h-max pb-12 hidden lg:block">
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-5 shadow-xl text-white">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] tracking-wider border-b border-[#C5A059]/20 pb-3 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                More from this Collection
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {allProductsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-[9/16] bg-black/20 animate-pulse rounded-xl border border-[#C5A059]/10"></div>
                  ))
                ) : products.filter(p => p.id !== product.id && (p.category === product.category || p.material === product.material)).slice(0, 3).map((item, idx) => (
                  <Link key={idx} href={`/product/${item.slug}`} className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-[#C5A059]/30 hover:border-[#C5A059] shadow-lg">
                    <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full p-3">
                      <p className="text-[10px] font-bold text-white leading-tight line-clamp-2 mb-1">{item.title}</p>
                      <p className="text-xs font-serif font-bold text-[#C5A059]">{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile Only: More from Collection */}
          <div className="col-span-1 lg:hidden space-y-6">
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl text-white">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] tracking-wider border-b border-[#C5A059]/20 pb-3 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                More from this Collection
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {allProductsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[9/16] bg-black/20 animate-pulse rounded-xl border border-[#C5A059]/10"></div>
                  ))
                ) : products.filter(p => p.id !== product.id && (p.category === product.category || p.material === product.material)).slice(0, 4).map((item, idx) => (
                  <Link key={idx} href={`/product/${item.slug}`} className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-[#C5A059]/30 hover:border-[#C5A059] shadow-lg">
                    <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full p-2">
                      <p className="text-[9px] font-bold text-white leading-tight line-clamp-2 mb-0.5">{item.title}</p>
                      <p className="text-[10px] font-serif font-bold text-[#C5A059]">{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {product && (
        <div className="fixed bottom-0 left-0 w-full z-50 lg:hidden bg-[#051815]/90 backdrop-blur-md border-t border-[#C5A059]/40 px-4 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg leading-tight">
              {product.price}
            </span>
            <span className="text-[9px] text-[#C5A059] uppercase tracking-widest">
              Direct Weaver Price
            </span>
          </div>
          <button 
            onClick={() => {
              requireLeadCapture(() => addToCart(product), "cart");
            }}
            className="bg-gradient-to-r from-[#E57138] to-[#D56128] text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg hover:shadow-xl transition-all"
          >
            🛒 Add to Cart
          </button>
        </div>
      )}

      {/* Global Footer */}
      
      {showB2BInquiryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B2B26] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowB2BInquiryModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Request Bulk Pricing</h3>
            <p className="text-sm text-gray-300 mb-6">Enter your expected order quantity to view the exclusive B2B Commercial Price for this product.</p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Expected Quantity</label>
              <input type="number" min="1" value={inquiryQuantity} onChange={e => setInquiryQuantity(Number(e.target.value))} className="w-full bg-[#051815] border border-purple-500/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-lg" />
            </div>

            {b2bInquiryStatus === "success" ? (
              <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-center font-bold">
                Request Sent Successfully! Admin will review shortly.
              </div>
            ) : b2bInquiryStatus === "error" ? (
              <div className="bg-red-500/20 text-red-400 p-4 rounded-xl text-center font-bold">
                Error submitting request. Try again.
              </div>
            ) : (
              <button 
                onClick={submitB2BInquiry}
                disabled={b2bInquiryStatus === "submitting"}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                {b2bInquiryStatus === "submitting" ? "Submitting..." : "Submit Inquiry"}
              </button>
            )}
          </div>
        </div>
      )}

      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}

      {/* Interactive Zoom Lightbox */}
      {isLightboxOpen && activeMedia?.type === 'image' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsLightboxOpen(false)}>
          
          {/* Previous Button */}
          {allMedia.length > 1 && (
            <button 
              onClick={handlePrevMedia}
              className="absolute left-4 sm:left-12 z-50 p-4 text-white/50 hover:text-[#C5A059] hover:bg-white/5 rounded-full transition-all backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-14 sm:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full max-h-[85vh]">
              <Image src={activeMedia?.url || ""} alt="Zoomed Product" fill className="object-contain" />
            </div>
            {product?.imageCaptions && product.imageCaptions[activeMediaIndex] && (
              <div className="mt-4 px-6 py-2 bg-black/60 backdrop-blur-md rounded-xl text-white text-sm sm:text-base text-center max-w-3xl border border-[#C5A059]/30 shadow-lg animate-fadeIn">
                {product.imageCaptions[activeMediaIndex]}
              </div>
            )}
          </div>

          {/* Next Button */}
          {allMedia.length > 1 && (
            <button 
              onClick={handleNextMedia}
              className="absolute right-4 sm:right-12 z-50 p-4 text-white/50 hover:text-[#C5A059] hover:bg-white/5 rounded-full transition-all backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-14 sm:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <button className="absolute top-6 right-6 text-white text-opacity-70 hover:text-[#C5A059] text-4xl font-light transition-all transform hover:scale-110 hover:rotate-90">✕</button>
          <div className="absolute bottom-6 left-0 right-0 text-center text-[#C5A059] text-xs font-mono uppercase tracking-widest opacity-70 pointer-events-none">
            Click outside to close
          </div>
        </div>
      )}
    </main>
  );
}
