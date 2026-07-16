"use client";

import { useState } from "react";
import SaaSUpgraderModal from "@/components/SaaSUpgraderModal";

export default function PricingTab({ isPublicPage = false }: { isPublicPage?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [role, setRole] = useState<"weaver" | "shop">("weaver");
  
  // Upgrader Modal State
  const [isUpgraderOpen, setIsUpgraderOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const handleUpgrade = (planId: string) => {
    setSelectedPlanId(planId);
    setIsUpgraderOpen(true);
  };

  return (
    <div className={`relative overflow-hidden font-sans ${isPublicPage ? 'min-h-screen bg-[#051815] text-white py-20 px-4' : 'bg-[#051815] text-white rounded-3xl p-8 shadow-xl border border-[#C5A059]/20'}`}>
      
      <SaaSUpgraderModal 
        isOpen={isUpgraderOpen} 
        onClose={() => setIsUpgraderOpen(false)} 
        defaultPlan={selectedPlanId as any}
      />

      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#C5A059]/20 to-transparent blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-t from-blue-900/20 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
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

        {/* Toggles */}
        <div className="flex flex-col items-center gap-8 mb-16 animate-in slide-in-from-bottom-10 duration-700 delay-150">
          
          {/* Role Toggle */}
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

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-4">
            <span className={`text-sm font-bold ${billingCycle === "monthly" ? "text-white" : "text-slate-500"}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
              className="w-14 h-8 bg-[#0A221E] rounded-full p-1 relative border border-[#C5A059]/30 transition-colors"
            >
              <div className={`w-6 h-6 bg-[#C5A059] rounded-full transition-transform duration-300 shadow-md ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"}`}></div>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${billingCycle === "yearly" ? "text-white" : "text-slate-500"}`}>Yearly</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase tracking-wider">Save 16%</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-12 duration-700 delay-300">
          
          {/* Free Tier */}
          <div className="bg-[#0A221E]/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex flex-col hover:border-slate-500 transition-colors">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2">Basic Starter</h3>
              <p className="text-slate-400 text-sm">Perfect for getting started on Bhulia.</p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">₹0</span>
              <span className="text-slate-400 font-medium">/forever</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="text-green-400">✓</span> Standard Marketplace Listing
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="text-green-400">✓</span> Limit: 10 Products
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="text-green-400">✓</span> Basic Analytics
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-sm">
                <span className="text-slate-600">✕</span> 10% Platform Commission
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-sm">
                <span className="text-slate-600">✕</span> Manual Shipping
              </li>
            </ul>
            {isPublicPage && (
              <a href="/register-weaver" className="w-full block text-center py-4 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-800 transition-colors">
                Get Started for Free
              </a>
            )}
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-[#132A25] to-[#0A221E] border border-[#C5A059] rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(197,160,89,0.15)] transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#C5A059] to-yellow-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[#C5A059] mb-2">{role === "weaver" ? "Weaver Pro" : "Shop Pro"}</h3>
              <p className="text-slate-300 text-sm">Unlock wholesale and automated logistics.</p>
            </div>
            <div className="mb-8 flex items-end gap-1">
              {role === "weaver" ? (
                <>
                  <span className="text-5xl font-black text-white">₹{billingCycle === "monthly" ? "999" : "9,999"}</span>
                  <span className="text-slate-400 font-medium pb-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-black text-white">₹{billingCycle === "monthly" ? "1,099" : "10,999"}</span>
                  <span className="text-slate-400 font-medium pb-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </>
              )}
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <span className="text-[#C5A059] font-bold">✓</span> <strong className="text-white">0% Platform Commission</strong>
              </li>
              <li className="flex items-center gap-3 text-slate-200 text-sm">
                <span className="text-[#C5A059] font-bold">✓</span> Unlimited Product Uploads
              </li>
              <li className="flex items-center gap-3 text-slate-200 text-sm">
                <span className="text-[#C5A059] font-bold">✓</span> <strong className="text-white">Automated Shiprocket AWB</strong>
              </li>
              <li className="flex items-center gap-3 text-slate-200 text-sm">
                <span className="text-[#C5A059] font-bold">✓</span> Enable B2B Wholesale Pricing
              </li>
              <li className="flex items-center gap-3 text-slate-200 text-sm">
                <span className="text-[#C5A059] font-bold">✓</span> Reseller Affiliate Network Access
              </li>
            </ul>
            <button 
              onClick={() => {
                const planStr = `${role}-${billingCycle}`; // e.g. weaver-monthly
                handleUpgrade(planStr);
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#996515] to-[#C5A059] text-black font-black hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.4)]"
            >
              Upgrade to Pro
            </button>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto pb-10">
          <h2 className="text-3xl font-serif font-black text-center text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "How does the Shiprocket integration work?", a: "With the Pro plan, you simply click 'Generate AWB' on your dashboard when an order comes in. Our system automatically talks to Shiprocket, creates a waybill, and provides you with the shipping label to print." },
              { q: "What is B2B Wholesale pricing?", a: "Pro members can set custom bulk pricing. Shops and Resellers across India can buy your inventory in bulk directly through the platform at your discounted rates." },
              { q: "Can I cancel anytime?", a: "Yes. Our monthly subscriptions can be cancelled at any time from your billing dashboard without any penalty." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#0A221E]/40 border border-[#132A25] p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
