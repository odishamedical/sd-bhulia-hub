"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set cookie for middleware
        document.cookie = `bhulia-auth-token=${user.uid}; path=/; max-age=86400`;
        
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // If no user doc exists, they need onboarding
            setRole("onboarding");
          }
        } catch (error) {
          console.error("Error fetching user role", error);
        }
      } else {
        // Clear cookie and redirect
        document.cookie = "bhulia-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bhulia-bg">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (role === "onboarding") {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-[#051815] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display bhulia-gold-text capitalize">{role} Dashboard</h1>
          <button 
            onClick={() => auth.signOut()}
            className="px-4 py-2 bg-red-900/50 text-red-200 rounded hover:bg-red-800/50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {role === "customer" && <CustomerDashboard />}
        {role === "weaver" && <WeaverDashboard />}
        {role === "vendor" && <VendorDashboard />}
        {role === "reseller" && <ResellerDashboard />}
      </div>
    </div>
  );
}

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [selectedRole, setSelectedRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const uid = localStorage.getItem("sd_current_user_uid");
      if (!uid) return;
      
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      await updateDoc(doc(db, "users", uid), {
        role: selectedRole
      });
      localStorage.setItem("sd_current_user_role", selectedRole);
      onComplete();
    } catch (e) {
      console.error("Failed to update role", e);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bhulia-bg px-4">
      <div className="bhulia-premium-card p-8 w-full max-w-lg">
        <h2 className="text-2xl font-display bhulia-gold-text mb-4 text-center">Complete Your Profile</h2>
        <p className="text-gray-400 text-center mb-6">Select your account type to proceed</p>
        
        <select 
          className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white mb-6 focus:border-[#C5A059] focus:outline-none"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="customer">Customer (Buy Handlooms)</option>
          <option value="weaver">Master Weaver (Sell Handlooms)</option>
          <option value="vendor">Vendor / Shop (Sell for Multiple Weavers)</option>
          <option value="reseller">Reseller (Dropship & Earn Commission)</option>
        </select>

        <button 
          onClick={handleContinue}
          disabled={loading}
          className="w-full bhulia-gold-button py-3 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
        </button>
      </div>
    </div>
  );
}


function WeaverDashboard() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bhulia-premium-card p-6 border-t-4 border-t-[#C5A059]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Wallet Balance</h3>
          <div className="text-4xl font-display bhulia-gold-text">₹{walletBalance.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-2">Available for payout</p>
        </div>
        <div className="bhulia-premium-card p-6 border-t-4 border-t-green-600">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Subscription</h3>
          <div className="text-2xl font-semibold text-green-500 mt-1">Active</div>
          <p className="text-xs text-gray-500 mt-2">Renews automatically</p>
        </div>
        <div className="bhulia-premium-card p-6 border-t-4 border-t-blue-500">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Pending Orders</h3>
          <div className="text-4xl font-display text-white">0</div>
          <p className="text-xs text-gray-500 mt-2">Awaiting hub dispatch</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setShowUpload(!showUpload)} className="bhulia-gold-button px-6 py-3 rounded">
          {showUpload ? "Cancel Upload" : "+ Upload Saree"}
        </button>
        <button className="bg-[#051815] border border-[#C5A059] text-[#C5A059] px-6 py-3 rounded hover:bg-[#0B2B26] transition-colors">
          View Storefront
        </button>
      </div>

      {showUpload && (
        <div className="bhulia-premium-card p-6 animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-4">Upload New Sambalpuri Handloom</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Saree submitted for QC Approval successfully!"); setShowUpload(false); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Product Title</label>
                <input type="text" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Selling Price (₹)</label>
                <input type="number" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description & Material Details</label>
              <textarea rows={3} className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required></textarea>
            </div>
            <div>
              <label className="flex items-center space-x-3 bg-[#0B2B26] p-3 rounded border border-gray-700">
                <input type="checkbox" className="form-checkbox text-[#C5A059] rounded w-5 h-5" required />
                <span className="text-sm text-gray-300">I declare that this is an authentic, handwoven Sambalpuri handloom product.</span>
              </label>
            </div>
            <button type="submit" className="bhulia-gold-button w-full py-3 rounded mt-2">Submit to QC Approval</button>
          </form>
        </div>
      )}
    </div>
  );
}

