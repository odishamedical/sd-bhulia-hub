import React from 'react';

export default function ProFeatureLock({ requiredTier = "pro", message, onUpgrade }: { requiredTier?: string, message?: string, onUpgrade: () => void }) {
  return (
    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm max-w-2xl mx-auto mt-10">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Pro Feature Locked</h2>
      <p className="text-gray-500 mb-8 font-medium">{message || `You must upgrade to the ${requiredTier === "pro_advance" ? "Pro Advance" : "Pro"} Tier to unlock this module.`}</p>
      <button onClick={onUpgrade} className="bg-gradient-to-r from-[#0070F3] to-[#0051B3] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        Upgrade to {requiredTier === "pro_advance" ? "Pro Advance" : "Pro"}
      </button>
    </div>
  );
}
