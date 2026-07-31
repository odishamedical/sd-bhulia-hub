import React from 'react';

export default function BetaBanner() {
  return (
    <div className="bg-[#F59E0B] text-black px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 z-[60] relative shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span className="text-center">
        <strong>BETA PREVIEW:</strong> This platform is currently in beta. Online payments are disabled. You can freely search for products, view shop profiles, and contact sellers directly.
      </span>
    </div>
  );
}