function VendorDashboard() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bhulia-premium-card p-6 border-t-4 border-t-[#C5A059]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Wallet Balance</h3>
          <div className="text-4xl font-display bhulia-gold-text">₹{walletBalance.toLocaleString()}</div>
        </div>
        <div className="bhulia-premium-card p-6 border-t-4 border-t-blue-500">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Inventory</h3>
          <div className="text-4xl font-display text-white">0</div>
        </div>
        <div className="bhulia-premium-card p-6 border-t-4 border-t-green-600">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Pending Orders</h3>
          <div className="text-4xl font-display text-white">0</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setShowUpload(!showUpload)} className="bhulia-gold-button px-6 py-3 rounded">
          {showUpload ? "Cancel Upload" : "+ Upload Inventory"}
        </button>
        <button className="bg-[#051815] border border-[#C5A059] text-[#C5A059] px-6 py-3 rounded hover:bg-[#0B2B26] transition-colors">
          View Storefront
        </button>
      </div>

      {showUpload && (
        <div className="bhulia-premium-card p-6 animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-4">Upload New Inventory (Vendor)</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Inventory batch submitted for QC Approval successfully!"); setShowUpload(false); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Product Title</label>
                <input type="text" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Selling Price (₹)</label>
                <input type="number" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Original Weaver Name</label>
                <select className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required>
                  <option value="">Select Weaver (Or enter manually)</option>
                  <option value="bargarh">Bargarh Master Weaver Assc.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Stock Quantity</label>
                <input type="number" defaultValue="1" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059]" required />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-3 bg-[#0B2B26] p-3 rounded border border-gray-700">
                <input type="checkbox" className="form-checkbox text-[#C5A059] rounded w-5 h-5" required />
                <span className="text-sm text-gray-300">I declare that this is an authentic, handwoven Sambalpuri handloom product.</span>
              </label>
            </div>
            <button type="submit" className="bhulia-gold-button w-full py-3 rounded mt-2">Submit to QC Approval</button>
          </form>
        </div>
      )}
    </div>
  );
}

function ResellerDashboard() {
  const [activeTab, setActiveTab] = useState("curation");
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-800 pb-2 mb-6">
        <button onClick={() => setActiveTab("curation")} className={`px-4 py-2 font-semibold ${activeTab === "curation" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500"}`}>Store Curation</button>
        <button onClick={() => setActiveTab("proxy")} className={`px-4 py-2 font-semibold ${activeTab === "proxy" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500"}`}>Proxy Orders</button>
        <button onClick={() => setActiveTab("wallet")} className={`px-4 py-2 font-semibold ${activeTab === "wallet" ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500"}`}>Commissions</button>
      </div>
      
      {activeTab === "curation" && (
        <div className="bhulia-premium-card p-6">
          <h2 className="text-xl font-display bhulia-gold-text mb-4">Curate Your Shelf</h2>
          <p className="text-sm text-gray-400 mb-6">Select global products to showcase on your personal Bhulia reseller storefront.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#051815] border border-gray-800 p-4 rounded text-center">No products in global catalog yet.</div>
          </div>
        </div>
      )}
      
      {activeTab === "proxy" && (
        <div className="bhulia-premium-card p-6">
          <h2 className="text-xl font-display bhulia-gold-text mb-4">Book Proxy Order</h2>
          <p className="text-sm text-gray-400 mb-6">Place an order on behalf of an offline customer.</p>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Proxy order placed securely! The customer will receive a payment link via SMS/WhatsApp shortly."); }}>
             <input type="text" placeholder="Customer Name" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white" required />
             <input type="text" placeholder="Delivery PIN Code" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white" required />
             <textarea placeholder="Full Address" className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white" required></textarea>
             <button type="submit" className="bhulia-gold-button w-full py-3 rounded">Place Proxy Order</button>
          </form>
        </div>
      )}
    </div>
  );
}

function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bhulia-premium-card p-6">
          <h2 className="text-xl font-display bhulia-gold-text mb-4">My Orders</h2>
          <div className="text-sm text-gray-400">You have no recent orders.</div>
        </div>
        <div className="bhulia-premium-card p-6">
          <h2 className="text-xl font-display bhulia-gold-text mb-4">My Wishlist</h2>
          <div className="text-sm text-gray-400">Your wishlist is empty.</div>
        </div>
      </div>
    </div>
  );
}
