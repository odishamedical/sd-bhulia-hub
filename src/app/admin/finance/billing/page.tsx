"use client";

import React from "react";

export default function AdBillingPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Ad Invoices & Billing</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage vendor payments for Sponsored Products and Homepage Banners.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Advertising Ledger Coming Soon</h2>
        <p className="text-gray-500">Track and invoice verified sellers for premium real estate on the global Bhulia.com storefront.</p>
      </div>
    </div>
  );
}
