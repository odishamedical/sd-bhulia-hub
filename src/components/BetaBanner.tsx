import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function BetaBanner() {
  return (
    <div className="bg-[#F59E0B] text-black px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 z-[60] relative shadow-md">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="text-center">
        <strong>BETA PREVIEW:</strong> This platform is currently in beta. Online payments are disabled. You can freely search for products, view shop profiles, and contact sellers directly.
      </span>
    </div>
  );
}