import React, { useState } from "react";

const SELLER_CATEGORY_GUIDES = [
  {
    icon: "👤",
    title: "1. Profile & Setup",
    description: "Your business identity.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Dashboard Overview:</strong> High-level view of your sales and performance.</li>
        <li><strong>Personal Profile:</strong> Manage your name, contact info, and basic details.</li>
        <li><strong>Setup Public Store:</strong> Edit the information customers see on your profile page.</li>
        <li><strong>Verification (KYC):</strong> Upload documents to earn a trusted seller badge.</li>
        <li><strong>Custom Brand URL:</strong> Claim a unique link for your store.</li>
        <li><strong>Staff Accounts:</strong> Add family members or employees to help manage your account.</li>
      </ul>
    )
  },
  {
    icon: "📦",
    title: "2. Your Catalog",
    description: "Manage what you sell.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Add your Sambalpuri Products:</strong> Upload new sarees, manage inventory, and update prices.</li>
        <li><strong>B2B / Wholesale Setup:</strong> Create special bulk pricing for verified resellers.</li>
      </ul>
    )
  },
  {
    icon: "🚚",
    title: "3. Orders & Deliveries",
    description: "Process and ship.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Manage Orders:</strong> View incoming orders, print shipping labels, and track deliveries.</li>
      </ul>
    )
  },
  {
    icon: "💰",
    title: "4. Finance & Earnings",
    description: "Track your money.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Wallet & Bank Payouts:</strong> Monitor your earnings and request withdrawals to your bank account.</li>
      </ul>
    )
  },
  {
    icon: "📈",
    title: "5. Marketing & Comm",
    description: "Connect with buyers.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Marketing & Promos:</strong> Create discount coupons and promotional offers.</li>
        <li><strong>Customer Messages:</strong> Read messages forwarded to you securely by Admin Support.</li>
      </ul>
    )
  },
  {
    icon: "🎧",
    title: "6. Help & Support",
    description: "Assistance when you need it.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Help & Support Guide:</strong> Access this master guide anytime to learn how the dashboard works.</li>
        <li><strong>Contact Admin Support:</strong> Reach out directly to our admin team for assistance.</li>
      </ul>
    )
  },
  {
    icon: "🔐",
    title: "7. Security",
    description: "Protect your account.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Security & Password:</strong> Update your login password and manage account safety.</li>
      </ul>
    )
  }
];

const RESELLER_CATEGORY_GUIDES = [
  {
    icon: "👤",
    title: "1. Profile & Setup",
    description: "Your business identity.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Dashboard Overview:</strong> High-level view of your sales and performance.</li>
        <li><strong>Personal Profile:</strong> Manage your name, contact info, and basic details.</li>
        <li><strong>Verification (KYC):</strong> Upload documents to verify your identity before payouts.</li>
        <li><strong>Security & Login:</strong> Update your login password and manage account safety.</li>
      </ul>
    )
  },
  {
    icon: "🛍️",
    title: "2. Build Your Storefront",
    description: "Curate and market.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Curate Products:</strong> Browse the catalog and add products to your personal storefront.</li>
        <li><strong>Share Marketing Links:</strong> Generate unique WhatsApp and social media links for your curated items.</li>
      </ul>
    )
  },
  {
    icon: "🛒",
    title: "3. Sales & Orders",
    description: "Process offline sales.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Place Proxy Orders:</strong> Place orders directly on behalf of your offline or local customers.</li>
        <li><strong>Sales Analytics:</strong> Track your performance, commissions, and top-selling products.</li>
      </ul>
    )
  },
  {
    icon: "💰",
    title: "4. Finance & Earnings",
    description: "Track your money.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Wallet & Bank Payouts:</strong> Monitor your commissions and request withdrawals to your bank account.</li>
      </ul>
    )
  },
  {
    icon: "🎧",
    title: "5. Help & Support",
    description: "Assistance when you need it.",
    details: (
      <ul className="list-disc pl-4 space-y-2">
        <li><strong>Dashboard Guide & FAQ:</strong> Access this master guide anytime to learn how the dashboard works.</li>
        <li><strong>Contact Admin Support:</strong> Reach out directly to our admin team for assistance.</li>
      </ul>
    )
  }
];

