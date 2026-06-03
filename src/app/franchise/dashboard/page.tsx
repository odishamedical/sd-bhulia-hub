"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MASTER_FRANCHISES, FranchiseListing } from "@/app/franchise/data";
import { MASTER_PRODUCTS, Product } from "@/lib/products";
import WorkspaceIdentity from "./WorkspaceIdentity";
import ListProduct from "./ListProduct";

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
  const [activeTab, setActiveTab] = useState<"overview" | "curation" | "proxy" | "orders" | "settings" | "workspace" | "list_product" | "upgrade">("overview");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(45000);

  // Proxy Purchase Wizard Form states
  const [proxyStep, setProxyStep] = useState<number>(1);
  const [proxyForm, setProxyForm] = useState({
    productId: "",
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerWhatsapp: "", // mandatory WhatsApp field
    customerEmail: "",
    customerAddress: "",
    customerState: "Odisha",
    customerDistrict: "Bargarh",
    paymentMode: "Wallet", // Wallet or Invoice
  });
  const [isSubmittingProxy, setIsSubmittingProxy] = useState<boolean>(false);
  const [proxyOrderSuccess, setProxyOrderSuccess] = useState<any | null>(null);

  // Catalog curation states
  const [curatedIds, setCuratedIds] = useState<string[]>([]);
  const [productCategories, setProductCategories] = useState<{ [id: string]: string }>({});

  // Logistics modal states
  const [selectedOrderForLogistics, setSelectedOrderForLogistics] = useState<any | null>(null);
  const [qcChecks, setQcChecks] = useState({
    handloomMark: false,
    dimensions: false,
    doubleShuttleBorder: false,
    siliconGelAdded: false
  });
  const [isUpdatingQC, setIsUpdatingQC] = useState<boolean>(false);

  // Custom domain sandbox simulator states
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

        // Set fallback first
        const matched = MASTER_FRANCHISES.find(
          (f) => f.id.toLowerCase() === uid.toLowerCase() || f.slug.toLowerCase() === uid.toLowerCase()
        ) || MASTER_FRANCHISES[0];
        setActiveFranchise(matched);

        // Fetch real franchise asynchronously
        import("@/lib/firebase").then(({ db }) => {
          import("firebase/firestore").then(({ query, collection, where, getDocs }) => {
            const q = query(collection(db, "franchises"), where("userId", "==", uid));
            getDocs(q).then((snap) => {
              if (!snap.empty) {
                const doc = snap.docs[0];
                const data = doc.data();
                
                // Self-healing: if they have an approved franchise, ensure they can access the dashboard
                if (data.status === "approved" && role !== "super_admin") {
                  setUserRole("franchisee");
                  localStorage.setItem("sd_current_user_role", "franchisee");
                }
                
                setActiveFranchise({
                  id: doc.id,
                  slug: data.slug,
                  name: data.name,
                  region: data.city ? data.city.split(", ").pop() : "Unknown",
                  city: data.city,
                  phygitalOutletsCount: 0,
                  referralsTracked: data.invitedCount || 0,
                  totalCommissionPaid: "₹ " + (data.commissionEarned || 0),
                  specialtyTags: [],
                  description: "",
                  img: data.img || MASTER_FRANCHISES[0].img,
                  outletsList: [],
                  subscriptionTier: data.subscriptionTier || "free"
                });
              }
            });
          });
        });
      } else {
        setUserRole(null);
        setUserUid("");
        setUserName(null);
        setActiveFranchise(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  // Listen to live data in Firestore for this franchise promoter
  useEffect(() => {
    if (!activeFranchise?.id) return;
    
    let unsub: any = null;
    const fetchLiveFranchise = async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { doc, onSnapshot, query, collection, where } = await import("firebase/firestore");
        
        unsub = onSnapshot(doc(db, "franchises", activeFranchise.id), (docSnap) => {
          if (docSnap.exists()) {
            setLiveFranchiseData({ id: docSnap.id, ...docSnap.data() });
          } else {
            const q = query(collection(db, "franchises"), where("slug", "==", activeFranchise.slug || activeFranchise.id.toLowerCase()));
            const unsubQuery = onSnapshot(q, (snapshot) => {
              if (!snapshot.empty) {
                const d = snapshot.docs[0];
                setLiveFranchiseData({ id: d.id, ...d.data() });
              }
            });
            unsub = unsubQuery;
          }
        });
      } catch (err) {
        console.error("Error setting up live franchise listener:", err);
      }
    };
    
    fetchLiveFranchise();
    return () => {
      if (unsub) unsub();
    };
  }, [activeFranchise?.id]);

  // Load orders, notifications, wallet balance, and curation details
  useEffect(() => {
    if (!activeFranchise) return;

    // Load Wallet Balance
    const savedWallet = localStorage.getItem(`sd_wallet_${activeFranchise.id}`);
    if (savedWallet) {
      setWalletBalance(Number(savedWallet));
    } else {
      localStorage.setItem(`sd_wallet_${activeFranchise.id}`, "45000");
      setWalletBalance(45000);
    }

    // Load Orders
    const loadOrders = () => {
      const savedOrders = localStorage.getItem("sd_all_orders");
      if (savedOrders) {
        setAllOrders(JSON.parse(savedOrders));
      } else {
        // Seed default order for validation
        const sampleOrders = [
          {
            orderId: "ORD-839201",
            productName: "Dasrajpur Royal Pasapalli Double Ikat Pata Saree",
            productPrice: "₹ 34,500",
            quantity: 1,
            customerName: "Kishore Chandra Meher",
            customerPhone: "+91 94371 88291",
            customerWhatsapp: "919437188291",
            customerAddress: "Main Street Plot 12, Attabira, Bargarh, Odisha, Pin: 768027",
            referralId: activeFranchise.id,
            proxyBuyerId: null,
            paymentMode: "escrow",
            paymentStatus: "Escrow Locked",
            logisticsStatus: "Pending Weaver Handover",
            leg1LabelGenerated: false,
            leg2LabelGenerated: false,
            qcStatus: "Pending Sourcing",
            timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
          }
        ];
        localStorage.setItem("sd_all_orders", JSON.stringify(sampleOrders));
        setAllOrders(sampleOrders);
      }
    };
    loadOrders();

    // Load Notifications
    const savedNotifs = localStorage.getItem("sd_franchise_notifications");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const defaultNotifs = [
        {
          id: "NOTIF-001",
          referralId: activeFranchise.id,
          title: "System Online",
          message: `Franchise Portal connected successfully to the Bhulia Spree ledger. Ready to track referrals for ${activeFranchise.name}.`,
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      localStorage.setItem("sd_franchise_notifications", JSON.stringify(defaultNotifs));
      setNotifications(defaultNotifs);
    }

    // Load Curations
    const savedCuration = localStorage.getItem(`sd_curation_${activeFranchise.id}`);
    if (savedCuration) {
      setCuratedIds(JSON.parse(savedCuration));
    } else {
      const defaults = MASTER_PRODUCTS.slice(0, 4).map(p => p.id);
      setCuratedIds(defaults);
      localStorage.setItem(`sd_curation_${activeFranchise.id}`, JSON.stringify(defaults));
    }

    // Load Curation Categories
    const savedCats = localStorage.getItem(`sd_categories_${activeFranchise.id}`);
    if (savedCats) {
      setProductCategories(JSON.parse(savedCats));
    } else {
      const defaults: { [id: string]: string } = {};
      MASTER_PRODUCTS.forEach(p => {
        defaults[p.id] = p.category;
      });
      setProductCategories(defaults);
      localStorage.setItem(`sd_categories_${activeFranchise.id}`, JSON.stringify(defaults));
    }

    // Load Premium status
    const prem = localStorage.getItem(`sd_premium_status_${activeFranchise.id}`) === "true";
    const dom = localStorage.getItem(`sd_custom_domain_${activeFranchise.id}`) || "";
    const sub = localStorage.getItem(`sd_subdomain_${activeFranchise.id}`) || `${activeFranchise.slug}.bhulia.com`;
    setPremiumEnabled(prem);
    setCustomDomain(dom);
    setCustomSubdomain(sub);

  }, [activeFranchise]);

  // Handle Mock Logins
  const handleMockLogin = (role: string, uid: string, name: string) => {
    localStorage.setItem("sd_current_user_email", `${uid.toLowerCase()}@bhulia.com`);
    localStorage.setItem("sd_current_user_name", name);
    localStorage.setItem("sd_current_user_role", role);
    localStorage.setItem("sd_current_user_uid", uid);
    localStorage.setItem("sd_current_user_avatar", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80");
    
    // Dispatch auth change event
    window.dispatchEvent(new Event("sd_auth_change"));
  };

  const handleLogout = () => {
    localStorage.removeItem("sd_current_user_email");
    localStorage.removeItem("sd_current_user_name");
    localStorage.removeItem("sd_current_user_role");
    localStorage.removeItem("sd_current_user_uid");
    localStorage.removeItem("sd_current_user_avatar");
    window.dispatchEvent(new Event("sd_auth_change"));
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("sd_franchise_notifications", JSON.stringify(updated));
  };

  // State prefill selection triggers district prefill
  const handleStateChange = (stateName: string) => {
    const districts = STATE_DISTRICTS[stateName] || [];
    setProxyForm({
      ...proxyForm,
      customerState: stateName,
      customerDistrict: districts[0] || ""
    });
  };

  // Catalog curation toggle
  const handleToggleCuration = (productId: string) => {
    if (!activeFranchise) return;
    let updated;
    if (curatedIds.includes(productId)) {
      updated = curatedIds.filter(id => id !== productId);
    } else {
      updated = [...curatedIds, productId];
    }
    setCuratedIds(updated);
    localStorage.setItem(`sd_curation_${activeFranchise.id}`, JSON.stringify(updated));
  };

  // Category change for curation
  const handleCategoryChange = (productId: string, value: string) => {
    if (!activeFranchise) return;
    const updated = { ...productCategories, [productId]: value };
    setProductCategories(updated);
    localStorage.setItem(`sd_categories_${activeFranchise.id}`, JSON.stringify(updated));
  };

  // Submit proxy purchase
  const handleSubmitProxyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFranchise) return;

    // Validation
    if (!proxyForm.productId) {
      alert("Please select a product first.");
      return;
    }
    if (!proxyForm.customerName.trim()) {
      alert("Customer Name is required.");
      return;
    }
    if (!proxyForm.customerWhatsapp.trim()) {
      alert("WhatsApp Number is mandatory.");
      return;
    }

    const selectedProduct = MASTER_PRODUCTS.find(p => p.id === proxyForm.productId);
    if (!selectedProduct) return;

    const priceNum = Number(selectedProduct.price.replace(/[^\d]/g, ""));
    const totalPrice = priceNum * proxyForm.quantity;

    if (proxyForm.paymentMode === "Wallet" && walletBalance < totalPrice) {
      alert(`Insufficient wallet balance. Total order value is ₹ ${totalPrice.toLocaleString()}, but your current wallet balance is ₹ ${walletBalance.toLocaleString()}.`);
      return;
    }

    setIsSubmittingProxy(true);

    setTimeout(() => {
      // Deduct wallet if paid via wallet
      let newBalance = walletBalance;
      if (proxyForm.paymentMode === "Wallet") {
        newBalance = walletBalance - totalPrice;
        setWalletBalance(newBalance);
        localStorage.setItem(`sd_wallet_${activeFranchise.id}`, String(newBalance));
      }

      // Record Order
      const newOrder = {
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        productName: selectedProduct.title,
        productPrice: selectedProduct.price,
        quantity: proxyForm.quantity,
        customerName: proxyForm.customerName,
        customerPhone: proxyForm.customerPhone || proxyForm.customerWhatsapp,
        customerWhatsapp: proxyForm.customerWhatsapp,
        customerAddress: `${proxyForm.customerAddress}, ${proxyForm.customerDistrict}, ${proxyForm.customerState}`,
        referralId: null,
        proxyBuyerId: activeFranchise.id,
        paymentMode: proxyForm.paymentMode === "Wallet" ? "Franchise Wallet" : "Generated B2B Invoice",
        paymentStatus: proxyForm.paymentMode === "Wallet" ? "Paid (Debited)" : "Invoice Sent / Awaiting Wire",
        logisticsStatus: "Pending Weaver Handover",
        leg1LabelGenerated: false,
        leg2LabelGenerated: false,
        qcStatus: "Pending Sourcing",
        timestamp: new Date().toISOString()
      };

      const updatedOrders = [newOrder, ...allOrders];
      setAllOrders(updatedOrders);
      localStorage.setItem("sd_all_orders", JSON.stringify(updatedOrders));

      // Notification
      const updatedNotifs = [
        {
          id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
          referralId: activeFranchise.id,
          title: "Proxy Order Placed",
          message: `Proxy purchase of ${proxyForm.quantity}x ${selectedProduct.title} for ${proxyForm.customerName} registered.`,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...notifications
      ];
      setNotifications(updatedNotifs);
      localStorage.setItem("sd_franchise_notifications", JSON.stringify(updatedNotifs));

      setProxyOrderSuccess(newOrder);
      setIsSubmittingProxy(false);
      setProxyStep(3); // success screen
    }, 1500);
  };

  // Launch logistics label generation
  const handleOpenLogistics = (order: any) => {
    setSelectedOrderForLogistics(order);
    setQcChecks({
      handloomMark: order.qcStatus === "QC Passed" || false,
      dimensions: order.qcStatus === "QC Passed" || false,
      doubleShuttleBorder: order.qcStatus === "QC Passed" || false,
      siliconGelAdded: order.qcStatus === "QC Passed" || false
    });
  };

  // Run QC passed updates
  const handleMarkQCPassed = () => {
    if (!selectedOrderForLogistics || !activeFranchise) return;
    if (!qcChecks.handloomMark || !qcChecks.dimensions || !qcChecks.doubleShuttleBorder || !qcChecks.siliconGelAdded) {
      alert("Please audit and check off all four QC verification checklist items before passing.");
      return;
    }

    setIsUpdatingQC(true);
    setTimeout(() => {
      const updated = allOrders.map(o => {
        if (o.orderId === selectedOrderForLogistics.orderId) {
          return {
            ...o,
            qcStatus: "QC Passed",
            logisticsStatus: "QC Approved & In Hub Transit",
            leg1LabelGenerated: true,
            leg2LabelGenerated: true
          };
        }
        return o;
      });
      setAllOrders(updated);
      localStorage.setItem("sd_all_orders", JSON.stringify(updated));

      // Trigger notification
      const updatedNotifs = [
        {
          id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
          referralId: activeFranchise.id,
          title: "QC Certification Approved",
          message: `Logistics Leg 1 & 2 Labels created for Order ${selectedOrderForLogistics.orderId}. Handloom certified.`,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...notifications
      ];
      setNotifications(updatedNotifs);
      localStorage.setItem("sd_franchise_notifications", JSON.stringify(updatedNotifs));

      setSelectedOrderForLogistics(null);
      setIsUpdatingQC(false);
      alert("Quality check passed successfully! Dual-leg shipping labels have been certified and generated.");
    }, 1000);
  };

  // Save Sandbox Settings
  const handleSaveSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFranchise) return;

    localStorage.setItem(`sd_premium_status_${activeFranchise.id}`, String(premiumEnabled));
    localStorage.setItem(`sd_custom_domain_${activeFranchise.id}`, customDomain);
    localStorage.setItem(`sd_subdomain_${activeFranchise.id}`, customSubdomain);

    alert("Premium Sandbox settings updated successfully!");
  };

  const handleLaunchSandboxPreview = () => {
    if (!activeFranchise) return;
    
    // Simulate domain mapping
    const url = premiumEnabled
      ? (customDomain ? `https://${customDomain}` : `https://${customSubdomain}`)
      : `${window.location.origin}/franchise/${activeFranchise.slug}`;

    setSandboxSimulatedUrl(url);
    setShowSandboxPreview(true);
  };

  // Filter orders for active franchise
  const activeFranchiseOrders = allOrders.filter(
    (o) => o.referralId === activeFranchise?.id || o.proxyBuyerId === activeFranchise?.id
  );

  // Compute metrics
  const totalReferralCommission = activeFranchiseOrders
    .filter(o => o.referralId === activeFranchise?.id)
    .reduce((sum, o) => {
      const priceNum = Number(o.productPrice.replace(/[^\d]/g, ""));
      return sum + (priceNum * o.quantity * 0.05); // 5% Commission
    }, 0);

  const totalReferralSales = activeFranchiseOrders
    .filter(o => o.referralId === activeFranchise?.id)
    .reduce((sum, o) => sum + o.quantity, 0);

  const totalProxyPurchases = activeFranchiseOrders
    .filter(o => o.proxyBuyerId === activeFranchise?.id)
    .reduce((sum, o) => {
      const priceNum = Number(o.productPrice.replace(/[^\d]/g, ""));
      return sum + (priceNum * o.quantity);
    }, 0);

  // Not logged in UI
  if (!userRole || (userRole !== "franchisee" && userRole !== "super_admin")) {
    return (
      <main className="min-h-screen bg-[#051815] text-white flex flex-col items-center justify-center font-sans p-6 relative">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        {/* Auth Box Container */}
        <div className="relative z-10 w-full max-w-lg bg-[#0B2B26] border-2 border-[#C5A059] rounded-3xl p-8 shadow-[0_0_50px_rgba(197,160,89,0.35)] space-y-8 backdrop-blur-md">
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#C5A059] mx-auto shadow-lg">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black tracking-wide text-[#C5A059] uppercase">Franchise Portal</h2>
              <p className="text-xs text-gray-300 uppercase tracking-widest mt-1">Shyam Dash Sovereign Dropshipping & Logistics Gate</p>
            </div>
          </div>

          <div className="bg-[#051815] p-5 rounded-2xl border border-[#C5A059]/40 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold text-center">Developer & Admin SSO simulation</h3>
            <p className="text-xs text-gray-300 text-center leading-relaxed">
              Log in directly with mock credentials to test the dropshipping wallet balance, order fulfillment queues, and custom domains.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleMockLogin("franchisee", "FRA-001", "Bargarh Phygital Hub Manager")}
                className="w-full py-3 bg-[#0A3A35] border border-[#C5A059]/50 hover:border-[#C5A059] text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-[#051815] rounded-xl transition-all cursor-pointer text-center"
              >
                Sign In: Bargarh Phygital Hub (FRA-001)
              </button>
              <button 
                onClick={() => handleMockLogin("franchisee", "FRA-002", "Sonepur Heritage Center Manager")}
                className="w-full py-3 bg-[#0A3A35] border border-[#C5A059]/50 hover:border-[#C5A059] text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-[#051815] rounded-xl transition-all cursor-pointer text-center"
              >
                Sign In: Sonepur Heritage Center (FRA-002)
              </button>
              <button 
                onClick={() => handleMockLogin("super_admin", "sd_super_admin_custom_uid", "Bhulia Central Admin")}
                className="w-full py-3 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all cursor-pointer text-center"
              >
                Sign In: Bhulia Super Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2 flex flex-col gap-2">
            <Link href="/register-franchise" className="text-xs text-[#C5A059] hover:underline uppercase tracking-widest font-bold">
              📝 Apply for a New Franchise Hub
            </Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-[#C5A059] transition-colors uppercase tracking-widest font-bold">
              ← Back to Marketplace Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Logged in Franchisee Dashboard UI
  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
      {/* Dashboard Top Sticky Header */}
      <header className="sticky top-0 w-full z-40 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 shadow-lg">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C5A059] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
            </div>
            <div>
              <Link href="/">
                <h1 className="text-lg sm:text-xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">BHULIA.COM</h1>
              </Link>
              <p className="text-[10px] text-gray-300 font-medium tracking-wide mt-1 uppercase">
                {userRole === "super_admin" ? "Central Admin Panel" : "Franchise Terminal"}
              </p>
            </div>
          </div>

          {/* Quick Stats on Header */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <span className="text-[8px] uppercase tracking-widest text-gray-400 block">Simulated Balance</span>
              <span className="text-xs font-bold text-green-400 font-mono">₹ {walletBalance.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] uppercase tracking-widest text-gray-400 block">Hub Node</span>
              <span className="text-xs font-bold text-[#C5A059]">{activeFranchise?.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-none">{userName}</span>
                <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 px-2 py-1 rounded-lg uppercase transition-all font-mono font-bold cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side Navigation & Info Card */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Active Franchise Metadata Display */}
          {activeFranchise && (
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[#C5A059]/30">
                <Image src={activeFranchise.img} alt={activeFranchise.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-[#051815]/60 flex items-end p-3">
                  <div>
                    <h3 className="font-serif font-bold text-[#C5A059] text-sm leading-tight">{activeFranchise.name}</h3>
                    <p className="text-[9px] uppercase tracking-widest text-gray-300 mt-0.5">{activeFranchise.region}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID Code:</span>
                  <span className="font-mono font-bold text-white">{activeFranchise.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Franchise Tier:</span>
                  <span className="font-bold text-[#C5A059] uppercase tracking-wider">{liveFranchiseData?.tier || "Silver"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Live Page Visits:</span>
                  <span className="font-bold text-white">{liveFranchiseData?.invitedCount || 0} Visits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WhatsApp Contact:</span>
                  <span className="font-bold text-white">{activeFranchise.contactDetails?.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Support Email:</span>
                  <span className="font-bold text-white truncate max-w-[150px]">{activeFranchise.contactDetails?.email}</span>
                </div>
                <div className="pt-2 border-t border-[#C5A059]/20 text-[10px] text-gray-300 text-center leading-relaxed">
                  {activeFranchise.contactDetails?.address}
                </div>
              </div>

              {/* View Public page */}
              <div className="pt-2">
                <button 
                  onClick={handleLaunchSandboxPreview}
                  className="w-full py-2 bg-[#0A3A35] border border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] text-[10px] font-bold uppercase tracking-widest text-[#C5A059] rounded-xl transition-all text-center block cursor-pointer"
                >
                  🚀 Launch Storefront Preview
                </button>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <nav className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-3 shadow-xl flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "overview" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>📊</span>
              <span>Overview & Wallet</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("curation")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "curation" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>🛠️</span>
              <span>Store Curation Editor</span>
            </button>

            <button 
              onClick={() => setActiveTab("proxy")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "proxy" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>🛒</span>
              <span>Buy for Customer</span>
            </button>

            <button 
              onClick={() => setActiveTab("workspace")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "workspace" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>📸</span>
              <span>Workspace Identity</span>
            </button>

            <button 
              onClick={() => setActiveTab("list_product")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "list_product" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>➕</span>
              <span>List New Product</span>
            </button>

            <button 
              onClick={() => setActiveTab("orders")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "orders" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>📦</span>
              <span>Logistics Ledger ({activeFranchiseOrders.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "settings" ? "bg-[#C5A059] text-[#0A1021] shadow-lg" : "text-gray-300 hover:bg-[#0A3A35] hover:text-white"
              }`}
            >
              <span>⭐</span>
              <span>Premium Sandbox Settings</span>
            </button>
            
            {(!liveFranchiseData?.subscriptionTier || liveFranchiseData?.subscriptionTier === "free" || liveFranchiseData?.subscriptionTier === "paid_1") && (
              <button 
                onClick={() => setActiveTab("upgrade")}
                className={`w-full mt-4 py-3 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer border border-[#C5A059]/40 ${
                  activeTab === "upgrade" ? "bg-[#C5A059] text-[#0A1021] shadow-[0_0_15px_rgba(197,160,89,0.5)]" : "bg-gradient-to-r from-[#C5A059]/10 to-[#996515]/10 text-[#C5A059] hover:bg-[#C5A059]/20"
                }`}
              >
                <span>🚀</span>
                <span>Upgrade Preview Showcase</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Right Side Content Panel */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW & WALLET */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Financial Tickers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0B2B26] border border-green-500/30 rounded-2xl p-5 shadow-xl">
                  <span className="text-[9px] uppercase tracking-widest text-green-400 font-bold block mb-1">Total Franchise Wallet</span>
                  <p className="text-2xl font-black text-white font-mono">₹ {walletBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-sans">Used to buy for customer proxy orders instantly.</p>
                </div>
                
                <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl p-5 shadow-xl">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Referral Sales Count</span>
                  <p className="text-2xl font-black text-white font-mono">{liveFranchiseData?.totalSales ?? totalReferralSales}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-sans">Completed sales via 30-day tracking cookie.</p>
                </div>

                <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl p-5 shadow-xl">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Referral Commission</span>
                  <p className="text-2xl font-black text-white font-mono">₹ {(liveFranchiseData?.commissionEarned ?? totalReferralCommission).toLocaleString()}</p>
                  <span className="text-[9px] font-mono text-green-400 font-semibold mt-2 block">Rate: 5% of checkout values</span>
                </div>

                <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl p-5 shadow-xl">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Proxy Purchases Value</span>
                  <p className="text-2xl font-black text-white font-mono">₹ {totalProxyPurchases.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-sans">Total B2C inventory purchased on behalf of clients.</p>
                </div>
              </div>

              {/* Alerts / Real-time Notification Feed */}
              <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-[#C5A059]/20 pb-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#C5A059]">Live Operations Alert Feed</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Captures Mode A direct referrals, order status updates, and verification events.</p>
                  </div>
                  <button 
                    onClick={handleMarkNotificationsRead}
                    className="text-[10px] bg-[#0A3A35] hover:bg-[#C5A059] border border-[#C5A059]/50 text-[#C5A059] hover:text-[#051815] px-2.5 py-1.5 rounded-lg uppercase transition-all font-bold cursor-pointer"
                  >
                    Clear Unread
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No alerts in queue.</p>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${
                          notif.read ? "bg-black/10 border-gray-800 opacity-60" : "bg-[#0A3A35]/40 border-[#C5A059]"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {!notif.read && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></span>}
                            {notif.title}
                          </h4>
                          <p className="text-xs text-gray-300 font-sans">{notif.message}</p>
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 shrink-0 ml-4">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Commission Setup Disclaimer */}
              <div className="bg-[#051815] rounded-2xl p-4 border border-[#C5A059]/30 font-sans text-center text-xs text-gray-300 leading-relaxed">
                📢 <strong>Note on Commission Parameters:</strong> The commission rate is set at a baseline of 5% for all sales completed via direct referral link. Dynamic adjustment of commission rules, weaver share, and premium rates is deferred to subsequent Spree platform release.
              </div>

            </div>
          )}

          {/* TAB 2: STORE CURATION EDITOR */}
          {activeTab === "curation" && activeFranchise && (
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-serif text-[#C5A059] font-bold">Catalog Curator Editor</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Select which products from the master weaving catalog will appear on your unique storefront. Map them to custom categories to suit local customer demand.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MASTER_PRODUCTS.map((prod) => {
                  const isChecked = curatedIds.includes(prod.id);
                  return (
                    <div 
                      key={prod.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isChecked ? "bg-[#0A3A35]/40 border-[#C5A059]" : "bg-black/20 border-gray-800 opacity-60"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-700 bg-gray-900">
                          <Image src={prod.img} alt={prod.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">{prod.title}</h4>
                          <p className="text-[10px] text-gray-300 mt-0.5">{prod.weave} • {prod.price}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id={`dashboard-curate-${prod.id}`}
                              checked={isChecked}
                              onChange={() => handleToggleCuration(prod.id)}
                              className="w-4 h-4 accent-[#C5A059] cursor-pointer"
                            />
                            <label htmlFor={`dashboard-curate-${prod.id}`} className="text-xs text-gray-200 cursor-pointer font-bold select-none">
                              {isChecked ? "✓ Curated in Storefront" : "Add to Storefront"}
                            </label>
                          </div>
                        </div>
                      </div>

                      {isChecked && (
                        <div className="mt-3 pt-3 border-t border-[#C5A059]/10">
                          <label className="text-[9px] uppercase tracking-widest text-[#C5A059] block mb-1">Custom Shelf Category</label>
                          <input 
                            type="text"
                            value={productCategories[prod.id] || ""}
                            onChange={(e) => handleCategoryChange(prod.id, e.target.value)}
                            placeholder="e.g. Silk Masterpieces, Cotton Classics"
                            className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#051815] rounded-xl p-4 border border-[#C5A059]/20 text-center text-xs text-gray-300">
                ⚡ Any changes made here immediately sync on your public URL storefront `/{activeFranchise.slug}`.
              </div>
            </div>
          )}

          {/* TAB 3: BUY FOR CUSTOMER (PROXY MODE) */}
          {activeTab === "proxy" && activeFranchise && (
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* Steps Indicator */}
              <div className="flex justify-between items-center max-w-md mx-auto border-b border-[#C5A059]/20 pb-4">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border ${
                    proxyStep >= 1 ? "bg-[#C5A059] text-[#0A1021] border-[#C5A059]" : "border-gray-600 text-gray-400"
                  }`}>1</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-1">Saree & Qty</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-600 mx-2"></div>
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border ${
                    proxyStep >= 2 ? "bg-[#C5A059] text-[#0A1021] border-[#C5A059]" : "border-gray-600 text-gray-400"
                  }`}>2</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-1">Client Info</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-600 mx-2"></div>
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border ${
                    proxyStep >= 3 ? "bg-[#C5A059] text-[#0A1021] border-[#C5A059]" : "border-gray-600 text-gray-400"
                  }`}>3</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-1">Confirmation</span>
                </div>
              </div>

              {proxyStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-serif text-[#C5A059] font-bold">Select Products for Proxy Order</h3>
                    <p className="text-xs text-gray-300 mt-1">Select the authentic handloom item ordered by your offline client.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Select Saree Masterpiece</label>
                      <select 
                        value={proxyForm.productId}
                        onChange={e => setProxyForm({ ...proxyForm, productId: e.target.value })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="">-- Choose Product from Master Catalog --</option>
                        {MASTER_PRODUCTS.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.price})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Select Quantity</label>
                      <select 
                        value={proxyForm.quantity}
                        onChange={e => setProxyForm({ ...proxyForm, quantity: Number(e.target.value) })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                          <option key={q} value={q}>{q} Units</option>
                        ))}
                      </select>
                    </div>

                    {proxyForm.productId && (
                      <div className="bg-[#051815] p-4 rounded-2xl border border-[#C5A059]/40 space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 block">Pricing Calculation</span>
                        <div className="flex justify-between text-xs text-gray-200">
                          <span>Unit Price:</span>
                          <span className="font-mono">{MASTER_PRODUCTS.find(p => p.id === proxyForm.productId)?.price}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-200">
                          <span>Quantity:</span>
                          <span>{proxyForm.quantity}</span>
                        </div>
                        <div className="border-t border-[#C5A059]/20 pt-2 flex justify-between text-sm font-bold text-white">
                          <span>Total Escrow Cost:</span>
                          <span className="font-mono text-[#C5A059]">
                            ₹ {((Number(MASTER_PRODUCTS.find(p => p.id === proxyForm.productId)?.price.replace(/[^\d]/g, "") || 0)) * proxyForm.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => {
                        if (!proxyForm.productId) {
                          alert("Select a saree first.");
                          return;
                        }
                        setProxyStep(2);
                      }}
                      className="px-6 py-2.5 bg-[#C5A059] border border-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all cursor-pointer"
                    >
                      Next: Customer Address →
                    </button>
                  </div>
                </div>
              )}

              {proxyStep === 2 && (
                <form onSubmit={handleSubmitProxyOrder} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-serif text-[#C5A059] font-bold">Client & Shipping Information</h3>
                    <p className="text-xs text-gray-300 mt-1">Please enter delivery coordinates. Dynamic shipping label parameters depend on this.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">Customer Full Name <span className="text-red-400">*</span></label>
                      <input 
                        required 
                        type="text" 
                        value={proxyForm.customerName}
                        onChange={e => setProxyForm({ ...proxyForm, customerName: e.target.value })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">WhatsApp Number <span className="text-red-400">*</span></label>
                      <input 
                        required 
                        type="tel" 
                        value={proxyForm.customerWhatsapp}
                        onChange={e => setProxyForm({ ...proxyForm, customerWhatsapp: e.target.value })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="+91 xxxxx xxxxx"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">Alternative Contact Phone</label>
                      <input 
                        type="tel" 
                        value={proxyForm.customerPhone}
                        onChange={e => setProxyForm({ ...proxyForm, customerPhone: e.target.value })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="Alternative phone"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={proxyForm.customerEmail}
                        onChange={e => setProxyForm({ ...proxyForm, customerEmail: e.target.value })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="customer@domain.com"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">Delivery Address (Room, Building, Street) <span className="text-red-400">*</span></label>
                    <textarea 
                      required 
                      rows={2} 
                      value={proxyForm.customerAddress}
                      onChange={e => setProxyForm({ ...proxyForm, customerAddress: e.target.value })}
                      className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      placeholder="Enter full physical address"
                    />
                  </div>

                  {/* State & District with Prefill Linkage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">State Selection</label>
                      <select 
                        value={proxyForm.customerState}
                        onChange={e => handleStateChange(e.target.value)}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        {Object.keys(STATE_DISTRICTS).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-300 block mb-1">District (Prefilled & Dynamic)</label>
                      <select 
                        value={proxyForm.customerDistrict}
                        onChange={e => setProxyForm({ ...proxyForm, customerDistrict: e.target.value })}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        {(STATE_DISTRICTS[proxyForm.customerState] || []).map(dt => (
                          <option key={dt} value={dt}>{dt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Payment selection */}
                  <div className="bg-[#051815] p-5 rounded-2xl border border-[#C5A059]/40 space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">Choose Payout Method</span>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-3 bg-[#0B2B26]/60 border border-[#C5A059]/30 rounded-xl cursor-pointer hover:bg-[#0A3A35] transition-colors">
                        <input 
                          type="radio" 
                          name="paymentMode" 
                          value="Wallet" 
                          checked={proxyForm.paymentMode === "Wallet"}
                          onChange={e => setProxyForm({ ...proxyForm, paymentMode: e.target.value })}
                          className="w-4 h-4 accent-[#C5A059]"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Franchise Wallet</span>
                          <span className="text-[9px] text-gray-400">Debit instantly from ₹ {walletBalance.toLocaleString()}</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-[#0B2B26]/60 border border-[#C5A059]/30 rounded-xl cursor-pointer hover:bg-[#0A3A35] transition-colors">
                        <input 
                          type="radio" 
                          name="paymentMode" 
                          value="Invoice" 
                          checked={proxyForm.paymentMode === "Invoice"}
                          onChange={e => setProxyForm({ ...proxyForm, paymentMode: e.target.value })}
                          className="w-4 h-4 accent-[#C5A059]"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Generate Invoice</span>
                          <span className="text-[9px] text-gray-400">Dispatch payment link to customer's WhatsApp</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button"
                      onClick={() => setProxyStep(1)}
                      className="px-6 py-2.5 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#0D4B45] transition-colors"
                    >
                      ← Back
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingProxy}
                      className="px-8 py-2.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingProxy ? "Booking Escrow Vault..." : "Complete & Lock Order ✓"}
                    </button>
                  </div>
                </form>
              )}

              {proxyStep === 3 && proxyOrderSuccess && (
                <div className="text-center py-6 space-y-6">
                  <span className="text-5xl">🎉</span>
                  <h3 className="text-2xl font-serif font-bold text-green-400">Proxy Purchase Escrow Secured</h3>
                  <p className="text-sm text-gray-200 leading-relaxed max-w-md mx-auto">
                    The order of <strong>{proxyOrderSuccess.quantity}x {proxyOrderSuccess.productName}</strong> for client <strong>{proxyOrderSuccess.customerName}</strong> has been logged to the ledger.
                  </p>
                  
                  <div className="bg-[#051815] p-5 rounded-2xl border border-[#C5A059]/30 max-w-sm mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between font-mono text-[#C5A059]">
                      <span>Order ID:</span>
                      <span>{proxyOrderSuccess.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WhatsApp Link sent:</span>
                      <span className="text-green-400 font-bold">Yes ({proxyOrderSuccess.customerWhatsapp})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leg 1 Fulfillment:</span>
                      <span>Pending Weaver Drop</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fund Lock Status:</span>
                      <span className="text-yellow-400 font-bold">{proxyOrderSuccess.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => {
                        setProxyForm({
                          productId: "",
                          quantity: 1,
                          customerName: "",
                          customerPhone: "",
                          customerWhatsapp: "",
                          customerEmail: "",
                          customerAddress: "",
                          customerState: "Odisha",
                          customerDistrict: "Bargarh",
                          paymentMode: "Wallet",
                        });
                        setProxyOrderSuccess(null);
                        setProxyStep(1);
                      }}
                      className="px-6 py-2.5 bg-[#C5A059] border border-[#C5A059] text-[#0A1021] rounded-xl text-xs uppercase tracking-wider hover:brightness-110 transition-all font-bold cursor-pointer"
                    >
                      Book Another Order
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab("orders");
                      }}
                      className="px-6 py-2.5 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-colors font-bold cursor-pointer"
                    >
                      View Order in Ledger
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ACTIVE ORDERS & LOGISTICS LEDGER */}
          {activeTab === "orders" && activeFranchise && (
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-serif text-[#C5A059] font-bold">Sovereign Logistics & Order Ledger</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Track direct customer referrals (Mode A) and offline proxy client orders (Mode B). Conduct drop-off QC audits and generate shipping labels.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#C5A059]/30 text-[#C5A059] uppercase tracking-widest font-mono text-[9px]">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Saree product</th>
                      <th className="py-3 px-2">Client / Phone</th>
                      <th className="py-3 px-2">Flow Mode</th>
                      <th className="py-3 px-2">Payment Status</th>
                      <th className="py-3 px-2">Logistics / Hub QC</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFranchiseOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 font-sans">
                          No orders registered for this franchise yet. Test by placing a referral checkout or booking a proxy client.
                        </td>
                      </tr>
                    ) : (
                      activeFranchiseOrders.map((order, idx) => (
                        <tr key={idx} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/30 transition-colors">
                          <td className="py-3.5 px-2 font-mono font-bold text-white">{order.orderId}</td>
                          <td className="py-3.5 px-2">
                            <span className="font-bold text-white block">{order.productName}</span>
                            <span className="text-[10px] text-gray-400">Qty: {order.quantity} • {order.productPrice}</span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="font-semibold text-white block">{order.customerName}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">{order.customerPhone || order.customerWhatsapp}</span>
                          </td>
                          <td className="py-3.5 px-2">
                            {order.referralId ? (
                              <span className="px-2 py-0.5 bg-blue-900/30 border border-blue-500/40 text-blue-300 rounded font-mono text-[10px] font-bold uppercase tracking-wider">
                                Mode A (Referral)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-purple-900/30 border border-purple-500/40 text-purple-300 rounded font-mono text-[10px] font-bold uppercase tracking-wider">
                                Mode B (Proxy)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-green-400 font-bold block">{order.paymentStatus}</span>
                            <span className="text-[9px] text-gray-400">{order.paymentMode}</span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-white block font-semibold">{order.logisticsStatus}</span>
                            <span className={`text-[10px] font-bold ${
                              order.qcStatus === "QC Passed" ? "text-green-400" : "text-yellow-400"
                            }`}>
                              QC: {order.qcStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button 
                              onClick={() => handleOpenLogistics(order)}
                              className="px-2.5 py-1 bg-[#0A3A35] border border-[#C5A059]/40 hover:border-[#C5A059] text-white hover:bg-[#C5A059] hover:text-[#0A1021] rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Logistics Label / QC
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PREMIUM SANDBOX SETTINGS */}
          {activeTab === "settings" && activeFranchise && (
            <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-serif text-[#C5A059] font-bold">Premium Subscription & Domain Sandbox</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Simulate premium upgrades and verify custom DNS subdomain resolution within the Bhulia routing sandbox.
                </p>
              </div>

              <form onSubmit={handleSaveSandbox} className="space-y-4 max-w-xl">
                
                {/* Premium status toggle */}
                <div className="bg-[#051815] p-5 rounded-2xl border border-[#C5A059]/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block uppercase tracking-wide">Admin Logic Gate: Premium Account Status</span>
                    <p className="text-[11px] text-gray-400">Enable premium custom DNS integrations (Simulates client billing verification).</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={premiumEnabled}
                      onChange={e => setPremiumEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                  </label>
                </div>

                {premiumEnabled && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Custom Subdomain mapping</label>
                      <div className="flex items-center bg-[#051815] border border-[#C5A059]/40 rounded-xl overflow-hidden px-3">
                        <input 
                          type="text" 
                          value={customSubdomain.replace(".bhulia.com", "")}
                          onChange={e => setCustomSubdomain(`${e.target.value.toLowerCase().replace(/\s+/g, "-")}.bhulia.com`)}
                          className="w-full bg-transparent py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none"
                          placeholder="e.g. bargarh"
                        />
                        <span className="text-xs font-mono text-gray-400 shrink-0 select-none">.bhulia.com</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">Your default subdomain simulation routing coordinate.</span>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Custom External Domain mapping</label>
                      <input 
                        type="text" 
                        value={customDomain}
                        onChange={e => setCustomDomain(e.target.value.toLowerCase())}
                        className="w-full bg-[#051815] border border-[#C5A059]/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="e.g. bargarh-handloom-hub.in"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">BVC Secure Shield wraps around this domain to preserve cookies.</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#C5A059]/20 flex justify-between gap-4">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#C5A059] border border-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all cursor-pointer"
                  >
                    Save DNS Settings
                  </button>
                  <button 
                    type="button"
                    onClick={handleLaunchSandboxPreview}
                    className="px-6 py-2.5 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] hover:text-white rounded-xl text-xs uppercase tracking-widest hover:bg-[#0D4B45] transition-colors"
                  >
                    Preview Storefront URL simulation
                  </button>
                </div>
              </form>
            </div>
          )}

        </section>
      </div>

      {/* QC & LOGISTICS MODAL COMPONENT */}
      {selectedOrderForLogistics && activeFranchise && (
        <div className="fixed inset-0 z-50 bg-[#051815]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B2B26] border-2 border-[#C5A059] rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button 
              onClick={() => setSelectedOrderForLogistics(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#051815] border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center text-sm hover:border-[#C5A059] transition-all cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="border-b border-[#C5A059]/30 pb-4">
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-mono font-bold">Verification & Shipping Hub Routing Panel</span>
              <h3 className="text-xl font-serif font-bold text-white mt-1">Order Fulfillment: {selectedOrderForLogistics.orderId}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Hub Quality Control Verification */}
              <div className="lg:col-span-5 bg-[#051815] p-5 rounded-2xl border border-[#C5A059]/30 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block border-b border-[#C5A059]/20 pb-2">Hub Agent QC verification</span>
                
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Before releasing payout from Escrow and routing to customer, verify physical handloom parameters at the {activeFranchise.city} drop-off counter.
                </p>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 text-xs text-gray-200 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={qcChecks.handloomMark}
                      onChange={e => setQcChecks({ ...qcChecks, handloomMark: e.target.checked })}
                      className="w-4 h-4 mt-0.5 accent-[#C5A059] shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Handloom Mark Verified</span>
                      <span className="text-[10px] text-gray-400">Scan weaver’s physical stamp badge registry.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs text-gray-200 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={qcChecks.dimensions}
                      onChange={e => setQcChecks({ ...qcChecks, dimensions: e.target.checked })}
                      className="w-4 h-4 mt-0.5 accent-[#C5A059] shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Dimensions Audit Passed</span>
                      <span className="text-[10px] text-gray-400">Confirm dimensions match standard length (~6.2m, ~600g).</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs text-gray-200 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={qcChecks.doubleShuttleBorder}
                      onChange={e => setQcChecks({ ...qcChecks, doubleShuttleBorder: e.target.checked })}
                      className="w-4 h-4 mt-0.5 accent-[#C5A059] shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Double-Shuttle Border Check</span>
                      <span className="text-[10px] text-gray-400">Verify alignment of Ikat temple spires (Phoda Kumbha).</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs text-gray-200 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={qcChecks.siliconGelAdded}
                      onChange={e => setQcChecks({ ...qcChecks, siliconGelAdded: e.target.checked })}
                      className="w-4 h-4 mt-0.5 accent-[#C5A059] shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Silicon Gel & Moisture Seal</span>
                      <span className="text-[10px] text-gray-400">Place moisture packs inside direct premium canvas wrapping.</span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#C5A059]/20">
                  <button 
                    onClick={handleMarkQCPassed}
                    disabled={isUpdatingQC}
                    className="w-full py-2.5 bg-green-950/60 hover:bg-green-900 border border-green-500 text-green-300 rounded-xl text-xs uppercase tracking-widest font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingQC ? "Updating Ledger..." : "Certify QC & Release Labels ✓"}
                  </button>
                </div>
              </div>

              {/* Right Side: Dual-Leg Shipping Label Simulator */}
              <div className="lg:col-span-7 space-y-6">
                
                {selectedOrderForLogistics.qcStatus !== "QC Passed" ? (
                  <div className="bg-[#051815] border border-dashed border-[#C5A059]/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full">
                    <span className="text-3xl">🛡️</span>
                    <h4 className="font-bold text-white text-sm mt-3">QC Clearance Required</h4>
                    <p className="text-xs text-gray-300 mt-2 max-w-sm">
                      Dual-leg logistics labels can only be printed after the Hub Agent verifies handloom integrity checklists.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                    
                    {/* LEG 1 LABEL */}
                    <div className="bg-white text-black p-4 rounded-xl border-2 border-black font-mono text-[10px] space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 font-bold uppercase text-[8px] tracking-widest rounded">
                        LEG 1
                      </div>
                      <div className="border-b border-black pb-2">
                        <h4 className="font-black text-xs uppercase tracking-wider">BHULIA D2C HUB ROUTING LABEL</h4>
                        <p className="text-[9px] text-gray-600">Carrier: Primary society transport / Hub shuttle</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div>
                          <strong className="block text-gray-600 font-sans text-[7px] uppercase tracking-wide">WEAVER POINT (ORIGIN)</strong>
                          <span className="font-bold block">Dasrajpur Weaving Cluster</span>
                          <span>Sonepur District, Odisha</span>
                        </div>
                        <div>
                          <strong className="block text-gray-600 font-sans text-[7px] uppercase tracking-wide">TRANSIT HUB (TERMINAL)</strong>
                          <span className="font-bold block">{activeFranchise.name}</span>
                          <span>{activeFranchise.contactDetails?.address}</span>
                        </div>
                      </div>
                      <div className="border-t border-b border-black py-2 my-2 flex justify-between items-center bg-gray-100 px-2 font-mono">
                        <div>
                          <strong>PACKAGE WEIGHT:</strong> 650 grams
                        </div>
                        <div>
                          <strong>LOT ID:</strong> BHL-PAS-001
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-48 h-8 bg-black relative flex items-center justify-center text-white text-xs font-black tracking-widest">
                          ||||| | |||| || ||| | |||
                        </div>
                        <button 
                          onClick={() => window.print()}
                          className="px-3 py-1 bg-black text-white rounded font-sans text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shrink-0"
                        >
                          Print Leg 1 Label
                        </button>
                      </div>
                    </div>

                    {/* LEG 2 LABEL */}
                    <div className="bg-white text-black p-4 rounded-xl border-2 border-black font-mono text-[10px] space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 font-bold uppercase text-[8px] tracking-widest rounded">
                        LEG 2
                      </div>
                      <div className="border-b border-black pb-2">
                        <h4 className="font-black text-xs uppercase tracking-wider">BVC SECURE CUSTOMER DISPATCH</h4>
                        <p className="text-[9px] text-gray-600">Carrier Partner: Sequel / BVC Express Cargo</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div>
                          <strong className="block text-gray-600 font-sans text-[7px] uppercase tracking-wide">ROUTING TERMINAL (FROM)</strong>
                          <span className="font-bold block">{activeFranchise.name}</span>
                          <span>{activeFranchise.contactDetails?.address}</span>
                        </div>
                        <div>
                          <strong className="block text-gray-600 font-sans text-[7px] uppercase tracking-wide">CUSTOMER DESTINATION (TO)</strong>
                          <span className="font-bold block">{selectedOrderForLogistics.customerName}</span>
                          <span>{selectedOrderForLogistics.customerAddress}</span>
                          <span className="block font-bold">Tel: {selectedOrderForLogistics.customerPhone}</span>
                        </div>
                      </div>
                      <div className="border-t border-b border-black py-2 my-2 flex justify-between items-center bg-gray-100 px-2 font-mono">
                        <div>
                          <strong>DISPATCH NO:</strong> {selectedOrderForLogistics.orderId}
                        </div>
                        <div>
                          <strong>ESCROW:</strong> GUARANTEED RELEASE
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-48 h-8 bg-black relative flex items-center justify-center text-white text-xs font-black tracking-widest">
                          |||| ||| ||| | ||| |||| |
                        </div>
                        <button 
                          onClick={() => window.print()}
                          className="px-3 py-1 bg-black text-white rounded font-sans text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shrink-0"
                        >
                          Print Leg 2 Label
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB: UPGRADE PREVIEW SHOWCASE */}
      {activeTab === "upgrade" && activeFranchise && (
        <div className="bg-[#0B2B26] border-2 border-[#C5A059] shadow-[0_0_40px_rgba(197,160,89,0.15)] rounded-3xl p-6 sm:p-10 space-y-8 animate-fadeIn text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-6xl block mb-2">💎</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white uppercase tracking-wider">
              Unlock Your <span className="text-[#C5A059]">Infinite</span> Storefront
            </h2>
            <p className="text-sm text-gray-300 font-sans leading-relaxed">
              You are currently on a limited tier. Upgrade now to unlock a fully white-labeled public storefront, unlimited catalog capacity, custom domain routing, and priority escrow logistics.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left my-8">
              <div className="bg-[#051815] border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg space-y-3">
                <h4 className="text-sm font-bold text-[#C5A059] uppercase tracking-widest border-b border-[#C5A059]/20 pb-2">Current Tier Limits</h4>
                <ul className="space-y-2 text-xs text-gray-400 font-mono">
                  <li>❌ Public Storefront Restricted</li>
                  <li>❌ Limited to 10 Products</li>
                  <li>❌ Subdomain Not Available</li>
                  <li>❌ Standard Logistics SLA</li>
                </ul>
              </div>
              <div className="bg-gradient-to-b from-[#0A3A35] to-[#051815] border-2 border-[#C5A059] rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-bl-lg">Recommended</div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest border-b border-[#C5A059]/40 pb-2">Premium Unlimited</h4>
                <ul className="space-y-2 text-xs text-green-300 font-mono">
                  <li>✅ Fully Custom Public Storefront</li>
                  <li>✅ Unlimited Masterpiece Catalog</li>
                  <li>✅ Advanced Custom Domain Routing</li>
                  <li>✅ BVC Secure Shield Priority Escrow</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-[#C5A059]/20">
              <button 
                onClick={async () => {
                  if (confirm("This is a demo payment gateway! Proceed to instantly upgrade your tier to Premium Unlimited?")) {
                    try {
                      const { db } = await import("@/lib/firebase");
                      const { doc, updateDoc } = await import("firebase/firestore");
                      const ref = doc(db, "franchises", activeFranchise.id);
                      await updateDoc(ref, {
                        subscriptionTier: "paid_3",
                        tier: "Premium"
                      });
                      alert("Payment Successful! Your tier has been upgraded to Premium (paid_3). Returning to overview...");
                      setActiveTab("overview");
                    } catch (e) {
                      console.error(e);
                      alert("Error updating tier.");
                    }
                  }
                }}
                className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold uppercase tracking-widest bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] hover:brightness-125 transition-all shadow-xl cursor-pointer text-sm"
              >
                Pay ₹9,999 to Activate Premium
              </button>
              <p className="text-[10px] text-gray-500 font-mono mt-3 uppercase tracking-widest">
                Mock Payment Gateway - For Demonstration Purposes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WORKSPACE IDENTITY */}
      {activeTab === "workspace" && activeFranchise && (
        <WorkspaceIdentity franchiseId={activeFranchise.id} />
      )}

      {/* TAB: LIST PRODUCT */}
      {activeTab === "list_product" && activeFranchise && (
        <ListProduct franchiseId={activeFranchise.id} />
      )}

      {/* CUSTOM DOMAIN PREVIEW MODAL */}
      {showSandboxPreview && activeFranchise && (
        <div className="fixed inset-0 z-50 bg-[#051815]/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          
          {/* Mock Browser Window Container */}
          <div className="bg-[#0B2B26] border-2 border-[#C5A059] rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden h-[90vh]">
            
            {/* Mock Browser Header */}
            <div className="bg-[#051815] px-6 py-3 flex items-center justify-between border-b border-[#C5A059]/40 gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/80 block"></span>
              </div>
              
              {/* Address bar */}
              <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl py-1.5 px-4 text-xs font-mono text-[#C5A059] text-center flex-1 max-w-2xl select-all select-none">
                🔒 {sandboxSimulatedUrl}
              </div>

              <div className="flex items-center gap-3">
                {premiumEnabled ? (
                  <span className="px-2.5 py-1 bg-[#C5A059]/20 border border-[#C5A059] text-[#C5A059] rounded-lg text-[9px] uppercase tracking-wider font-mono font-bold">
                    ✓ Premium DNS Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-red-950 border border-red-500 text-red-300 rounded-lg text-[9px] uppercase tracking-wider font-mono font-bold">
                    Standard Sandbox URL
                  </span>
                )}
                
                <button 
                  onClick={() => setShowSandboxPreview(false)}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500 text-red-300 px-3 py-1.5 rounded-xl uppercase text-xs transition-all font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Sandbox Simulation Frame Content */}
            <div className="flex-1 bg-[#051815] overflow-y-auto p-2">
              <div className="border border-white/10 rounded-2xl h-full p-4 relative bg-[#051815]">
                
                {/* Premium Banner (Customized Header inside mock window) */}
                <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">Mapped Hostname Sandbox</span>
                    <h3 className="text-xl font-serif text-white font-bold">{activeFranchise.name}</h3>
                    <p className="text-xs text-gray-300">
                      Resolving custom domains via BVC Secure Shield cookie wrapper. Cookies for <strong>ref={activeFranchise.id}</strong> are mapped dynamically.
                    </p>
                  </div>
                  <div className="bg-[#051815] border border-green-500/40 text-green-300 px-4 py-2 rounded-xl text-xs font-mono font-bold text-center">
                    STATUS: ACTIVE (200 OK)
                  </div>
                </div>

                {/* Minimal preview listing */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 border-b border-[#C5A059]/20 pb-2">Storefront Curated Shelves</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {MASTER_PRODUCTS.filter(p => curatedIds.includes(p.id)).map((p, idx) => (
                      <div key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl p-3 space-y-3">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-900">
                          <Image src={p.img} alt={p.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs truncate">{p.title}</h5>
                          <span className="text-xs font-mono font-bold text-[#C5A059]">{p.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
