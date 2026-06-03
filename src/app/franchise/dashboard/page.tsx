"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MASTER_FRANCHISES, FranchiseListing } from "@/app/franchise/data";
import { MASTER_PRODUCTS, Product } from "@/lib/products";

// State and Districts data for prefilled dropdown
const STATE_DISTRICTS: { [state: string]: string[] } = {
  Odisha: ["Bargarh", "Sonepur (Subarnapur)", "Sambalpur", "Balangir", "Boudh", "Cuttack", "Bhubaneswar (Khorda)", "Puri"],
  "West Bengal": ["Bankura", "Purulia", "Murshidabad", "Hooghly", "Nadia"],
  "Andhra Pradesh": ["Anantapur (Dharmavaram)", "Guntur (Mangalagiri)", "Nellore", "Chittoor"],
  Telangana: ["Pochampally (Yadadri)", "Gadwal", "Narayanpet"],
  Global: ["International Outpost / Global Hub"]
};

export default function FranchiseDashboard() {
  // Authentication states
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("");
  const [userName, setUserName] = useState<string | null>(null);
  const [activeFranchise, setActiveFranchise] = useState<FranchiseListing | null>(null);
  const [liveFranchiseData, setLiveFranchiseData] = useState<any | null>(null);

  // General dashboard UI states
  const [activeTab, setActiveTab] = useState<"overview" | "curation" | "proxy" | "orders" | "settings" | "verification">("overview");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(45000);

  // Proxy Purchase Form
  const [proxyStep, setProxyStep] = useState<number>(1);
  const [proxyForm, setProxyForm] = useState({
    productId: "", quantity: 1, customerName: "", customerPhone: "", customerWhatsapp: "",
    customerEmail: "", customerAddress: "", customerState: "Odisha", customerDistrict: "Bargarh", paymentMode: "Wallet",
  });
  const [isSubmittingProxy, setIsSubmittingProxy] = useState<boolean>(false);
  const [proxyOrderSuccess, setProxyOrderSuccess] = useState<any | null>(null);

  // Catalog curation
  const [curatedIds, setCuratedIds] = useState<string[]>([]);
  const [productCategories, setProductCategories] = useState<{ [id: string]: string }>({});

  // Logistics
  const [selectedOrderForLogistics, setSelectedOrderForLogistics] = useState<any | null>(null);
  const [qcChecks, setQcChecks] = useState({ handloomMark: false, dimensions: false, doubleShuttleBorder: false, siliconGelAdded: false });
  const [isUpdatingQC, setIsUpdatingQC] = useState<boolean>(false);

  // Sandbox settings
  const [premiumEnabled, setPremiumEnabled] = useState<boolean>(false);
  const [customDomain, setCustomDomain] = useState<string>("");
  const [customSubdomain, setCustomSubdomain] = useState<string>("");
  const [showSandboxPreview, setShowSandboxPreview] = useState<boolean>(false);
  const [sandboxSimulatedUrl, setSandboxSimulatedUrl] = useState<string>("");

  // Sync auth on load
  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid") || "";

      if (email) {
        setUserRole(role);
        setUserUid(uid);
        setUserName(name || email.split("@")[0]);

        const matched = MASTER_FRANCHISES.find(f => f.id.toLowerCase() === uid.toLowerCase() || f.slug.toLowerCase() === uid.toLowerCase()) || MASTER_FRANCHISES[0];
        setActiveFranchise(matched);

        import("@/lib/firebase").then(({ db }) => {
          import("firebase/firestore").then(({ query, collection, where, getDocs }) => {
            const q = query(collection(db, "franchises"), where("userId", "==", uid));
            getDocs(q).then((snap) => {
              if (!snap.empty) {
                const doc = snap.docs[0];
                const data = doc.data();
                if (data.status === "approved" && role !== "super_admin") {
                  setUserRole("franchisee");
                  localStorage.setItem("sd_current_user_role", "franchisee");
                }
                setActiveFranchise({
                  id: doc.id, slug: data.slug, name: data.name, region: data.city ? data.city.split(", ").pop() : "Unknown", city: data.city, phygitalOutletsCount: 0,
                  referralsTracked: data.invitedCount || 0, totalCommissionPaid: "₹ " + (data.commissionEarned || 0), specialtyTags: [], description: "", img: data.img || MASTER_FRANCHISES[0].img, outletsList: [], subscriptionTier: data.subscriptionTier || "free"
                });
              }
            });
          });
        });
      } else {
        setUserRole(null); setUserUid(""); setUserName(null); setActiveFranchise(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  // Listen to live data
  useEffect(() => {
    if (!activeFranchise?.id) return;
    
    let unsub: any = null;
    const fetchLiveFranchise = async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { doc, onSnapshot, query, collection, where } = await import("firebase/firestore");
        unsub = onSnapshot(doc(db, "franchises", activeFranchise.id), (docSnap) => {
          if (docSnap.exists()) setLiveFranchiseData({ id: docSnap.id, ...docSnap.data() });
          else {
            const q = query(collection(db, "franchises"), where("slug", "==", activeFranchise.slug || activeFranchise.id.toLowerCase()));
            const unsubQuery = onSnapshot(q, (snapshot) => {
              if (!snapshot.empty) setLiveFranchiseData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            });
            unsub = unsubQuery;
          }
        });
      } catch (err) { console.error(err); }
    };
    fetchLiveFranchise();
    return () => { if (unsub) unsub(); };
  }, [activeFranchise?.id]);

  // Load orders, notifs, wallet
  useEffect(() => {
    if (!activeFranchise?.id) return;
    
    if (liveFranchiseData) {
       setWalletBalance(liveFranchiseData.walletBalance || 0);
       setCuratedIds(liveFranchiseData.curatedIds || MASTER_PRODUCTS.slice(0, 4).map(p => p.id));
       setProductCategories(liveFranchiseData.productCategories || {});
       setPremiumEnabled(liveFranchiseData.premiumEnabled || false);
       setCustomDomain(liveFranchiseData.customDomain || "");
       setCustomSubdomain(liveFranchiseData.customSubdomain || `${liveFranchiseData.slug}.bhulia.com`);
    }

    let unsubOrders: any = null;
    let unsubNotifs: any = null;

    const setupLiveListeners = async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, query, onSnapshot, orderBy } = await import("firebase/firestore");
        
        const ordersQuery = query(collection(db, "franchises", activeFranchise.id, "orders"), orderBy("timestamp", "desc"));
        unsubOrders = onSnapshot(ordersQuery, (snap) => setAllOrders(snap.docs.map(d => ({ ...d.data(), id: d.id }))));

        const notifsQuery = query(collection(db, "franchises", activeFranchise.id, "notifications"), orderBy("timestamp", "desc"));
        unsubNotifs = onSnapshot(notifsQuery, (snap) => setNotifications(snap.docs.map(d => ({ ...d.data(), id: d.id }))));
      } catch (err) { console.error(err); }
    };

    setupLiveListeners();
    return () => { if (unsubOrders) unsubOrders(); if (unsubNotifs) unsubNotifs(); };
  }, [activeFranchise?.id, liveFranchiseData]);

  // Handlers
  const handleClearNotifications = async () => {
    if (!activeFranchise) return;
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, getDocs, deleteDoc, doc } = await import("firebase/firestore");
      const snap = await getDocs(collection(db, "franchises", activeFranchise.id, "notifications"));
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "franchises", activeFranchise.id, "notifications", d.id))));
    } catch (err) { console.error(err); }
  };

  const handleStateChange = (stateName: string) => {
    const districts = STATE_DISTRICTS[stateName] || [];
    setProxyForm({ ...proxyForm, customerState: stateName, customerDistrict: districts[0] || "" });
  };

  const handleToggleCuration = async (productId: string) => {
    if (!activeFranchise) return;
    const updated = curatedIds.includes(productId) ? curatedIds.filter(id => id !== productId) : [...curatedIds, productId];
    setCuratedIds(updated);
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "franchises", activeFranchise.id), { curatedIds: updated });
    } catch(err) { console.error(err); }
  };

  const handleCategoryChange = (productId: string, val: string) => {
    const updated = { ...productCategories, [productId]: val };
    setProductCategories(updated);
  };

  const handleSaveSandbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFranchise) return;
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "franchises", activeFranchise.id), {
        premiumEnabled,
        customSubdomain,
        customDomain
      });
      alert("Sandbox settings saved!");
    } catch(err) { console.error(err); }
  };

  const handleLaunchSandboxPreview = () => {
    if (customSubdomain) {
      window.open(`http://${customSubdomain}`, "_blank");
    } else {
      alert("Please configure a subdomain first.");
    }
  };

  const handleSubmitProxyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFranchise) return;
    if (!proxyForm.productId || !proxyForm.customerName.trim() || !proxyForm.customerWhatsapp.trim()) return;

    const selectedProduct = MASTER_PRODUCTS.find(p => p.id === proxyForm.productId);
    if (!selectedProduct) return;

    const priceNum = Number(selectedProduct.price.replace(/[^\d]/g, ""));
    const totalPrice = priceNum * proxyForm.quantity;

    if (proxyForm.paymentMode === "Wallet" && walletBalance < totalPrice) {
      alert(`Insufficient balance.`); return;
    }

    setIsSubmittingProxy(true);
    setTimeout(async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { doc, collection, addDoc, updateDoc } = await import("firebase/firestore");
        
        if (proxyForm.paymentMode === "Wallet") {
          await updateDoc(doc(db, "franchises", activeFranchise.id), { walletBalance: walletBalance - totalPrice });
        }

        const newOrder = {
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`, productName: selectedProduct.title, productPrice: selectedProduct.price,
          quantity: proxyForm.quantity, customerName: proxyForm.customerName, customerPhone: proxyForm.customerPhone || proxyForm.customerWhatsapp,
          customerWhatsapp: proxyForm.customerWhatsapp, customerAddress: `${proxyForm.customerAddress}, ${proxyForm.customerDistrict}, ${proxyForm.customerState}`,
          referralId: null, proxyBuyerId: activeFranchise.id, paymentMode: proxyForm.paymentMode === "Wallet" ? "Reseller Wallet" : "Generated Invoice",
          paymentStatus: proxyForm.paymentMode === "Wallet" ? "Paid (Debited)" : "Invoice Sent", logisticsStatus: "Pending Dispatch", qcStatus: "Pending QC", timestamp: new Date().toISOString()
        };

        await addDoc(collection(db, "franchises", activeFranchise.id, "orders"), newOrder);
        await addDoc(collection(db, "franchises", activeFranchise.id, "notifications"), {
          referralId: activeFranchise.id, title: "New Proxy Order Placed", message: `Proxy purchase of ${proxyForm.quantity}x ${selectedProduct.title} for ${proxyForm.customerName}.`, timestamp: new Date().toISOString(), read: false
        });

        setProxyOrderSuccess(newOrder); setIsSubmittingProxy(false); setProxyStep(3);
      } catch (err) { console.error(err); setIsSubmittingProxy(false); }
    }, 500);
  };

  // Metrics
  const activeFranchiseOrders = allOrders.filter(o => o.referralId === activeFranchise?.id || o.proxyBuyerId === activeFranchise?.id);
  const totalReferralCommission = activeFranchiseOrders.filter(o => o.referralId === activeFranchise?.id).reduce((sum, o) => sum + (Number(o.productPrice.replace(/[^\d]/g, "")) * o.quantity * 0.05), 0);
  const totalReferralSales = activeFranchiseOrders.filter(o => o.referralId === activeFranchise?.id).reduce((sum, o) => sum + o.quantity, 0);
  const totalProxyPurchases = activeFranchiseOrders.filter(o => o.proxyBuyerId === activeFranchise?.id).reduce((sum, o) => sum + (Number(o.productPrice.replace(/[^\d]/g, "")) * o.quantity), 0);

  if (!userRole) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto shadow-md mb-4 relative">
             <Image src="/bhulia_logo_final.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reseller Hub</h2>
          <p className="text-sm text-gray-500 mt-2 mb-8">Please log in to manage your digital boutique.</p>
          <button onClick={() => {
              localStorage.setItem("sd_current_user_email", "reseller@bhulia.com");
              localStorage.setItem("sd_current_user_name", "Amaar Halchal");
              localStorage.setItem("sd_current_user_role", "franchisee");
              localStorage.setItem("sd_current_user_uid", "FRA-001");
              window.dispatchEvent(new Event("sd_auth_change"));
            }} 
            className="w-full bg-[#E57138] hover:bg-[#D56128] text-white font-bold py-3 rounded-xl shadow-md transition-all">
            Sign in as Reseller Demo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-gray-900 font-sans flex flex-col items-center">
      
      {/* STICKY TOP BRANDING HEADER */}
      <header className="sticky top-0 w-full bg-white border-b border-gray-100 shadow-sm z-50 px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm">
            <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-gray-900 leading-none">BHULIA <span className="font-normal text-gray-600">Reseller Hub</span></span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
          <Link href="/" className="hover:text-[#E57138] transition-colors">Home</Link>
          <Link href="/#products" className="hover:text-[#E57138] transition-colors">Products</Link>
          <Link href="/support" className="hover:text-[#E57138] transition-colors">Support</Link>
        </div>
      </header>

      <div className="max-w-[1500px] w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDEBAR - WHITE SAAS STYLE */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            
            {/* Top Identity Block */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {userName?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{userName}</h3>
                <p className="text-xs text-gray-500 font-mono truncate">{activeFranchise?.id}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button onClick={() => setActiveTab("overview")} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === "overview" ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="text-lg">📊</span> Dashboard
              </button>
              <button onClick={() => setActiveTab("curation")} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === "curation" ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="text-lg">🛍️</span> Store Curation
              </button>
              <button onClick={() => setActiveTab("proxy")} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === "proxy" ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="text-lg">🛒</span> Buy for Customer
              </button>
              <button onClick={() => setActiveTab("verification")} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === "verification" ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="text-lg">🛡️</span> Verification & Bank
              </button>
              <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === "orders" ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="text-lg">📦</span> Logistics Ledger
              </button>
              <button onClick={() => setActiveTab("settings")} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${activeTab === "settings" ? "bg-[#FFF4ED] text-[#E57138]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="text-lg">⚙️</span> Premium Sandbox
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link href="/" className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors block">
                ← Visit Marketplace
              </Link>
              <button onClick={() => { localStorage.clear(); window.dispatchEvent(new Event("sd_auth_change")); }} className="w-full text-center text-xs font-semibold text-red-500 mt-4 block">
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Header Greeting */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Welcome back, {userName?.split(' ')[0]}! 👋</h1>
              <p className="text-gray-500 mt-2 font-medium">Your reseller dashboard is ready to help your business thrive.</p>
            </div>
            {/* Quick Action Button Mobile/Desktop */}
            <button onClick={() => setActiveTab("proxy")} className="hidden md:flex bg-[#E57138] hover:bg-[#D56128] text-white px-6 py-3 rounded-full font-bold shadow-[0_4px_15px_rgba(229,113,56,0.3)] transition-transform hover:-translate-y-0.5">
              + New Proxy Order
            </button>
          </header>

          {activeTab === "overview" && (
            <div className="space-y-8">
              
              {/* 4-Column Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Wallet */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform"></div>
                  <div className="relative z-10">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Reseller Wallet</span>
                    <p className="text-3xl font-black text-gray-900">₹ {walletBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Available for proxy orders.</p>
                  </div>
                </div>

                {/* Card 2: Sales Count */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Referral Sales</span>
                  <p className="text-3xl font-black text-gray-900">{liveFranchiseData?.totalSales ?? totalReferralSales}</p>
                  <p className="text-xs text-gray-400 mt-2">Sales via referral link.</p>
                </div>

                {/* Card 3: Commission */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Commission Earned</span>
                  <p className="text-3xl font-black text-gray-900">₹ {(liveFranchiseData?.commissionEarned ?? totalReferralCommission).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">5% of checkout value.</p>
                </div>

                {/* Card 4: Proxy Orders */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Proxy Orders</span>
                  <p className="text-3xl font-black text-gray-900">₹ {totalProxyPurchases.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">Orders placed for clients.</p>
                </div>
              </div>

              {/* Activity Feed Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Activity Notifications</h2>
                    <p className="text-sm text-gray-500">Captures status updates and verification events.</p>
                  </div>
                  <button onClick={handleClearNotifications} className="text-sm font-semibold text-[#3B82F6] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                    Mark All Read
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-gray-500 font-medium">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                            {notif.read ? '✓' : '🔔'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                            <p className="text-sm text-gray-600 mt-0.5 leading-snug">{notif.message}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 shrink-0 ml-4 whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Power Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Widget 1: Recent Store Visits */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Recent Store Visits</h3>
                    <span className="w-8 h-8 bg-orange-50 text-[#E57138] rounded-lg flex items-center justify-center font-bold">V</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Live Page Activity</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{activeFranchise?.region}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg text-gray-900">{liveFranchiseData?.invitedCount || 0}</span>
                      <p className="text-xs text-gray-500 font-medium">Visits</p>
                    </div>
                  </div>
                </div>

                {/* Widget 2: Upgrade Upsell Card */}
                <div className="bg-gradient-to-br from-orange-50 to-[#FFF4ED] rounded-3xl p-6 shadow-sm border border-orange-100 relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#E57138]/10 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-[#D56128] mb-2">Upgrade to Franchisee</h3>
                    <p className="text-sm text-gray-700 font-medium leading-snug">
                      We upgrade for you for better commission rates and exclusive features like custom domains.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab("settings")} className="relative z-10 mt-4 w-full bg-[#E57138] hover:bg-[#D56128] text-white py-3 rounded-xl font-bold shadow-md transition-colors">
                    Upgrade to Franchisee
                  </button>
                </div>

                {/* Widget 3: Quick Action Curation */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Curate Your Storefront</h3>
                    <p className="text-sm text-gray-500 mt-1">Select products from the master catalog.</p>
                  </div>
                  <button onClick={() => setActiveTab("curation")} className="mt-4 w-full bg-white border-2 border-gray-200 hover:border-[#E57138] hover:text-[#E57138] text-gray-700 font-bold py-3 rounded-xl transition-colors">
                    Edit Storefront
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === "curation" && activeFranchise && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Store Curation Editor</h3>
                <p className="text-sm text-gray-500 mt-1">Select products to appear on your unique storefront.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MASTER_PRODUCTS.map((prod) => {
                  const isChecked = curatedIds.includes(prod.id);
                  return (
                    <div key={prod.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${isChecked ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          <Image src={prod.img} alt={prod.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-gray-900 truncate">{prod.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{prod.weave} • {prod.price}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <input type="checkbox" id={`dashboard-curate-${prod.id}`} checked={isChecked} onChange={() => handleToggleCuration(prod.id)} className="w-4 h-4 accent-[#E57138] cursor-pointer" />
                            <label htmlFor={`dashboard-curate-${prod.id}`} className="text-xs text-gray-700 cursor-pointer font-bold select-none">{isChecked ? "✓ Curated in Storefront" : "Add to Storefront"}</label>
                          </div>
                        </div>
                      </div>
                      {isChecked && (
                        <div className="mt-3 pt-3 border-t border-orange-200/50">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Custom Shelf Category</label>
                          <input type="text" value={productCategories[prod.id] || ""} onChange={(e) => handleCategoryChange(prod.id, e.target.value)} placeholder="e.g. Silk Masterpieces" className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#E57138]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "proxy" && activeFranchise && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center max-w-md mx-auto border-b border-gray-100 pb-4">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${proxyStep >= 1 ? "bg-[#E57138] text-white" : "bg-gray-100 text-gray-400"}`}>1</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-bold">Saree & Qty</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${proxyStep >= 2 ? "bg-[#E57138] text-white" : "bg-gray-100 text-gray-400"}`}>2</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-bold">Client Info</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${proxyStep >= 3 ? "bg-[#E57138] text-white" : "bg-gray-100 text-gray-400"}`}>3</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-bold">Done</span>
                </div>
              </div>

              {proxyStep === 1 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">Select Products for Proxy Order</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Select Saree</label>
                      <select value={proxyForm.productId} onChange={e => setProxyForm({ ...proxyForm, productId: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#E57138]">
                        <option value="">-- Choose Product --</option>
                        {MASTER_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.title} ({p.price})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Select Quantity</label>
                      <select value={proxyForm.quantity} onChange={e => setProxyForm({ ...proxyForm, quantity: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#E57138]">
                        {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>{q} Units</option>)}
                      </select>
                    </div>
                    {proxyForm.productId && (
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-2">
                        <div className="flex justify-between text-sm font-bold text-gray-900">
                          <span>Total Escrow Cost:</span>
                          <span className="text-[#E57138]">₹ {((Number(MASTER_PRODUCTS.find(p => p.id === proxyForm.productId)?.price.replace(/[^\d]/g, "") || 0)) * proxyForm.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={() => proxyForm.productId ? setProxyStep(2) : alert("Select a saree first.")} className="px-6 py-3 bg-[#E57138] hover:bg-[#D56128] text-white font-bold text-sm rounded-xl transition-colors">Next: Customer Address →</button>
                  </div>
                </div>
              )}

              {proxyStep === 2 && (
                <form onSubmit={handleSubmitProxyOrder} className="space-y-5 max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Client & Shipping Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Customer Full Name *</label>
                      <input required type="text" value={proxyForm.customerName} onChange={e => setProxyForm({ ...proxyForm, customerName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">WhatsApp Number *</label>
                      <input required type="tel" value={proxyForm.customerWhatsapp} onChange={e => setProxyForm({ ...proxyForm, customerWhatsapp: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Delivery Address *</label>
                    <textarea required rows={2} value={proxyForm.customerAddress} onChange={e => setProxyForm({ ...proxyForm, customerAddress: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">State</label>
                      <select value={proxyForm.customerState} onChange={e => handleStateChange(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none">
                        {Object.keys(STATE_DISTRICTS).map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">District</label>
                      <select value={proxyForm.customerDistrict} onChange={e => setProxyForm({ ...proxyForm, customerDistrict: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none">
                        {(STATE_DISTRICTS[proxyForm.customerState] || []).map(dt => <option key={dt} value={dt}>{dt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-900 block mb-3">Choose Payout Method</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#E57138]">
                        <input type="radio" name="paymentMode" value="Wallet" checked={proxyForm.paymentMode === "Wallet"} onChange={e => setProxyForm({ ...proxyForm, paymentMode: e.target.value })} className="w-4 h-4 accent-[#E57138]" />
                        <div><span className="text-sm font-bold block">Reseller Wallet</span><span className="text-xs text-gray-500">Balance: ₹ {walletBalance.toLocaleString()}</span></div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#E57138]">
                        <input type="radio" name="paymentMode" value="Invoice" checked={proxyForm.paymentMode === "Invoice"} onChange={e => setProxyForm({ ...proxyForm, paymentMode: e.target.value })} className="w-4 h-4 accent-[#E57138]" />
                        <div><span className="text-sm font-bold block">Send Invoice</span><span className="text-xs text-gray-500">To client's WhatsApp</span></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button type="button" onClick={() => setProxyStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors">← Back</button>
                    <button type="submit" disabled={isSubmittingProxy} className="px-8 py-3 bg-[#E57138] text-white font-bold text-sm rounded-xl hover:bg-[#D56128] transition-colors disabled:opacity-50">{isSubmittingProxy ? "Processing..." : "Complete Order ✓"}</button>
                  </div>
                </form>
              )}
              {proxyStep === 3 && proxyOrderSuccess && (
                <div className="text-center py-10 space-y-4">
                  <span className="text-5xl">🎉</span>
                  <h3 className="text-2xl font-bold text-gray-900">Order Confirmed!</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Order {proxyOrderSuccess.orderId} for {proxyOrderSuccess.customerName} has been successfully placed.</p>
                  <div className="flex justify-center gap-4 mt-6">
                    <button onClick={() => { setProxyForm({...proxyForm, productId:""}); setProxyOrderSuccess(null); setProxyStep(1); }} className="px-6 py-3 bg-[#E57138] text-white font-bold rounded-xl">Book Another</button>
                    <button onClick={() => setActiveTab("orders")} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">View in Ledger</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && activeFranchise && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Logistics Ledger</h3>
                <p className="text-sm text-gray-500 mt-1">Track referrals and proxy client orders.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
                      <th className="py-3 px-2 font-semibold">Order ID</th>
                      <th className="py-3 px-2 font-semibold">Product</th>
                      <th className="py-3 px-2 font-semibold">Client</th>
                      <th className="py-3 px-2 font-semibold">Status</th>
                      <th className="py-3 px-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFranchiseOrders.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders registered yet.</td></tr>
                    ) : (
                      activeFranchiseOrders.map((order, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 font-mono font-bold text-gray-900">{order.orderId}</td>
                          <td className="py-4 px-2">
                            <span className="font-bold text-gray-900 block">{order.productName}</span>
                            <span className="text-xs text-gray-500">Qty: {order.quantity}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="font-semibold text-gray-900 block">{order.customerName}</span>
                            <span className="text-xs text-gray-500">{order.customerPhone || order.customerWhatsapp}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="text-green-600 font-bold block text-xs">{order.paymentStatus}</span>
                            <span className="text-gray-500 text-xs">{order.logisticsStatus}</span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button onClick={() => {
                              // We don't have handleOpenLogistics logic implemented in the mock UI right now, so we can just alert it for this minimal version
                              alert("Logistics Modal opening for " + order.orderId);
                            }} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors">QC / Label</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && activeFranchise && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Premium Sandbox</h3>
                <p className="text-sm text-gray-500 mt-1">Configure your custom domain routing.</p>
              </div>
              <form onSubmit={handleSaveSandbox} className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Premium Status</span>
                    <p className="text-xs text-gray-500">Enable custom DNS integrations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={premiumEnabled} onChange={e => setPremiumEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E57138]"></div>
                  </label>
                </div>
                {premiumEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Custom Subdomain</label>
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden px-3">
                        <input type="text" value={customSubdomain.replace(".bhulia.com", "")} onChange={e => setCustomSubdomain(`${e.target.value.toLowerCase().replace(/\s+/g, "-")}.bhulia.com`)} className="w-full bg-transparent py-2.5 text-sm text-gray-900 focus:outline-none" />
                        <span className="text-sm font-mono text-gray-500">.bhulia.com</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">External Domain</label>
                      <input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value.toLowerCase())} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E57138]" placeholder="e.g. myboutique.in" />
                    </div>
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="px-6 py-3 bg-[#E57138] text-white font-bold rounded-xl text-sm">Save Settings</button>
                  <button type="button" onClick={handleLaunchSandboxPreview} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200">Preview Storefront</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Verification & Bank Details</h3>
                <p className="text-sm text-gray-500 mt-1">Submit your KYC and bank information to receive your automated commission payouts.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Left Side: Bank Details Form */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Payout Bank Account</h4>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Account Holder Name *</label>
                    <input type="text" placeholder="As per bank records" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Bank Name *</label>
                      <input type="text" placeholder="e.g. State Bank of India" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Account Type *</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none">
                        <option>Savings Account</option>
                        <option>Current Account</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Account Number *</label>
                    <input type="password" placeholder="Enter account number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none mb-2" />
                    <input type="text" placeholder="Confirm account number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">IFSC Code *</label>
                      <input type="text" placeholder="e.g. SBIN0001234" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none uppercase" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Bank Branch</label>
                      <input type="text" placeholder="Branch Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E57138] focus:outline-none" />
                    </div>
                  </div>
                  
                  <button className="mt-4 px-6 py-3 w-full bg-[#E57138] hover:bg-[#D56128] text-white font-bold text-sm rounded-xl transition-colors">
                    Save Bank Details
                  </button>
                </div>

                {/* Right Side: KYC Document Upload */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">KYC Documents</h4>
                  
                  <div className="bg-orange-50 border border-dashed border-orange-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-[300px]">
                    <span className="text-4xl block mb-4">📄</span>
                    <h4 className="font-bold text-gray-900 mb-1">Upload Identity Proof</h4>
                    <p className="text-xs text-gray-500 mb-6 max-w-[200px] leading-relaxed">
                      Please upload clear copies of your Aadhaar Card, PAN Card, and a canceled cheque.
                    </p>
                    <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:border-[#E57138] transition-colors">
                      Choose Files
                    </button>
                    <span className="text-[10px] text-gray-400 mt-4 block">Max file size: 5MB per document. JPG, PNG, or PDF.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
