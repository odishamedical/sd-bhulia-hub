import React from "react";

export default function HelpGuideTab({ userRole }: { userRole: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📘</span> Dashboard Guide & FAQ
      </h2>
      
      <div className="prose prose-blue max-w-none mb-8">
        <p className="text-gray-600">
          Welcome to your official help center! This dashboard uses a universal 7-category layout to help you manage your business.
        </p>
        
        <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">How to Contact the Admin Help Center</h3>
        <p className="text-gray-600 text-sm mb-4">
          Direct communication with buyers/resellers is routed through the Admin Hub to protect your privacy. If you need assistance with an order, payout, or technical issue:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
          <li>Navigate to <strong>Help & Communication &gt; Admin Support</strong> in the left sidebar.</li>
          <li>Click <strong>"Raise New Ticket"</strong>.</li>
          <li>Our 24/7 support team will respond directly in your dashboard within 4 hours.</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">🎧</div>
        <h3 className="font-bold text-blue-900 text-lg">Need Immediate Assistance?</h3>
        <p className="text-blue-700 font-medium text-sm max-w-md">
          Skip the FAQ and contact our dedicated support team right now. We are here to help you scale your brand.
        </p>
        <button className="px-6 py-2.5 bg-[#0070F3] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgb(0,112,243,0.39)] hover:bg-[#005BB5] transition-colors mt-2">
          Contact Help Center
        </button>
      </div>
    </div>
  );
}
