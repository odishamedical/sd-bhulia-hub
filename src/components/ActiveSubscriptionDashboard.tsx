"use client";

import { useState } from "react";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface ActiveSubscriptionDashboardProps {
  subscriptionId: string;
  planId: string;
  onCancelSuccess: () => void;
}

export default function ActiveSubscriptionDashboard({ subscriptionId, planId, onCancelSuccess }: ActiveSubscriptionDashboardProps) {
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!auth.currentUser) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          customerId: auth.currentUser.uid,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to cancel subscription");
      }
      
      // Update Firestore now that Razorpay is cancelled
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        subscriptionStatus: "cancelled",
        subscriptionCancelledAt: new Date().toISOString(),
      });

      onCancelSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setCancelling(false);
    }
  };

  const getPlanName = (id: string) => {
    if (id.includes("adv_yearly")) return "Advance Pro (Yearly)";
    if (id.includes("adv_monthly")) return "Advance Pro (Monthly)";
    if (id.includes("pro_yearly")) return "Shop Pro (Yearly)";
    if (id.includes("pro_monthly")) return "Shop Pro (Monthly)";
    return id;
  };

  return (
    <div className="bg-[#0A221E]/60 backdrop-blur-xl rounded-3xl border border-[#C5A059]/40 p-8 shadow-xl max-w-4xl mx-auto mt-12 animate-in slide-in-from-bottom-8">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-[#C5A059]/20">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-green-900/40 text-green-400 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] shrink-0 text-4xl">
            ✅
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Platform Active</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full border border-green-500/30">
                Live
              </span>
            </div>
            <p className="text-slate-300">
              You are actively subscribed to the <span className="font-bold text-[#C5A059]">{getPlanName(planId)}</span> plan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-[#132A25] p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            Billing Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Subscription ID</p>
              <p className="text-sm font-mono text-white bg-black/30 px-3 py-2 rounded-lg border border-white/5 break-all">
                {subscriptionId}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm text-green-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Auto-Renewing
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#132A25] p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-xl">⚡</span>
              Premium Features Unlocked
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Your inventory is currently live on the Global Pricing Engine and visible to thousands of buyers.
            </p>
          </div>
          
          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 font-bold underline underline-offset-4 self-start transition-colors"
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl animate-in fade-in zoom-in-95">
              <p className="text-sm text-white font-medium flex items-start gap-2 mb-4">
                <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                Are you sure? You will instantly lose your premium features, vanity URL, and search ranking.
              </p>
              {error && <p className="text-xs text-red-400 mb-3 bg-black/20 p-2 rounded">{error}</p>}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {cancelling ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Yes, Cancel Plan
                </button>
                <button 
                  onClick={() => {
                    setShowConfirm(false);
                    setError(null);
                  }}
                  disabled={cancelling}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Keep My Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
