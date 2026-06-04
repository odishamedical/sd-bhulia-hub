"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProductBySlug, useProducts, addOrder } from "@/lib/db-hooks";
import { MASTER_FRANCHISES } from "@/app/franchise/data";
import ProfileBlockerModal from "../../../components/ProfileBlockerModal";

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = typeof params?.productId === "string" ? params.productId : "";
  const productSlug = rawId.toLowerCase();

  const { product, loading: productLoading } = useProductBySlug(productSlug);
  const { products, loading: allProductsLoading } = useProducts();

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
    paymentMode: "escrow"
  });
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);
  const [activeImg, setActiveImg] = useState<string>("");

  useEffect(() => {
    if (product) {
      setActiveImg(product.img);
    }
  }, [product]);

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
        // Set persistent cookie (30 days)
        document.cookie = `sd_referral_id=${refId}; path=/; max-age=${30 * 24 * 60 * 60};`;
        
        // Find matching franchisee
        const matched = MASTER_FRANCHISES.find(
          (f) => f.id.toLowerCase() === refId.toLowerCase() || f.slug.toLowerCase() === refId.toLowerCase()
        );
        if (matched) {
          /* removed setState */
        } else {
          /* removed setState */
        }
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  const handleSocialShare = (platform: "whatsapp" | "facebook", customRefId?: string) => {
    if (!product) return;
    const finalRef = customRefId || userUid;
    const shareUrl = `${window.location.origin}/product/${product.slug}?ref=${finalRef}`;
    const message = `Check out this gorgeous authentic GI-Tagged ${product.title} from Bhulia Hub! Direct weaver-to-consumer escrow purchase. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

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
      paymentStatus: "Escrow Locked",
      logisticsStatus: "Pending Weaver Handover",
      qcStatus: "Pending Sourcing" as const,
      timestamp: new Date().toISOString()
    };

    const res = await addOrder(newOrder);
    setIsOrdering(false);

    if (res.success) {
      setOrderStep(2); // Success Step

      // Record local fallback
      const existingOrders = JSON.parse(localStorage.getItem("sd_all_orders") || "[]");
      existingOrders.push({ ...newOrder, id: res.id });
      localStorage.setItem("sd_all_orders", JSON.stringify(existingOrders));

      // Trigger local notification fallback
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
      alert("Error placing escrow order. Please try again.");
    }
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      

      {/* Mobile Drawer */}
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

      {/* Shopper Referral Alert Bar */}
      {referrerName && (
        <div className="bg-[#C5A059] text-[#051815] py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider shadow-inner flex justify-center items-center gap-2 z-30">
          <span>✨</span>
          <span>Shopping curated collection referred by <strong>{referrerName}</strong> — Authenticity Escrow Protected</span>
          <span>✨</span>
        </div>
      )}

      {/* Main product showcase page layout */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {productLoading ? (
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
                    <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-[#0B2B26] rounded-t-xl">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Large image & trust badges */}
            <div className="lg:col-span-6 space-y-6">
            <div className="relative w-full h-[320px] sm:h-[500px] rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl bg-[#0B2B26] p-0.5">
              <div className="relative w-full h-full rounded-[22px] overflow-hidden">
                <Image src={activeImg || product.img} alt={product.title} fill className="object-cover animate-fadeIn" />
              </div>
              
              {product.isGI && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold shadow-lg border border-[#C5A059]">
                  ✓ GI-TAG VERIFIED ARTISAN MASTERPIECE
                </div>
              )}

              {product.isBhuliaVerified && (
                <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-[#FFF5C0] via-[#D4AF37] via-[#C5A059] to-[#8A5A00] border-2 border-[#FFF0A5] shadow-[0_12px_30px_rgba(0,0,0,0.85),inset_0_3px_4px_rgba(255,255,255,0.9)] w-24 h-24 transform rotate-12 animate-pulse" style={{ animationDuration: '3s' }}>
                  <span className="text-[8px] font-serif font-black tracking-widest text-[#0A1021] uppercase leading-none mb-1 text-center">
                    BHULIA.COM
                  </span>
                  <span className="text-[10px] font-serif font-black tracking-wider text-[#0A1021] uppercase leading-none text-center">
                    VERIFIED
                  </span>
                  <span className="text-[7px] font-mono text-[#0A1021] uppercase tracking-widest mt-1">
                    ✓ PREMIUM
                  </span>
                </div>
              )}
            </div>

            {/* Product Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[product.img, product.img2, product.img3, product.img4].filter(Boolean).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImg(image || "")}
                  className={`relative aspect-square rounded-2xl overflow-hidden border bg-[#0B2B26] p-0.5 transition-all cursor-pointer ${
                    activeImg === image ? "border-[#C5A059] ring-1 ring-[#C5A059]/40" : "border-[#C5A059]/20 hover:border-[#C5A059]/50"
                  }`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image src={image || ""} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </div>
                </button>
              ))}
            </div>

            {/* Sharing widgets */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-3">Share & Earn Commissions</span>
              <div className="mb-4">
                <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Your Referral ID (Optional)</label>
                <input type="text" id="customReferralInput" placeholder="e.g. SDR-1234" className="w-full bg-[#0A3A35] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  const val = (document.getElementById('customReferralInput') as HTMLInputElement)?.value;
                  handleSocialShare("whatsapp", val);
                }} className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                  <span>📲 Share via WhatsApp</span>
                </button>
                <button onClick={() => {
                  const val = (document.getElementById('customReferralInput') as HTMLInputElement)?.value;
                  handleSocialShare("facebook", val);
                }} className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                  <span>📘 Share via Facebook</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-300 leading-normal mt-3 text-center">
                Sharing this page creates a tracking cookie containing your referral ID. Registered Resellers receive a commission on successfully completed escrow checkouts.
              </p>
            </div>

            {/* Masked Contact Widgets */}
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

          {/* Right Side: Specific Details and direct checkout */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Core specs details */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl text-white space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span>{product.category}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059] leading-tight">{product.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 font-bold">★★★★★</span>
                  <span className="text-xs text-gray-300">({product.rating || "5.0 (New Listing)"})</span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="flex items-baseline gap-4 border-t border-b border-[#C5A059]/20 py-4">
                <span className="text-3xl font-serif font-bold text-[#C5A059]">{product.price}</span>
                <span className="text-sm text-gray-400 line-through">{product.mrp || `₹ ${(parseFloat(product.price.replace(/[^0-9]/g, '')) * 1.2).toLocaleString('en-IN')}`}</span>
                <span className="text-xs text-green-400 font-bold">Direct Weaver Price</span>
              </div>

              {/* Weaver Specs details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Weaving Cluster</span>
                  <span className="text-xs font-semibold text-white">{product.village || "Dasrajpur"}, {product.cluster || "Sonepur Cluster"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Weaving Duration</span>
                  <span className="text-xs font-semibold text-[#C5A059]">{product.weavingDuration || product.time || "35 Days"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Saree Type</span>
                  <span className="text-xs font-semibold text-white">{product.sareeType || product.category || "Silk(pata)"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Manufacturing Process</span>
                  <span className="text-xs font-semibold text-white">{product.manufacturingProcess || product.weave || "Double Ikat(double bandha)"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Design Theme</span>
                  <span className="text-xs font-semibold text-white">{product.designType || "Pasapali(saptapar)"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Thread Type</span>
                  <span className="text-xs font-semibold text-white">{product.threadType || product.yarnType || "100 Count"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Color Palette</span>
                  <span className="text-xs font-semibold text-white">{product.colorUse || "Organic Dyes"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Weaver / Designer</span>
                  <span className="text-xs font-semibold text-white">{product.weaverName || "Master Weaver"} / {product.designerName || "Traditional"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Length & Blouse</span>
                  <span className="text-xs font-semibold text-white">{product.length || "6.2 Meters"} {product.hasBlouse ? "(With Blouse)" : "(No Blouse)"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Escrow Protocol</span>
                  <span className="text-xs font-semibold text-green-400">{product.escrowStatus || "100% Escrow Protected"}</span>
                </div>
              </div>

              {/* Sold By Section (B2B Directory Link) */}
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

              {/* Detailed Description */}
              <div className="space-y-2 border-t border-[#C5A059]/20 pt-4 text-gray-200">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Artisan Masterpiece Story</h3>
                <p className="text-xs sm:text-sm font-sans leading-relaxed">{product.longDesc}</p>
              </div>
            </div>

            {/* Escrow Checkout block */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
              {orderStep === 1 ? (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <h3 className="text-base font-serif font-bold text-[#C5A059] tracking-wider border-b border-[#C5A059]/20 pb-2">Direct Pit Loom Escrow Checkout</h3>
                  
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
                    <button type="submit" disabled={isOrdering} className="bhulia-gold-button w-full py-3 text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:brightness-110 cursor-pointer disabled:opacity-50">
                      {isOrdering ? "Securing Escrow Channel..." : "Order with D2C Escrow Protection"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <span className="text-4xl">🎉</span>
                  <h3 className="text-xl font-serif font-bold text-green-400">Order Locked & Escrow Secured!</h3>
                  <p className="text-xs text-gray-200 leading-relaxed max-w-sm mx-auto">
                    Thank you {orderForm.fullName}. Your purchase of {selectedQuantity} {product.title} has been locked into the Shyam Dash escrow registry. Weaver payout starts upon courier confirmation.
                  </p>
                  <button onClick={() => setOrderStep(1)} className="px-6 py-2.5 bg-[#0A3A35] border border-[#C5A059] text-white rounded-xl text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-colors cursor-pointer">
                    Place Another Order
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
        )}

      </div>

      {/* Global Footer */}
      
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </main>
  );
}
