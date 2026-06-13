"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProductBySlug, useProducts, addOrder } from "@/lib/db-hooks";
import { MASTER_FRANCHISES } from "@/app/reseller/data";
import { useCart } from "@/context/CartContext";
import { useLeadCapture } from "@/context/LeadCaptureContext";
import ShareWidget from "@/components/ShareWidget";
import GlobalBannerSlot from "@/components/GlobalBannerSlot";
import ProfileBlockerModal from "../../../components/ProfileBlockerModal";
import { FastAverageColor } from 'fast-average-color';
import Breadcrumbs from "@/components/Breadcrumbs";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

export default function ProductDetailPage() {
  const { addToCart, addToWishlist, wishlist } = useCart();
  const { requireLeadCapture } = useLeadCapture();
  const params = useParams();
  const rawId = typeof params?.productId === "string" ? params.productId : "";
  const productSlug = rawId; // Removed .toLowerCase() to support case-sensitive Firebase IDs

  const { product, loading: productLoading } = useProductBySlug(productSlug);
  const { products, loading: allProductsLoading } = useProducts({ status: "approved" });

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [orderStep, setOrderStep] = useState<number>(1);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    pincode: "",
    paymentMode: "payout"
  });
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>("rgba(197,160,89,0.15)");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    const userEmail = localStorage.getItem("sd_current_user_email");
    const isProfileComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";

    if (!userEmail || !isProfileComplete) {
      setShowProfileBlocker(true);
      return;
    }

    setIsOrdering(true);
    const referralId = localStorage.getItem("sd_referral_id");
    const newOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      productName: product.title,
      productPrice: product.price,
      quantity: selectedQuantity,
      customerName: orderForm.fullName,
      customerPhone: orderForm.mobile,
      customerAddress: `${orderForm.address}, Pin: ${orderForm.pincode}`,
      referralId: referralId || null,
      proxyBuyerId: null,
      paymentMode: orderForm.paymentMode,
      paymentStatus: "Payout Locked",
      logisticsStatus: "Pending Weaver Handover",
      qcStatus: "Pending Sourcing" as const,
      timestamp: new Date().toISOString()
    };

    const res = await addOrder(newOrder);
    setIsOrdering(false);

    if (res.success) {
      setOrderStep(2); 

      const existingOrders = JSON.parse(localStorage.getItem("sd_all_orders") || "[]");
      existingOrders.push({ ...newOrder, id: res.id });
      localStorage.setItem("sd_all_orders", JSON.stringify(existingOrders));

      if (referralId) {
        const notifications = JSON.parse(localStorage.getItem("sd_franchise_notifications") || "[]");
        notifications.push({
          id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
          referralId: referralId,
          title: "New Referral Sale!",
          message: `Referral sale of ${selectedQuantity}x ${product.title} by ${orderForm.fullName} completed. Earned commission.`,
          timestamp: new Date().toISOString(),
          read: false
        });
        localStorage.setItem("sd_franchise_notifications", JSON.stringify(notifications));
      }
    } else {
      alert("Error placing payout order. Please try again.");
    }
  };

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
          const isB2BApproved = userRole === "reseller" || userRole === "wholesaler" || userRole === "shop" || userRole === "store" || userRole === "weaver" || userRole === "super_admin";
          const isRetail = product?.availableForRetail !== false;
          const isWholesale = product?.availableForWholesale === true;

          if (product && !isB2BApproved && !isRetail && isWholesale) {
            return (
              <div className="min-h-[60vh] flex items-center justify-center bg-transparent text-center p-6 w-full">
                <div className="bg-[#0B2B26] border border-[#C5A059]/30 p-10 rounded-3xl shadow-2xl max-w-lg w-full">
                  <span className="text-6xl mb-4 block">🔒</span>
                  <h1 className="text-2xl font-bold text-[#C5A059] mb-2">B2B Exclusive Product</h1>
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">This product is strictly available for our verified Wholesale partners. Please login with a B2B account to view commercial pricing.</p>
                  <Link href="/" className="bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg">Return to Catalog</Link>
                </div>
              </div>
            );
          }

          return productLoading ? (
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
            
            <div className="lg:col-span-6 space-y-6">
              
            <div 
              onClick={() => { if (activeMedia?.type === 'image') setIsLightboxOpen(true); }}
              className={`relative w-full flex justify-center items-center rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 p-1 transition-all duration-500 hover:border-[#C5A059] ${activeMedia?.type === 'image' ? 'cursor-zoom-in' : ''}`}
            >
              <div className="relative w-full h-[50vh] sm:h-[70vh] rounded-[22px] overflow-hidden bg-[#0B2B26] flex items-center justify-center">
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
                        <Image src={`https://img.youtube.com/vi/${media.url.split('v=')[1]?.split('&')[0] || media.url.split('/').pop()}/maxresdefault.jpg`} alt="Video Thumbnail" fill className="object-cover opacity-60" />
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

          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24 h-max pb-12">
            
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
                <div className="flex items-baseline gap-4">
                  {(() => {
                    const isB2BApproved = userRole === "reseller" || userRole === "wholesaler" || userRole === "shop" || userRole === "store" || userRole === "weaver" || userRole === "super_admin";
                    const isRetail = product.availableForRetail !== false;
                    const isWholesale = product.availableForWholesale === true;
                    
                    if (isB2BApproved && isWholesale) {
                      return (
                        <>
                          <span className="text-3xl font-serif font-bold text-[#C5A059]">₹{product.commercialPrice?.toLocaleString() || product.price}</span>
                          <span className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-2 py-1 rounded font-bold uppercase tracking-widest border border-[#C5A059]/20 whitespace-nowrap">B2B Wholesale Price</span>
                          {isRetail && (
                            <span className="text-sm text-gray-500 line-through ml-2">Retail: ₹{(parseFloat(product.price.toString().replace(/[^0-9]/g, ''))).toLocaleString('en-IN')}</span>
                          )}
                        </>
                      );
                    }
                    
                    return (
                      <>
                        <span className={`text-3xl font-serif font-bold ${userRole === "reseller" && product.allowResellerMargin ? "text-gray-400 line-through text-2xl" : "text-[#C5A059]"}`}>{product.price}</span>
                        {(!userRole || userRole !== "reseller" || !product.allowResellerMargin) && (
                          <span className="text-sm text-gray-400 line-through">{product.mrp || `₹ ${(parseFloat(product.price.toString().replace(/[^0-9]/g, '')) * 1.2).toLocaleString('en-IN')}`}</span>
                        )}
                        {(!userRole || userRole !== "reseller" || !product.allowResellerMargin) && (
                          <span className="text-xs text-green-400 font-bold">Direct Weaver Price</span>
                        )}
                      </>
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
                  const isB2BApproved = userRole === "reseller" || userRole === "wholesaler" || userRole === "shop" || userRole === "store" || userRole === "weaver" || userRole === "super_admin";
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
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Weaver / Designer</span>
                  <span className="text-xs font-semibold text-white">{product.weaverName || "Master Weaver"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Payout Protocol</span>
                  <span className="text-xs font-semibold text-green-400">Payment Protected</span>
                </div>
              </div>

              <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block mb-0.5">Sold By</span>
                  <span className="text-sm font-bold text-white uppercase">{(product as any).sellerId || "Verified Bhulia Hub"}</span>
                </div>
                <Link 
                  href={`/store/${(product as any).sellerId || "maa-samaleswari-weavers"}`}
                  className="px-4 py-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg hover:brightness-110"
                >
                  View Store & Workspace
                </Link>
              </div>

              <div className="space-y-2 border-t border-[#C5A059]/20 pt-4 text-gray-200">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Artisan Masterpiece Story</h3>
                <p className="text-xs sm:text-sm font-sans leading-relaxed">{product.longDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {(product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
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

            {/* Payout Checkout block */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
              {orderStep === 1 ? (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <h3 className="text-base font-serif font-bold text-[#C5A059] tracking-wider border-b border-[#C5A059]/20 pb-2">Direct Pit Loom Payout Checkout</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Full Name</label>
                      <input required type="text" value={orderForm.fullName} onChange={e => setOrderForm({...orderForm, fullName: e.target.value})} className="w-full bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" placeholder="Your Name" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Mobile Number</label>
                      <input required type="tel" value={orderForm.mobile} onChange={e => setOrderForm({...orderForm, mobile: e.target.value})} className="w-full bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" placeholder="91xxxxxx" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Shipping Address</label>
                    <textarea required rows={2} value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} className="w-full bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" placeholder="Complete Address"></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Pincode</label>
                      <input required type="text" value={orderForm.pincode} onChange={e => setOrderForm({...orderForm, pincode: e.target.value})} className="w-full bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" placeholder="76xxxx" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Select Quantity</label>
                      <select value={selectedQuantity} onChange={e => setSelectedQuantity(Number(e.target.value))} className="w-full bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]">
                        {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>{q} Saree</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    {(product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) ? (
                      <button type="button" disabled className="w-full py-3 bg-gray-800 border border-gray-700 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl cursor-not-allowed">
                        Out of Stock
                      </button>
                    ) : (
                      <button type="submit" disabled={isOrdering} className="bhulia-gold-button w-full py-3 text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:brightness-110 cursor-pointer disabled:opacity-50">
                        {isOrdering ? "Securing Payout Channel..." : "Order with D2C Payout Protection"}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <span className="text-4xl">🎉</span>
                  <h3 className="text-xl font-serif font-bold text-green-400">Order Locked & Payout Secured!</h3>
                  <p className="text-xs text-gray-200 leading-relaxed max-w-sm mx-auto">
                    Thank you {orderForm.fullName}. Your purchase of {selectedQuantity} {product.title} has been locked into the Shyam Dash payout registry. Weaver payout starts upon courier confirmation.
                  </p>
                  <button onClick={() => setOrderStep(1)} className="px-6 py-2.5 bg-[#0A3A35] border border-[#C5A059] text-white rounded-xl text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-colors cursor-pointer">
                    Place Another Order
                  </button>
                </div>
              )}
            </div>

            <ShareWidget title={product.title} />

            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-3">Direct Connect (Masked)</span>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  const msg = `Hello ${(product as any).sellerId || "Bhulia Hub"}, I am interested in Product ID #${product.id || product.slug}. Please share details.`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                }} className="flex items-center justify-center gap-2 py-3 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center">
                  <span>💬 WhatsApp Seller</span>
                </button>
                <button onClick={() => {
                  alert(`Connecting you to ${(product as any).sellerId || "Bhulia Hub"} via secure masked call...`);
                }} className="flex items-center justify-center gap-2 py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center">
                  <span>📞 Secure Call</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal mt-3 text-center">
                For your privacy, direct numbers are masked. Inquiries use our secure central routing.
              </p>
            </div>

          </div>

        </div>
        );
      })()}

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
