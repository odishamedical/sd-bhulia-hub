"use client";

import React from "react";

export default function ResellerCommissionsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Reseller Commissions</h1>
          <p className="text-gray-800 mt-2 font-semibold">Manage and release commission payouts to your verified resellers.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Commissions Ledger Coming Soon</h2>
        <p className="text-gray-500">The payout release module for Resellers is under construction. Currently, commissions are tracked automatically in the Reseller Dashboard.</p>
      </div>
    </div>
  );
}
