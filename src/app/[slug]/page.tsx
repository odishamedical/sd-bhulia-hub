"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MASTER_STORES } from "@/app/Sambalpuri-store/data";
import { MASTER_FRANCHISES, DEFAULT_FRANCHISE, FranchiseListing } from "@/app/reseller/data";
import { MASTER_PRODUCTS, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function DynamicSlugPage() {
  const { addToCart, addToWishlist, wishlist } = useCart();
  const params = useParams();
  const router = useRouter();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const slug = rawSlug.toLowerCase();

  const [isStore, setIsStore] = useState<boolean>(false);
  const [franchise, setFranchise] = useState<FranchiseListing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Curation and editor states
  const [editorActive, setEditorActive] = useState<boolean>(false);
  const [curatedProductIds, setCuratedProductIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ [productId: string]: string }>({});
  
  // Auth states
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if it matches a weaver store
    const matchedStore = MASTER_STORES.find(
      (s) => s.slug.toLowerCase() === slug || s.id.toLowerCase() === slug
    );
    if (matchedStore) {
      setIsStore(true);
      router.replace(`/store/${matchedStore.slug}`);
      return;
    }

    // Check if it matches a franchisee
    const matchedFranchise = MASTER_FRANCHISES.find(
      (f) => f.slug.toLowerCase() === slug || f.id.toLowerCase() === slug
    );

    if (matchedFranchise) {
      setFranchise(matchedFranchise);
      
      // Load curated products for this franchise
      const curatedKey = `sd_curation_${matchedFranchise.id}`;
      const savedCurated = localStorage.getItem(curatedKey);
      if (savedCurated) {
        setCuratedProductIds(JSON.parse(savedCurated));
      } else {
        // Default curation: initial products
        const defaults = MASTER_PRODUCTS.slice(0, 4).map(p => p.id);
        setCuratedProductIds(defaults);
        localStorage.setItem(curatedKey, JSON.stringify(defaults));
      }

      // Load custom category mappings
      const catKey = `sd_categories_${matchedFranchise.id}`;
      const savedCats = localStorage.getItem(catKey);
      if (savedCats) {
        setCategories(JSON.parse(savedCats));
      } else {
        const defaults: { [productId: string]: string } = {};
        MASTER_PRODUCTS.forEach(p => {
          defaults[p.id] = p.category;
        });
        setCategories(defaults);
        localStorage.setItem(catKey, JSON.stringify(defaults));
      }
    } else {
      setFranchise(null);
    }
    setLoading(false);
  }, [slug, router]);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid") || "";

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserRole(role);
        setUserUid(uid);
        setUserAvatar(avatar);
      } else {
        setUserName(null);
        setUserRole(null);
        setUserUid("");
        setUserAvatar(null);
      }
    };
    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#C5A059]">Resolving Bhulia Registry...</p>
        </div>
      </div>
    );
  }

  if (isStore) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex items-center justify-center font-sans">
        <p className="text-xs uppercase tracking-widest text-[#C5A059]">Routing to Weaver cooperative...</p>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-2xl font-serif text-[#C5A059] font-bold mb-2">Franchise URL Not Found</h2>
        <p className="text-sm text-gray-300 max-w-md mb-6 leading-relaxed">
          The link you visited does not match any registered franchisee or weaving cooperative in the Bhulia system.
        </p>
        <Link href="/" className="bg-[#C5A059] text-[#0A1021] px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
          Return to Marketplace Home
        </Link>
      </div>
    );
  }

  // Check if current user is the owner of this franchise page
  const isOwner = userRole === "super_admin" || (userRole === "franchisee" && (userUid === franchise.id || userUid === "sd_sso_custom_uid"));
  
  const tier = franchise.subscriptionTier || "free";

  // Enforce Free Tier Block for public visitors
  if (tier === "free" && !isOwner) {
    return (
      <div className="min-h-screen bg-[#051815] text-white flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-serif text-[#C5A059] font-bold mb-2">Storefront Not Active</h2>
        <p className="text-sm text-gray-300 max-w-md mb-6 leading-relaxed">
          This franchise has not yet activated their public storefront. Please check back later.
        </p>
        <Link href="/" className="bg-[#C5A059] text-[#0A1021] px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
          Return to Marketplace Home
        </Link>
      </div>
    );
  }

  // Filter curated products that exist and are active
  let filteredProducts = MASTER_PRODUCTS.filter(
    (p) => p.inStock && curatedProductIds.includes(p.id)
  );

  // Enforce Tier limits (Paid 1 = max 10 products, Free = Mockup limited to 10)
  if (tier === "free" || tier === "paid_1") {
    filteredProducts = filteredProducts.slice(0, 10);
  }

  // Group products by category
  const productsByCategory: { [category: string]: Product[] } = {};
  filteredProducts.forEach(p => {
    const catName = categories[p.id] || p.category || "General Selection";
    if (!productsByCategory[catName]) {
      productsByCategory[catName] = [];
    }
    productsByCategory[catName].push(p);
  });

  // isOwner is already defined above

  const toggleCuration = (productId: string) => {
    let updated;
    if (curatedProductIds.includes(productId)) {
      updated = curatedProductIds.filter(id => id !== productId);
    } else {
      updated = [...curatedProductIds, productId];
    }
    setCuratedProductIds(updated);
    localStorage.setItem(`sd_curation_${franchise.id}`, JSON.stringify(updated));
  };

  const handleCategoryChange = (productId: string, newCatName: string) => {
    const updated = { ...categories, [productId]: newCatName };
    setCategories(updated);
    localStorage.setItem(`sd_categories_${franchise.id}`, JSON.stringify(updated));
  };

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    const shareUrl = `${window.location.origin}/${franchise.slug}?ref=${franchise.id}`;
    const message = `Explore the curated handloom collection of ${franchise.name}. Payout logs and direct logistics tracking enabled. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Sticky Header */}
      

      {/* Editor Banner (If Franchise Owner) */}
      {isOwner && (
        <div className="bg-[#0A3A35] border-b border-[#C5A059] px-4 py-3 text-center flex flex-col sm:flex-row items-center justify-center gap-4 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <p className="text-xs font-semibold text-gray-200">
              You are viewing this storefront as the Owner/Admin. Toggle **Editor Mode** to customize curation.
            </p>
          </div>
          <button 
            onClick={() => setEditorActive(!editorActive)}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
              editorActive 
                ? "bg-red-900/40 border-red-500 text-red-300 hover:bg-red-900/60" 
                : "bg-[#C5A059] border-[#C5A059] text-[#0A1021] hover:brightness-110"
            }`}
          >
            {editorActive ? "Close Editor" : "Enable Editor Mode"}
          </button>
        </div>
      )}

      {/* Public Storefront Content */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10 flex-1">
        
        {/* Banner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Image & Basic Stats */}
          <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
                <Image src={franchise.img} alt={franchise.name} fill className="object-cover" />
                <div className="absolute bottom-4 left-4 bg-[#0B2B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold">
                  {franchise.region}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Franchise Drop-off Hub</span>
                <p className="text-sm font-semibold text-white font-serif">{franchise.city}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[#C5A059]/20 pt-4">
                <div className="bg-[#0A3A35] rounded-xl p-2.5 border border-[#C5A059]/20 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-gray-300 block mb-1">Outlets</span>
                  <p className="text-base font-black text-[#C5A059]">{franchise.phygitalOutletsCount}</p>
                </div>
                <div className="bg-[#0A3A35] rounded-xl p-2.5 border border-[#C5A059]/20 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-gray-300 block mb-1">Referrals</span>
                  <p className="text-base font-black text-[#C5A059]">{franchise.referralsTracked}</p>
                </div>
                <div className="bg-[#0A3A35] rounded-xl p-2.5 border border-[#C5A059]/20 text-center font-mono">
                  <span className="text-[8px] uppercase tracking-widest text-gray-300 block mb-1">Total Paid</span>
                  <p className="text-[9px] font-black text-green-400 mt-1 uppercase tracking-widest leading-none">{franchise.totalCommissionPaid}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#C5A059]/20 pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold block">Share Curated Link</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                  <span>📲 Share WA</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                  <span>📘 Share FB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Block: Franchise Description & Details */}
          <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-3">
                  <span>Verified Franchise Storefront</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#C5A059] leading-tight">{franchise.name}</h2>
              </div>

              <div className="space-y-4 leading-relaxed text-sm font-sans text-gray-200">
                <p className="border-l-2 border-[#C5A059] pl-3 py-1 text-gray-300">
                  {franchise.description}
                </p>
              </div>

              {/* Roster of Outlets */}
              <div className="border-t border-[#C5A059]/20 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Phygital Showrooms & Drop-Off Locations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {franchise.outletsList.map((outlet, idx) => (
                    <div key={idx} className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-3 text-center">
                      <span className="text-xs font-semibold text-white block">{outlet}</span>
                      <span className="text-[9px] text-green-400 uppercase tracking-widest block mt-1">● QC Operations Live</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#C5A059]/20 pt-6 mt-6">
              <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Authenticity Verification Pillars</h3>
              <div className="flex flex-wrap gap-2">
                {franchise.specialtyTags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-lg text-xs font-semibold">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Curation Grid (Editor Mode View vs Public View) */}
        {editorActive ? (
          // Editor Mode Catalog Curation View
          <div className="bg-[#0B2B26] border-2 border-dashed border-[#C5A059] rounded-3xl p-6 space-y-6">
            <div className="border-b border-[#C5A059]/30 pb-4">
              <h3 className="text-lg font-serif text-[#C5A059] font-bold">Catalog Curator Editor</h3>
              <p className="text-xs text-gray-300 mt-1">
                Select which products you want to feature on your page, and assign custom categories to organize them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MASTER_PRODUCTS.map((prod) => {
                const isChecked = curatedProductIds.includes(prod.id);
                return (
                  <div key={prod.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isChecked ? "bg-[#0A3A35]/40 border-[#C5A059]" : "bg-black/20 border-gray-800 opacity-60"
                  }`}>
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-700 bg-gray-900">
                        <Image src={prod.img} alt={prod.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{prod.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{prod.weave} • {prod.price}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <input 
                            type="checkbox" 
                            id={`curate-${prod.id}`}
                            checked={isChecked}
                            onChange={() => toggleCuration(prod.id)}
                            className="w-3.5 h-3.5 accent-[#C5A059] cursor-pointer"
                          />
                          <label htmlFor={`curate-${prod.id}`} className="text-[10px] text-gray-200 cursor-pointer font-bold select-none">
                            {isChecked ? "✓ Curated" : "Add to Storefront"}
                          </label>
                        </div>
                      </div>
                    </div>

                    {isChecked && (
                      <div className="mt-4 pt-3 border-t border-[#C5A059]/10">
                        <label className="text-[9px] uppercase tracking-widest text-[#C5A059] block mb-1">Storefront Category</label>
                        <input 
                          type="text"
                          value={categories[prod.id] || ""}
                          onChange={(e) => handleCategoryChange(prod.id, e.target.value)}
                          placeholder="e.g. Silk Masterpieces, Cotton Classics"
                          className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-[#051815] rounded-2xl p-4 border border-[#C5A059]/30 text-center">
              <p className="text-xs text-gray-300 font-mono">
                ⚡ Weaver Stock updates are synced automatically in real-time. Out of stock products hide automatically.
              </p>
            </div>
          </div>
        ) : (
          // Public Storefront Products List by Category
          <div className="space-y-12">
            {Object.keys(productsByCategory).length === 0 ? (
              <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/20 rounded-3xl">
                <span className="text-4xl">🛍️</span>
                <h3 className="text-lg font-serif font-bold text-gray-300 mt-2">No Products Featured Yet</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  The franchisee is currently selecting products. Check back soon for handloom masterpieces.
                </p>
              </div>
            ) : (
              Object.keys(productsByCategory).map((catName) => (
                <div key={catName} className="space-y-6">
                  <div className="border-b border-[#C5A059]/30 pb-3">
                    <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">{catName}</h3>
                    <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest mt-1">
                      Curated collection directly sourced from premium weaver pit looms
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {productsByCategory[catName].map((prod) => (
                      <div key={prod.id} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5">
                        
                        <div className="relative w-full h-44 sm:h-60 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                          <Image src={prod.img} alt={prod.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">{prod.weave}</span>
                          
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B2B26] to-transparent p-3 pt-8">
                            <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-bold">
                              Sourcing: {prod.village}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-0.5 leading-tight line-clamp-1">{prod.title}</h4>
                            <p className="text-[10px] text-gray-300 leading-normal line-clamp-2">{prod.desc}</p>
                          </div>

                          <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-2.5">
                            <div>
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Price</span>
                              <span className="text-base font-serif font-bold text-[#C5A059]">{prod.price}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest block">QC Center</span>
                              <span className="text-[10px] font-mono text-gray-200 font-bold">{franchise.city}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/10">
                            <button onClick={() => {
                              const shareUrl = `${window.location.origin}/product/${prod.slug}?ref=${franchise.id}`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + prod.title + " from Bhulia Hub: " + shareUrl)}`, "_blank");
                            }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                              <span>📲 Share</span>
                            </button>
                            <button onClick={() => {
                              const shareUrl = `${window.location.origin}/product/${prod.slug}?ref=${franchise.id}`;
                              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                            }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                              <span>📘 Share</span>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button 
                              onClick={() => addToCart(prod)}
                              className="w-full py-2 bg-gradient-to-r from-[#E57138] to-[#D56128] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-center block"
                            >
                              Add to Cart
                            </button>
                            <button 
                              onClick={() => addToWishlist(prod)}
                              className={`w-full py-2 border ${wishlist.some(w => w.id === prod.id) ? 'bg-[#C5A059] text-[#0A1021] border-[#C5A059]' : 'border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10'} font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center block`}
                            >
                              {wishlist.some(w => w.id === prod.id) ? '❤️ Saved' : '🤍 Wishlist'}
                            </button>
                          </div>

                          <Link href={`/product/${prod.slug}?ref=${franchise.id}`} className="w-full py-2 bg-[#0A3A35] border border-[#C5A059]/30 text-[#C5A059] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#0D4B45] transition-all text-center block mt-2">
                            View details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Global Footer */}
      
    </main>
  );
}
