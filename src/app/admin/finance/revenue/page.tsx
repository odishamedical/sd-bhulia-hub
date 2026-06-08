"use client";

import React from "react";

export default function PlatformRevenuePage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Platform Revenue</h1>
          <p className="text-gray-800 mt-2 font-semibold">Track gross profit from 10% transaction fees and logistics arbitrage.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Revenue Dashboard Coming Soon</h2>
        <p className="text-gray-500">This module will aggregate the 10% platform cuts withheld from payouts and calculate gross margin.</p>
      </div>
    </div>
  );
}
