"use client";

import { useState, useEffect } from "react";
import SaaSUpgraderModal from "@/components/SaaSUpgraderModal";
import ActiveSubscriptionDashboard from "@/components/ActiveSubscriptionDashboard";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PricingTab({ isPublicPage = false, userRole = "weaver" }: { isPublicPage?: boolean, userRole?: "weaver" | "shop" | "wholesaler" | "supplier" }) {
  const [role, setRole] = useState<"weaver" | "shop" | "wholesaler" | "supplier">(userRole);
  
  // Upgrader Modal State
  const [isUpgraderOpen, setIsUpgraderOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // User Subscription State
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    if (isPublicPage) {
      setLoadingSub(false);
      return;
    }
    
    // Using a delay to ensure auth is initialized if it's not already
    const checkSub = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingSub(false);
        return;
      }
      try {
        const d = await getDoc(doc(db, "users", user.uid));
        if (d.exists()) {
          setSubscriptionData(d.data());
        }
      } catch (err) {
        console.error("Failed to fetch user sub", err);
      } finally {
        setLoadingSub(false);
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) checkSub();
      else setLoadingSub(false);
    });

    return () => unsubscribe();
  }, [isPublicPage]);

  const getRoleTitle = (tier: string) => {
    if (role === "weaver") return `Weaver ${tier}`;
    if (role === "wholesaler") return `Wholesaler ${tier}`;
    if (role === "supplier") return `Supplier ${tier}`;
    return `Shop ${tier}`;
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlanId(planId);
    setIsUpgraderOpen(true);
  };

  return (
    <div className={`relative overflow-hidden font-sans ${isPublicPage ? 'min-h-screen bg-[#051815] text-white py-20 px-4' : 'bg-[#051815] text-white rounded-3xl p-8 shadow-xl border border-[#C5A059]/20'}`}>
      
      <SaaSUpgraderModal 
        isOpen={isUpgraderOpen} 
        onClose={() => setIsUpgraderOpen(false)} 
      />

      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#C5A059]/20 to-transparent blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-t from-blue-900/20 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Component */}
        <div className="text-center mb-10 animate-in slide-in-from-bottom-8 duration-700">
          {isPublicPage && (
            <a href="/" className="inline-block text-[#C5A059] font-serif font-black text-xl mb-8 hover:text-white transition-colors">
              ← Back to Bhulia
            </a>
          )}
          <h1 className={`${isPublicPage ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'} font-black font-serif text-white mb-6 tracking-tight`}>
            Plans that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-yellow-200">Scale</span> with You.
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Whether you are an independent weaver or a large retail shop, Bhulia Hub offers the perfect tools to automate your business, logistics, and B2B sales.
          </p>
        </div>

        {/* Role Toggle ONLY on Public Page */}
        {isPublicPage && (
          <div className="flex justify-center mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-150">
            <div className="bg-[#0A221E] p-1.5 rounded-2xl flex border border-[#C5A059]/20 shadow-xl">
              <button 
                onClick={() => setRole("weaver")}
                className={`px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-300 ${role === "weaver" ? "bg-gradient-to-r from-[#C5A059] to-yellow-600 text-black shadow-lg shadow-[#C5A059]/20" : "text-slate-400 hover:text-white"}`}
              >
                For Weavers
              </button>
              <button 
                onClick={() => setRole("shop")}
                className={`px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-300 ${role === "shop" ? "bg-gradient-to-r from-[#C5A059] to-yellow-600 text-black shadow-lg shadow-[#C5A059]/20" : "text-slate-400 hover:text-white"}`}
              >
                For Shops
              </button>
            </div>
          </div>
        )}

        {/* Active Subscription Dashboard (If User is Subscribed) */}
        {!loadingSub && subscriptionData?.subscriptionStatus === "active" && (
          <ActiveSubscriptionDashboard 
            subscriptionId={subscriptionData.subscriptionId} 
            planId={subscriptionData.planId || "PRO"}
            onCancelSuccess={() => {
              setSubscriptionData((prev: any) => ({ ...prev, subscriptionStatus: "cancelled" }));
            }}
          />
        )}

        {/* Pricing Tickets Container (Show if not active) */}
        {(!subscriptionData || subscriptionData.subscriptionStatus !== "active") && (
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-12 duration-700 delay-300 mt-12">

          
          {/* Free Tier */}
          <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-[#0A221E]/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 flex flex-col hover:border-slate-500 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-black text-white mb-2">Basic Starter</h3>
              <p className="text-slate-400 text-xs">Perfect for claiming your brand profile.</p>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-black text-white">₹0</span>
              <span className="text-slate-400 font-medium pb-1">/forever</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-green-400 font-bold">✓</span> Claim Public Profile
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-green-400 font-bold">✓</span> Basic Analytics
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> Upload Products (Limit: 0)
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> Standard Platform Commission
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> B2B Wholesale Disabled
              </li>
            </ul>
            {isPublicPage && (
              <a href={role === "weaver" ? "/register-weaver" : "/register-shop"} className="w-full block text-center py-3 rounded-xl border border-slate-600 text-slate-300 font-bold text-sm hover:bg-slate-800 transition-colors mt-auto">
                Get Started Free
              </a>
            )}
          </div>

          {/* Pro Monthly Tier */}
          <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-[#0A221E]/60 backdrop-blur-xl border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col hover:border-[#C5A059] transition-colors relative">
            <div className="mb-6">
              <h3 className="text-xl font-black text-[#C5A059] mb-2">{getRoleTitle('Pro')}</h3>
              <p className="text-slate-300 text-xs">Monthly Billing</p>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-black text-white">₹999</span>
              <span className="text-slate-400 font-medium pb-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> <span className="text-white font-bold">Upload up to 25 Products</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Priority Seller Commission
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Automated Shipping
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> B2B Wholesale Pricing
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> Priority Support
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade("plan_bhulia_pro_monthly")}
              className="w-full py-3 rounded-xl border border-[#C5A059] text-[#C5A059] font-black text-sm hover:bg-[#C5A059] hover:text-black transition-all mt-auto"
            >
              Subscribe Monthly
            </button>
          </div>

          {/* Pro Yearly Tier */}
          <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-[#0A221E]/60 backdrop-blur-xl border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col hover:border-[#C5A059] transition-colors relative">
             <div className="absolute top-0 right-4 -translate-y-1/2 bg-[#C5A059] text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Save 16%
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-black text-[#C5A059] mb-2">{getRoleTitle('Pro')}</h3>
              <p className="text-slate-300 text-xs">Yearly Billing</p>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-black text-white">₹9,999</span>
              <span className="text-slate-400 font-medium pb-1">/yr</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> <span className="text-white font-bold">Upload up to 25 Products</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Priority Seller Commission
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Automated Shipping
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> B2B Wholesale Pricing
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="text-slate-600 font-bold">✕</span> Priority Support
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade("plan_bhulia_pro_yearly")}
              className="w-full py-3 rounded-xl border border-[#C5A059] text-[#C5A059] font-black text-sm hover:bg-[#C5A059] hover:text-black transition-all mt-auto"
            >
              Subscribe Yearly
            </button>
          </div>

          {/* Advance Monthly Tier */}
          <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-gradient-to-b from-[#132A25] to-[#0A221E] border-2 border-[#C5A059] rounded-3xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(197,160,89,0.15)]">
            <div className="mb-6">
              <h3 className="text-xl font-black text-[#C5A059] mb-2">{getRoleTitle('Advance')}</h3>
              <p className="text-slate-300 text-xs">Monthly Billing</p>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-black text-white">₹1,999</span>
              <span className="text-slate-400 font-medium pb-1">/mo</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> <span className="text-white font-bold">Unlimited Uploads</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Lowest Commission Rate
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Automated Shipping
              </li>
              <li className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> <span className="text-white font-bold">Enable B2B Pricing</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> 24/7 Priority Support
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade("plan_bhulia_adv_monthly")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#996515] to-[#C5A059] text-black font-black text-sm hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] mt-auto"
            >
              Subscribe Monthly
            </button>
          </div>

          {/* Advance Yearly Tier */}
          <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-gradient-to-b from-[#132A25] to-[#0A221E] border-2 border-[#C5A059] rounded-3xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(197,160,89,0.2)]">
            <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-[#C5A059] to-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-black text-[#C5A059] mb-2">{getRoleTitle('Advance')}</h3>
              <p className="text-slate-300 text-xs">Yearly Billing</p>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-black text-white">₹19,999</span>
              <span className="text-slate-400 font-medium pb-1">/yr</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> <span className="text-white font-bold">Unlimited Uploads</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Lowest Commission Rate
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> Automated Shipping
              </li>
              <li className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> <span className="text-white font-bold">Enable B2B Pricing</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-[#C5A059] font-bold">✓</span> 24/7 Priority Support
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade("plan_bhulia_adv_yearly")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#996515] to-[#C5A059] text-black font-black text-sm hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] mt-auto"
            >
              Subscribe Yearly
            </button>
          </div>

        </div>
        )}

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto pb-10">
          <h2 className="text-2xl font-serif font-black text-center text-white mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What happens if I delete an approved product on the Pro plan?", a: "To prevent quota abuse, deleted approved products remain counted against your 25-product limit for a 90-day cooldown period. If you need to frequently swap inventory, we recommend upgrading to Advance Pro." },
              { q: "What is B2B Wholesale pricing?", a: "Advance Pro members can set custom bulk pricing. Shops and Resellers across India can buy your inventory in bulk directly through the platform at your discounted rates." },
              { q: "Can I cancel anytime?", a: "Yes. Our subscriptions can be cancelled at any time from your billing dashboard." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#0A221E]/40 border border-[#132A25] p-5 rounded-2xl">
                <h4 className="text-base font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
