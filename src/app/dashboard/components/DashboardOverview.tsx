import React from 'react';

interface DashboardOverviewProps {
  applicationStatus: string;
  onTabChange: (tab: string) => void;
  rejectionReason?: string;
  handleResetApplication: () => void;
  isSaving: boolean;
  onboardingData: {
    hasProfile: boolean;
    hasBank: boolean;
    hasKyc: boolean;
    hasProduct: boolean;
  };
  stats: {
    inventoryCount: number;
    walletBalance: number;
    affiliateCommissionsPaid: number;
    pendingOrdersCount: number;
  };
}

export default function DashboardOverview({
  applicationStatus,
  onTabChange,
  rejectionReason,
  handleResetApplication,
  isSaving,
  onboardingData,
  stats
}: DashboardOverviewProps) {
  
  const steps = [
    { key: 'hasProfile', label: 'Complete Profile (Logo & Address)' },
    { key: 'hasBank', label: 'Add Bank Details' },
    { key: 'hasKyc', label: 'Complete KYC Verification' },
    { key: 'hasProduct', label: 'Upload First Product' }
  ];

  const completedSteps = steps.filter(s => (onboardingData as any)[s.key]).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* PENDING BANNER */}
      {applicationStatus === "pending" && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-sm border border-yellow-200/60 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
            <div className="w-48 h-48 bg-yellow-400 rounded-full"></div>
          </div>
          <div className="relative z-10 flex gap-4 items-start">
            <div className="text-4xl mt-1 animate-bounce">⏳</div>
            <div>
              <h2 className="text-2xl font-black text-yellow-900 mb-2 tracking-tight">Application Pending Review</h2>
              <p className="text-yellow-800/80 font-medium text-sm leading-relaxed max-w-2xl">
                Our Administration team is currently reviewing your documents. One of our admins will call you shortly to verify your details and grant you full access to this listing.
                <br/><br/>
                <strong className="text-yellow-900">While you wait, please complete your shop profile below!</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={() => onTabChange("personal")}
            className="relative z-10 shrink-0 bg-yellow-400 text-yellow-900 px-8 py-3 rounded-xl font-black shadow-md hover:bg-yellow-500 transition-colors transform hover:-translate-y-1"
          >
            Complete Profile Now
          </button>
        </div>
      )}

      {/* REJECTED BANNER */}
      {applicationStatus === "rejected" && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-8 shadow-sm border border-red-200/60 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
            <div className="w-48 h-48 bg-red-500 rounded-full"></div>
          </div>
          <div className="relative z-10 flex gap-4 items-start">
            <div className="text-4xl mt-1">🛑</div>
            <div>
              <h2 className="text-2xl font-black text-red-900 mb-2 tracking-tight">Application Declined</h2>
              <p className="text-red-800/80 font-medium text-sm leading-relaxed max-w-2xl mb-4">
                Your application to claim or create this listing was declined by the administration team.
              </p>
              {rejectionReason && (
                <div className="bg-white/60 border border-red-100 p-4 rounded-xl text-sm text-red-900 mb-4 inline-block font-medium">
                  <strong>Reason for decline:</strong> {rejectionReason}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleResetApplication}
            disabled={isSaving}
            className="relative z-10 shrink-0 bg-red-600 text-white px-8 py-3 rounded-xl font-black shadow-md hover:bg-red-700 transition-colors transform hover:-translate-y-1 disabled:opacity-50"
          >
            {isSaving ? "Resetting..." : "Submit New Application"}
          </button>
        </div>
      )}

      {completedSteps < steps.length && (
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl border border-gray-800 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C5A059]/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#C5A059]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Shop Onboarding
                </h3>
                <p className="text-gray-400 text-sm">Complete these final steps to maximize your shop's visibility.</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#C5A059]">{progressPercentage}%</span>
                <span className="text-sm font-bold text-gray-500 ml-2 uppercase tracking-widest">Complete</span>
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-3 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#C5A059] to-[#8A5A00] h-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const isDone = (onboardingData as any)[step.key];
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${isDone ? 'bg-green-900/20 border-green-500/30' : 'bg-white/5 border-white/10'} flex flex-col gap-2`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                      {isDone ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> : <span className="font-bold text-sm">{idx + 1}</span>}
                    </div>
                    <p className={`text-sm font-medium ${isDone ? 'text-green-400/80' : 'text-gray-300'}`}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE BANNER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
          <div className="w-48 h-48 bg-white rounded-full"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-2">🚀 Upgrade to Pro Seller</h2>
          <p className="text-blue-200 font-medium max-w-xl text-sm leading-relaxed">
            Unlock automated Shiprocket logistics, B2B wholesale selling, and unlimited product uploads. Supercharge your business today!
          </p>
        </div>
        <button 
          onClick={() => window.location.href = "/pricing"}
          className="relative z-10 shrink-0 bg-white text-blue-900 px-8 py-3 rounded-xl font-black shadow-lg hover:bg-gray-50 transition-colors transform hover:-translate-y-1"
        >
          Subscription Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Inventory</h3>
          <div className="text-3xl font-black text-gray-900">{stats.inventoryCount}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</h3>
          <div className="text-3xl font-black text-green-600">₹{stats.walletBalance.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-50 text-purple-200">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Affiliate Comm. Paid</h3>
          <div className="text-3xl font-black text-purple-600 relative z-10">₹{stats.affiliateCommissionsPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Orders</h3>
          <div className="text-3xl font-black text-gray-900">{stats.pendingOrdersCount}</div>
        </div>
      </div>
    </div>
  );
}
