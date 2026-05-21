"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import EcosystemSwitcher from "../../../components/EcosystemSwitcher";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MASTER_PRODUCTS, Product as SareeDetail } from "@/lib/products";
import { MASTER_FRANCHISES } from "@/app/franchise/data";

const DEFAULT_PRODUCT: SareeDetail = {
  id: "SAR-999",
  slug: "genuine-sambalpuri-handloom-saree",
  title: "Genuine Sambalpuri Handloom Saree",
  category: "Heritage Collection",
  desc: "Authentic GI-Tagged Sambalpuri handloom direct from the village pit loom.",
  longDesc: "A premium handwoven saree utilizing authentic Odishan tie-dye ikat craft. Features beautiful temple borders and custom motifs.",
  price: "₹ 15,900",
  mrp: "₹ 21,000",
  weave: "Ikat Handloom",
  time: "20 Days Handweaving",
  cluster: "Odisha Handloom Belt",
  village: "Artisan Village",
  yarnType: "Pure Mercerized Handloom Yarn",
  isGI: true,
  escrowStatus: "100% Escrow Protected Payouts Enabled",
  rating: "4.9 (5 Reviews)",
  img: "/bhulia-hero.png",
  inStock: true
};

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = typeof params?.productId === "string" ? params.productId : "dasrajpur-royal-pasapalli-double-ikat-pata";
  const productSlug = rawId.toLowerCase();

  const product = MASTER_PRODUCTS.find(
    (p) => p.slug === productSlug || p.id.toLowerCase() === productSlug
  ) || {
    ...DEFAULT_PRODUCT,
    id: productSlug.toUpperCase(),
    slug: productSlug,
    title: productSlug.replace(/-/g, " ").toUpperCase(),
  };

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
          setReferrerName(matched.name);
        } else {
          setReferrerName("Bhulia Associate (" + refId + ")");
        }
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    const shareUrl = `${window.location.origin}/product/${product.slug}?ref=${userUid}`;
    const message = `Check out this gorgeous authentic GI-Tagged ${product.title} from Bhulia Hub! Direct weaver-to-consumer escrow purchase. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderStep(2); // Success Step

      // Record the order details
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
        leg1LabelGenerated: false,
        leg2LabelGenerated: false,
        qcStatus: "Pending Sourcing",
        timestamp: new Date().toISOString()
      };

      const existingOrders = JSON.parse(localStorage.getItem("sd_all_orders") || "[]");
      existingOrders.push(newOrder);
      localStorage.setItem("sd_all_orders", JSON.stringify(existingOrders));

      // Trigger a dynamic local notification event
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
    }, 2000);
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">BHULIA.COM</h1>
              </Link>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri Heritage Product Hub</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <Link href="/#cotton-sambalpuri" className="hover:text-[#C5A059] transition-colors pb-1">Products</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Weavers Guild</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <EcosystemSwitcher />

            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

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
        
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Large image & trust badges */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative w-full h-[320px] sm:h-[500px] rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl bg-[#0B2B26] p-0.5">
              <div className="relative w-full h-full rounded-[22px] overflow-hidden">
                <Image src={product.img} alt={product.title} fill className="object-cover" />
              </div>
              
              {product.isGI && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold shadow-lg border border-[#C5A059]">
                  ✓ GI-TAG VERIFIED ARTISAN MASTERPIECE
                </div>
              )}
            </div>

            {/* Sharing widgets */}
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-3">Share & Earn Commissions</span>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                  <span>📲 Share via WhatsApp</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                  <span>📘 Share via Facebook</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-300 leading-normal mt-3 text-center">
                Sharing this page creates a tracking cookie containing your referral ID. Registered franchises and users receive a 5% commission on successfully completed escrow checkouts.
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
                  <span className="text-xs text-gray-300">({product.rating})</span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="flex items-baseline gap-4 border-t border-b border-[#C5A059]/20 py-4">
                <span className="text-3xl font-serif font-bold text-[#C5A059]">{product.price}</span>
                <span className="text-sm text-gray-400 line-through">{product.mrp}</span>
                <span className="text-xs text-green-400 font-bold">Save 18% Direct Weaver Price</span>
              </div>

              {/* Weaver Specs details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Weaving Cluster</span>
                  <span className="text-xs font-semibold text-white">{product.village}, {product.cluster}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Time of Weave</span>
                  <span className="text-xs font-semibold text-[#C5A059]">{product.time}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Yarn Quality</span>
                  <span className="text-xs font-semibold text-white">{product.yarnType}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-0.5">Escrow Protocol</span>
                  <span className="text-xs font-semibold text-green-400">{product.escrowStatus}</span>
                </div>
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

      </div>

      {/* Global Footer */}
      <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-8 px-6 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sovereign Heritage Product Hub</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">© 2026 Bhulia.com. All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}
