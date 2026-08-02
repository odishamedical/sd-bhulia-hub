"use client";

import React from "react";

export default function SaaSUpgraderModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 border-2 border-[#C5A059]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl font-bold">&times;</button>
        
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Upgrade to Pro</h2>
          <p className="text-gray-600 mt-3 font-medium text-lg">
            Unlock advanced inventory management, global pricing engines, staff delegation, and unlimited business growth.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mb-6">
           <div className="flex items-start gap-4">
              <span className="text-3xl">📞</span>
              <div className="text-left">
                <h4 className="font-bold text-yellow-900 mb-1">Online Payments Temporarily Disabled</h4>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  To upgrade your account to the Pro or Pro Advance tier, please contact our Bhulia Hub Support Team. Our executives will assist you with the subscription process and instantly unlock your dashboard.
                </p>
              </div>
           </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
           <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Support Helpline</p>
           <p className="text-2xl font-black text-[#0066CC]">+91 7683811120</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-[#C5A059] to-[#996515] text-white font-bold text-lg py-4 px-4 rounded-xl hover:shadow-lg transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