export default function HelpGuideTab({ userRole }: { userRole: string }) {
  const [openCategory, setOpenCategory] = useState<number | null>(null);

  return (
    <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-5xl mx-auto animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-[#0074E4] flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-2xl shadow-inner">
              <span className="text-3xl">📘</span>
            </div>
            Dashboard Master Guide
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Everything you need to know to operate your {userRole.replace("_", " ")} business on Bhulia Hub.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🎧</div>
          <div>
            <h3 className="font-bold text-blue-900">Need Live Help?</h3>
            <button className="text-sm font-bold text-[#0070F3] hover:text-[#005BB5] transition-colors mt-0.5">
              Contact Admin Support &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* PROXY COMMUNICATION CALLOUT */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-10">
        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-2">
          <span>🔒</span> Important: Privacy & Communication Protocol
        </h3>
        <p className="text-amber-800 text-sm leading-relaxed">
          To protect your privacy and prevent spam, <strong>direct chat with customers/resellers is disabled</strong>. All communication is securely proxied through the Admin Hub. If a buyer needs to reach you, they will contact Admin Support, and we will relay the message directly to your <strong>"Proxy Messages"</strong> tab.
        </p>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <h3 className="text-2xl font-black text-[#0074E4] mb-6 flex items-center gap-2">
        <span className="text-xl">🗺️</span> Understanding Your Menu
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        
        {/* Dynamic guides based on role */}
        {(userRole === 'reseller' ? RESELLER_CATEGORY_GUIDES : SELLER_CATEGORY_GUIDES).map((cat, idx) => (
          <div 
            key={idx} 
            className={`border rounded-2xl overflow-hidden transition-all duration-200 ${openCategory === idx ? 'border-blue-300 shadow-md bg-blue-50/30' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}
          >
            <button 
              onClick={() => setOpenCategory(openCategory === idx ? null : idx)}
              className="w-full text-left p-5 flex items-start justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0074E4] text-lg">{cat.title}</h4>
                  <p className="text-sm text-gray-600 font-medium">{cat.description}</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${openCategory === idx ? 'rotate-180' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </button>
            
            {openCategory === idx && (
              <div className="px-5 pb-5 pt-2 pl-[68px] animate-in slide-in-from-top-2 fade-in">
                <div className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  {cat.details}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ SECTION */}
      <h3 className="text-2xl font-black text-[#0074E4] mb-6 mt-4 flex items-center gap-2">
        <span className="text-xl">❓</span> Frequently Asked Questions
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#0074E4] border border-y-gray-200 border-r-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-bold text-[#0074E4] text-lg mb-2">How do I verify my account to get a trusted badge?</h4>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">Navigate to <strong className="text-gray-900 bg-gray-100 px-1 rounded">1. Profile & Setup &gt; Verification (KYC)</strong>. Upload your required documents. Our admin team usually approves KYC submissions within 24-48 hours.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#0074E4] border border-y-gray-200 border-r-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-bold text-[#0074E4] text-lg mb-2">When do I receive my payouts?</h4>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">You can view your available balance in <strong className="text-gray-900 bg-gray-100 px-1 rounded">4. Finance & Earnings &gt; Wallet & Bank Payouts</strong>. Payouts are processed every Tuesday and Friday directly to your registered bank account.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#0074E4] border border-y-gray-200 border-r-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-bold text-[#0074E4] text-lg mb-2">Can I sell wholesale (B2B) and retail at the same time?</h4>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">Yes! In <strong className="text-gray-900 bg-gray-100 px-1 rounded">2. Your Catalog &gt; B2B / Wholesale Setup</strong>, you can configure special wholesale pricing. Retail customers will see the standard MRP, while approved B2B Resellers will automatically see your wholesale rates when they log in.</p>
        </div>
      </div>
    </div>
  );
}
