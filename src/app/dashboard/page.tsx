"use client";

import PremiumMetricCard from "@/components/PremiumMetricCard";
import VanityUrlManager from "@/components/VanityUrlManager";
import HelpGuideTab from "@/components/HelpGuideTab";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, getDocs, query, where, deleteField } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS, WEAVER_DISTRICTS } from "@/lib/locations";
import { 
  useOrders,
  useTransactions,
  useProducts,
  useWeavers,
  useStores,
  useResellers,
  updateDocumentStatus
} from "@/lib/db-hooks";

import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ImageUploader from "@/components/ImageUploader";
import SecurityTab from "@/components/SecurityTab";
import StaffAccountsTab from "@/components/StaffAccountsTab";
import SellerSetupHub from "@/components/SellerSetupHub";
import SaaSUpgraderModal from "@/components/SaaSUpgraderModal";
import PricingTab from "@/components/PricingTab";

import { uploadBase64ToStorage } from "@/lib/storageUtils";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userStatus, setUserStatus] = useState<string>("active");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [isViewAsMode, setIsViewAsMode] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [storeSlug, setStoreSlug] = useState<string>("demo");
  const [globalNotifications, setGlobalNotifications] = useState<any[]>([]);
  const [canSellWholesale, setCanSellWholesale] = useState(false);
  const [affiliateCommissionsPaid, setAffiliateCommissionsPaid] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Load saved seller mode preference
    let savedMode = localStorage.getItem("sd_seller_mode");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewAsRole = params.get("viewAs");
      if (viewAsRole && ["store", "weaver", "wholesaler", "supplier"].includes(viewAsRole)) {
        savedMode = "true";
      }
    }
    if (savedMode === "true") setIsSellerMode(true);

    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("bhulia_active_tab");
      const params = new URLSearchParams(window.location.search);
      const applyParam = params.get("apply");
      if (applyParam) {
        setActiveTab("seller_hub");
      } else if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("bhulia_active_tab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        document.cookie = `bhulia-auth-token=${user.uid}; path=/; max-age=86400`;
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const actualRole = userDoc.data().role || "customer";
            
            // Clean up legacy localStorage keys
            localStorage.removeItem("sd_view_as_uid");
            localStorage.removeItem("sd_view_as_role");
            localStorage.removeItem("sd_view_as_name");
            
            const params = new URLSearchParams(window.location.search);
            const viewAsRole = params.get("viewAs");
            const viewAsUid = viewAsRole ? "demo-" + viewAsRole : null;
            const viewAsName = viewAsRole ? "Demo " + viewAsRole.charAt(0).toUpperCase() + viewAsRole.slice(1) : null;
            
            if (actualRole === "super_admin" && viewAsUid && viewAsRole) {
              if (viewAsRole === "wholesaler") {
                router.push("/dashboard/wholesaler");
                return;
              } else if (viewAsRole === "supplier" || viewAsRole === "raw_material") {
                router.push("/dashboard/supplier");
                return;
              }
              setRole(viewAsRole);
              setUserName(viewAsName || "Viewing User");
              setIsViewAsMode(true);
            } else if (actualRole === "wholesaler") {
              router.push("/dashboard/wholesaler");
              return;
            } else if (actualRole === "supplier" || actualRole === "raw_material") {
              router.push("/dashboard/supplier");
              return;
            } else if (actualRole === "weaver_staff" || actualRole === "store_staff") {
              const bossUid = userDoc.data().bossUid;
              if (bossUid) {
                setRole(actualRole);
                setUserName(userDoc.data().name || user.email?.split("@")[0] || "Staff");
                setIsViewAsMode(false);
                localStorage.setItem("sd_boss_uid", bossUid);
              } else {
                setRole("customer");
                setUserName(user.email?.split("@")[0] || "User");
              }
            } else {
              setRole(actualRole);
              setUserName(userDoc.data().name || user.email?.split("@")[0] || "User");
              setIsViewAsMode(false);
            }
            
            // Calculate slug for public pages
            const data = userDoc.data();
            setUserStatus(data.status || data.applicationStatus || "active");
            const slug = String(data.storeName || data.name || "demo").toLowerCase().replace(/[^a-z0-9]+/g, '-');
            setStoreSlug(slug);

            // Fetch wholesale permissions
            let targetCollection = actualRole === "weaver" ? "weavers" : (actualRole === "store" || actualRole === "shop" || actualRole === "store" ? "stores" : null);
            if (targetCollection) {
              const vendorDoc = await getDoc(doc(db, targetCollection, user.uid));
              if (vendorDoc.exists()) {
                setCanSellWholesale(vendorDoc.data().canSellWholesale || false);
              }

              // Fetch Commissions Paid out to Resellers
              try {
                const commQ = query(collection(db, "reseller_commissions"), where("sellerId", "==", user.uid));
                const commSnap = await getDocs(commQ);
                let totalPaid = 0;
                commSnap.forEach(d => totalPaid += d.data().amount || 0);
                setAffiliateCommissionsPaid(totalPaid);
              } catch (e) {
                console.error("Failed to fetch commissions paid:", e);
              }
            }

            // Fetch Notifications
            try {
              const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
              const querySnapshot = await getDocs(q);
              const fetchedNotifs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              fetchedNotifs.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
              setGlobalNotifications(fetchedNotifs);
            } catch (err) {
              console.error("Failed to fetch global notifications", err);
            }

          } else {
            // New logic: Default to customer, no blocking onboarding
            setRole("customer");
            setUserName(user.email?.split("@")[0] || "User");
            setStoreSlug("demo");
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          setRole("customer");
        }
      } else {
        document.cookie = "bhulia-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-12 h-12 border-4 border-[#0070F3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isCustomer = role === "customer" || role === "user" || !role;
  const isSuperAdmin = role === "super_admin";
  const displayRole = role === "franchisee" ? "reseller" : (role === "store" || role === "shop") ? "store" : role;
  
  // Resolve actual role mapping (Dual-Role Architecture)
  let actualRole = "customer";
  if (isSuperAdmin) {
    actualRole = "super_admin";
  } else if (!isCustomer && displayRole && isSellerMode) {
    actualRole = displayRole;
  }

  let navItems: NavItem[] = [];
  if (actualRole === "customer") {
    navItems = [
      { id: "home", label: "Dashboard", icon: "📊", category: "Dashboard & Reports" },
      { id: "orders", label: "My Orders", icon: "📦", category: "Orders & Logistics" },
      { id: "wishlist", label: "Wishlist", icon: "❤️", category: "Catalog & Inventory" },
      { id: "profile", label: "Profile Settings", icon: "👤", category: "User Management" },
      { id: "address", label: "Address Book", icon: "📍", category: "User Management" },
      { id: "wallet", label: "Wallet & Rewards", icon: "💎", category: "Finance & Accounting" },
      { id: "messages", label: "Messages", icon: "💬", category: "Support & Verification" },
      { id: "support", label: "Support Tickets", icon: "📞", category: "Support & Verification" },
      { id: "security", label: "Security & Login", icon: "🔐", category: "Platform & System" },
    ];
    if (activeTab === "seller_hub") {
      navItems.push({ id: "seller_hub", label: "Partner Application", icon: "🚀", category: "Marketing & Growth" });
    }
  } else if (actualRole === "super_admin") {
    navItems = [
      { id: "overview", label: "Overview", icon: "📊", category: "Dashboard & Reports" },
      { id: "products", label: "Products", icon: "🛍️", category: "Catalog & Inventory" },
      { id: "logistics", label: "Logistics", icon: "🚚", category: "Orders & Logistics" },
      { id: "kyc", label: "KYC (Users)", icon: "🛡️", category: "User Management" },
      { id: "finance", label: "Finance", icon: "💰", category: "Finance & Accounting" },
      { id: "help_guide", label: "Admin Staff Guide", icon: "📘", category: "Support & Verification" },
      { id: "google_import", label: "Google Importer", icon: "🌍", category: "Platform & System" },
    ];
    // Override default tab if needed
    if (activeTab === "home") setActiveTab("overview");
  } else if (actualRole === "weaver") {
    navItems = [
      { id: "home", label: "Dashboard Overview", icon: "📊", category: "Dashboard & Reports" },
      { id: "personal", label: "Personal Profile", icon: "👤", category: "1. Profile & Setup" },
      { id: "store_settings", label: "Setup Public Store", icon: "🏪", category: "1. Profile & Setup" },
      { id: "verification", label: "Verification (KYC)", icon: "🛡️", category: "1. Profile & Setup" },
      { id: "vanity_url", label: "Custom Brand URL", icon: "🔗", category: "1. Profile & Setup" },
      { id: "staff", label: "Staff Accounts", icon: "👥", category: "1. Profile & Setup" },
      { id: "pricing", label: "View Pricing Plans", icon: "💎", category: "1. Profile & Setup" },
      
      { id: "products", label: "Add your Sambalpuri Products", icon: "📦", category: "2. Your Catalog" },

      
      { id: "orders", label: "Manage Orders", icon: "🚚", category: "3. Orders & Deliveries" },
      
      { id: "wallet", label: "Wallet & Bank Payouts", icon: "💰", category: "4. Finance & Earnings" },
      
      { id: "marketing", label: "Marketing & Promos", icon: "📈", category: "5. Marketing & Comm" },
      { id: "messages", label: "Customer Messages", icon: "💬", category: "5. Marketing & Comm" },
      
      { id: "help_guide", label: "Help & Support Guide", icon: "📘", category: "6. Help & Support" },
      { id: "support", label: "Contact Admin Support", icon: "🎧", category: "6. Help & Support" },
      
      { id: "security", label: "Security & Login", icon: "🔐", category: "7. Security" },
    ];
  } else if (actualRole === "store" || actualRole === "wholesaler") {
    navItems = [
      { id: "home", label: "Dashboard Overview", icon: "📊", category: "Dashboard & Reports" },
      { id: "personal", label: "Personal Profile", icon: "👤", category: "1. Profile & Setup" },
      { id: "store_settings", label: "Setup Public Store", icon: "🏪", category: "1. Profile & Setup" },
      { id: "verification", label: "Verification (KYC)", icon: "🛡️", category: "1. Profile & Setup" },
      { id: "vanity_url", label: "Custom Brand URL", icon: "🔗", category: "1. Profile & Setup" },
      { id: "staff", label: "Staff Accounts", icon: "👥", category: "1. Profile & Setup" },
      { id: "pricing", label: "View Pricing Plans", icon: "💎", category: "1. Profile & Setup" },
      
      { id: "products", label: "Add your Sambalpuri Products", icon: "📦", category: "2. Your Catalog" },

      
      { id: "orders", label: "Manage Orders", icon: "🚚", category: "3. Orders & Deliveries" },
      
      { id: "finance", label: "Wallet & Bank Payouts", icon: "💰", category: "4. Finance & Earnings" },
      
      { id: "marketing", label: "Marketing & Promos", icon: "📈", category: "5. Marketing & Comm" },
      { id: "messages", label: "Customer Messages", icon: "💬", category: "5. Marketing & Comm" },
      
      { id: "help_guide", label: "Help & Support Guide", icon: "📘", category: "6. Help & Support" },
      { id: "support", label: "Contact Admin Support", icon: "🎧", category: "6. Help & Support" },
      
      { id: "security", label: "Security & Password", icon: "🔐", category: "7. Security" },
    ];
  } else if (actualRole === "weaver_staff" || actualRole === "store_staff") {
    navItems = [
      { id: "home", label: "Dashboard", icon: "📊", category: "Dashboard & Reports" },
      { id: "products", label: "Inventory Catalog", icon: "📦", category: "Catalog & Inventory" },
      { id: "orders", label: "Order Management", icon: "🚚", category: "Orders & Logistics" },
    ];
  } else if (actualRole === "reseller") {
    navItems = [
      { id: "home", label: "Dashboard Overview", icon: "📊", category: "Dashboard & Reports" },
      { id: "profile", label: "Personal Profile", icon: "👤", category: "1. Profile & Setup" },
      { id: "verification", label: "Verification (KYC)", icon: "🛡️", category: "1. Profile & Setup" },
      { id: "security", label: "Security & Login", icon: "🔐", category: "1. Profile & Setup" },
      { id: "curation", label: "Curate Products", icon: "🛍️", category: "2. Build Your Storefront" },
      { id: "links", label: "Share Marketing Links", icon: "🔗", category: "2. Build Your Storefront" },
      { id: "proxy", label: "Place Proxy Orders", icon: "🛒", category: "3. Sales & Orders" },
      { id: "analytics", label: "Sales Analytics", icon: "📈", category: "3. Sales & Orders" },
      { id: "wallet", label: "Wallet & Bank Payouts", icon: "💰", category: "4. Finance & Earnings" },
      { id: "help_guide", label: "Dashboard Guide & FAQ", icon: "📘", category: "5. Help & Support" },
      { id: "support", label: "Contact Admin Support", icon: "🎧", category: "5. Help & Support" },
    ];
  } else if (actualRole === "raw_material") {
    navItems = [
      { id: "personal", label: "Personal Profile", icon: "👤", category: "1. Profile & Setup" },
      { id: "store_settings", label: "Professional Store", icon: "🏪", category: "1. Profile & Setup" },
      { id: "verification", label: "Verification (KYC)", icon: "🛡️", category: "1. Profile & Setup" },
      { id: "security", label: "Security & Login", icon: "🔐", category: "1. Profile & Setup" },
      { id: "vanity_url", label: "Brand & URL Settings", icon: "🔗", category: "1. Profile & Setup" },
      { id: "inventory", label: "Inventory Catalog", icon: "📦", category: "2. Your Catalog" },
      { id: "orders", label: "Order Management", icon: "🚚", category: "3. Orders & Deliveries" },
      { id: "wallet", label: "Wallet & Payouts", icon: "💰", category: "4. Finance & Earnings" },
      { id: "marketing", label: "Marketing & Promos", icon: "📈", category: "5. Marketing & Comm" },
      { id: "help_guide", label: "Dashboard Guide & FAQ", icon: "📘", category: "6. Help & Support" },
      { id: "support", label: "Admin Support", icon: "🎧", category: "6. Help & Support" },
    ];
  }

  return (
    <DashboardLayout
      userName={userName}
      userRole={actualRole}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      storeSlug={storeSlug}
      isSellerMode={isSellerMode}
      onSellerModeToggle={() => {
        const newMode = !isSellerMode;
        setIsSellerMode(newMode);
        localStorage.setItem("sd_seller_mode", String(newMode));
        setActiveTab("home");
      }}
      showDualRoleToggle={!isCustomer && !isSuperAdmin && !!displayRole}
    >
      {globalNotifications.filter(n => !n.read).length > 0 && (
        <div className="mb-6 space-y-3">
          {globalNotifications.filter(n => !n.read).map(n => {
            const titleStr = typeof n.title === 'string' ? n.title : "";
            return (
            <div key={n.id} className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
              <div className="flex gap-3 items-start">
                <div className="text-2xl">{titleStr.includes('🎉') ? '🎉' : titleStr.includes('🏠') ? '🏠' : '🔔'}</div>
                <div>
                  <h4 className="font-bold text-green-900 text-sm">{titleStr || "New Notification"}</h4>
                  <p className="text-green-800 text-sm mt-1 leading-snug">{typeof n.message === 'string' ? n.message : ""}</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setGlobalNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                  try {
                    await updateDoc(doc(db, "notifications", n.id), { read: true });
                  } catch (e) {
                    console.error("Failed to mark read", e);
                  }
                }}
                className="text-green-600 hover:text-green-800 font-bold text-sm px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
              >
                Mark Read
              </button>
            </div>
          )})}
        </div>
      )}
      {isViewAsMode && (
        <div className="bg-blue-600 text-white p-3 rounded-xl mb-6 flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span className="font-bold text-sm">Super Admin View-As Mode:</span>
            <span className="text-sm font-medium">You are viewing {userName}'s Dashboard. Actions taken here may affect their account.</span>
          </div>
          <button 
            onClick={() => {
              // Legacy cleanup already happens on initialization, but we can ensure it's clean here too
              const params = new URLSearchParams(window.location.search);
              if (params.has("viewAs")) {
                params.delete("viewAs");
                router.replace("/dashboard");
              }
              window.location.reload();
            }}
            className="px-4 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            Exit View As
          </button>
        </div>
      )}

      {auth.currentUser && !auth.currentUser.emailVerified && !isViewAsMode && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm border border-yellow-200">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <span className="font-bold text-sm block">Unverified Email Address</span>
              <span className="text-xs font-medium">Please check your inbox to verify your email. Some features may be restricted until verified.</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              const { sendEmailVerification } = await import("firebase/auth");
              if (auth.currentUser) {
                try {
                  await sendEmailVerification(auth.currentUser);
                  alert("Verification email sent! Check your inbox.");
                } catch (err: any) {
                  alert(err.message);
                }
              }
            }}
            className="px-4 py-2 bg-yellow-100 text-yellow-900 text-xs font-bold rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Resend Link
          </button>
        </div>
      )}

      {activeTab === "seller_hub" ? (
        <SellerSetupHub userRole={actualRole} />
      ) : isSellerMode && (userStatus === "pending" || userStatus === "pending_approval" || userStatus === "on_hold") ? (
        <div className="p-4 md:p-8 mt-10 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-10 md:p-16 rounded-3xl border border-yellow-200/60 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
              <div className="w-32 h-32 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="text-7xl mb-6 animate-bounce relative z-10">⏳</div>
            <h2 className="text-3xl md:text-4xl font-black text-yellow-900 mb-4 tracking-tight relative z-10">Application Under Review</h2>
            <p className="text-yellow-800/80 font-medium text-lg max-w-2xl mx-auto leading-relaxed relative z-10">
              You have successfully submitted your application. Our Administration team is currently reviewing your documents and store details to ensure everything is perfect.
              <br/><br/>
              <span className="bg-yellow-200/50 px-3 py-1 rounded-lg text-yellow-900 text-sm font-bold tracking-wide uppercase">Next Steps</span>
              <br/>
              You will receive an email and WhatsApp notification the moment your account is approved and activated.
            </p>
            
            <button 
              onClick={async () => {
                if(confirm("Reset this application? You will need to apply again.")){
                  if(auth.currentUser) {
                    await updateDoc(doc(db, "users", auth.currentUser.uid), {
                      applicationStatus: deleteField(),
                      status: "active",
                      role: "customer"
                    });
                    window.location.reload();
                  }
                }
              }}
              className="mt-8 text-xs text-yellow-600/60 hover:text-yellow-800 underline transition-colors"
            >
              Reset Application (For Testing)
            </button>
          </div>
        </div>
      ) : (
        <>
          {actualRole === "customer" && <CustomerDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
          {actualRole === "weaver" && <WeaverDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
          {actualRole === "store" && <VendorDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
          {actualRole === "weaver_staff" && <SellerDashboard activeTab={activeTab} onTabChange={setActiveTab} roleTitle="Weaver Hub (Staff)" affiliateCommissionsPaid={affiliateCommissionsPaid} />}
        </>
      )}
      {actualRole === "store_staff" && <SellerDashboard activeTab={activeTab} onTabChange={setActiveTab} roleTitle="Store Hub (Staff)" affiliateCommissionsPaid={affiliateCommissionsPaid} />}
      {actualRole === "wholesaler" && <SellerDashboard activeTab={activeTab} onTabChange={setActiveTab} roleTitle="B2B Wholesaler Hub" affiliateCommissionsPaid={affiliateCommissionsPaid} />}
      {actualRole === "reseller" && <ResellerDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      {actualRole === "super_admin" && <SuperAdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      {actualRole === "raw_material" && <SupplierDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "marketing" && <MarketingTab />}
      {activeTab === "help_guide" && <HelpGuideTab userRole={actualRole} />}
    </DashboardLayout>
  );
}

// OnboardingFlow removed as per new Dual-Role architecture

/* ==========================================
   1. CUSTOMER DASHBOARD
   ========================================== */
function CustomerDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasSkippedPopup, setHasSkippedPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Profile fields
  const [personalName, setPersonalName] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [cityTownVillage, setCityTownVillage] = useState("");
  const [pincode, setPincode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      getDoc(doc(db, "users", auth.currentUser.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          if (!data.phone && !hasSkippedPopup) {
            setShowPopup(true);
          }
          setPersonalName(data.personalName || data.name || "");
          setPhone(data.phone || "");
          setWhatsapp(data.whatsapp || "");
          setCountry(data.country || "India");
          setState(data.address?.state || data.state || "Odisha");
          setDistrict(data.address?.district || data.district || "");
          setBlock(data.address?.block || data.block || "");
          setCityTownVillage(data.address?.cityTownVillage || data.townVillage || "");
          setPincode(data.address?.pincode || data.pin || "");
          setStreetAddress(typeof data.address === "string" ? data.address : (data.address?.streetAddress || ""));
        }
      });
      
      // Fetch notifications for customer dashboard history
      const q = query(collection(db, "notifications"), where("userId", "==", auth.currentUser.uid));
      getDocs(q).then(qs => {
        const notifs = qs.docs.map(d => ({ id: d.id, ...d.data() }));
        notifs.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setNotifications(notifs);
      }).catch(err => console.error("Failed to fetch customer notifications", err));
    }
  }, [hasSkippedPopup]);

  const handleSavePhonePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        phone,
        whatsapp
      });
      setShowPopup(false);
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      setUserData(snap.data());
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
    setIsSaving(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        personalName,
        phone,
        whatsapp,
        country,
        address: {
          state,
          district,
          block,
          cityTownVillage,
          pincode,
          streetAddress
        }
      });
      alert("Profile updated successfully!");
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      setUserData(snap.data());
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
    setIsSaving(false);
  };

  const isProfileIncomplete = userData && (!userData.phone || !userData.address || (!userData.address?.district && !userData.district));

  return (
    <div className="space-y-6 relative">
      {/* POPUP OVERLAY */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Bhulia!</h2>
            <p className="text-sm text-gray-500 mb-6">Please provide your contact details to ensure smooth order deliveries and communication.</p>
            <form onSubmit={handleSavePhonePopup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Phone Number *</label>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:border-[#0070F3] outline-none" placeholder="+91" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">WhatsApp Number</label>
                <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:border-[#0070F3] outline-none" placeholder="+91" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowPopup(false); setHasSkippedPopup(true); }} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">Skip for now</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 bg-[#0074E4] text-white rounded-xl font-bold hover:bg-blue-600">{isSaving ? "Saving..." : "Save Details"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Customer Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your authentic handloom collection seamlessly.</p>
        </div>
      </header>

      {activeTab === "home" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {isProfileIncomplete && !showPopup && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-yellow-900">Complete Your Profile</h3>
                <p className="text-sm text-yellow-800 mt-1">Your shipping address and contact info are missing. You must complete this to place orders.</p>
              </div>
              <button onClick={() => onTabChange("profile")} className="shrink-0 px-6 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-sm">
                Complete Now →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#0070F3]/30 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="text-sm text-gray-500">No recent orders found.</div>
              </div>
              <button onClick={() => onTabChange("orders")} className="mt-6 text-sm text-[#0070F3] font-bold text-left w-max group-hover:underline">View All Orders →</button>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#0070F3]/30 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Wishlist Preview</h3>
                <div className="text-sm text-gray-500">Your wishlist is empty.</div>
              </div>
              <button onClick={() => onTabChange("wishlist")} className="mt-6 text-sm text-[#0070F3] font-bold text-left w-max group-hover:underline">View Wishlist →</button>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                  Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {notifications.filter(n => !n.read).length} New
                    </span>
                  )}
                </h3>
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                  {notifications.length === 0 ? (
                    <div className="text-sm text-gray-500">No new notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50/50 border-blue-100'} transition-colors`}>
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>}
                          {typeof n.title === 'string' ? n.title : "New Notification"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{typeof n.message === 'string' ? n.message : ""}</div>
                        {n.createdAt && <div className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt.toMillis?.() || Date.now()).toLocaleDateString()}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in">
          <div className="flex flex-wrap gap-2 mb-6">
            {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
              <button key={f} className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-[#0070F3] border border-gray-200 transition-colors">{f}</button>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between hover:border-gray-200 transition-colors">
            <div>
              <p className="text-sm font-bold text-gray-900">Order #ORD-99382</p>
              <p className="text-xs text-gray-500 mt-1">Status: Dispatched via Bhulia Hub</p>
            </div>
            <button className="px-5 py-2.5 bg-[#0070F3] text-white text-xs font-bold rounded-xl hover:bg-[#005BB5] transition-colors shadow-sm">Track Order (Bhulia Logistics)</button>
          </div>
          <div className="text-center py-10 text-gray-400 text-sm font-medium">End of order history.</div>
        </div>
      )}

      {activeTab === "wishlist" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Saved Items</h2>
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">Your wishlist is currently empty.</div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Direct Messages</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 md:border-r border-gray-100 md:pr-6">
              <div className="p-5 bg-gray-50 rounded-2xl text-sm text-gray-500 font-medium text-center border border-gray-100">No active conversations</div>
            </div>
            <div className="w-full md:w-2/3 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[300px]">
              Select a chat to start messaging
            </div>
          </div>
        </div>
      )}

      {activeTab === "support" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900">Contact Support & Shops</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">Your privacy is protected. Contact sellers directly via masked hub routing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 py-4 bg-green-50 text-green-700 rounded-2xl font-bold hover:bg-green-100 transition-colors shadow-sm">
              <span>WhatsApp Shop (Masked)</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition-colors shadow-sm">
              <span>Call Shop (Masked)</span>
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-5">Raise a Ticket</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Subject" className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
              <textarea rows={4} placeholder="Describe your issue..." className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all"></textarea>
              <button type="button" className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">Submit Ticket</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "address" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Address Book</h2>
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">No saved addresses found.</div>
          <button className="w-full bg-[#1f2937] text-white py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">+ Add New Address</button>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Wallet & Rewards</h2>
          <div className="bg-gradient-to-r from-blue-600 to-[#0070F3] rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
            <h3 className="text-4xl font-black">₹0.00</h3>
          </div>
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">No transaction history.</div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Full Name *</label>
                <input type="text" required value={personalName} onChange={e => setPersonalName(e.target.value)} className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" value={auth.currentUser?.email || ""} disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Phone Number *</label>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">WhatsApp Number</label>
                <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Location & Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Country</label>
                  <input type="text" required value={country} onChange={e => setCountry(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none" placeholder="India" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">State / Province *</label>
                  {country.toLowerCase() === "india" || country === "" ? (
                    <select required value={state} onChange={e => setState(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input type="text" required value={state} onChange={e => setState(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">District *</label>
                  {state === "Odisha" ? (
                    <select required value={district} onChange={e => setDistrict(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none">
                      <option value="">Select District</option>
                      {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" required value={district} onChange={e => setDistrict(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Block / Tehsil</label>
                  {state === "Odisha" && district && ODISHA_DISTRICT_BLOCKS[district as keyof typeof ODISHA_DISTRICT_BLOCKS] ? (
                    <select value={block} onChange={e => setBlock(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none">
                      <option value="">Select Block</option>
                      {ODISHA_DISTRICT_BLOCKS[district as keyof typeof ODISHA_DISTRICT_BLOCKS].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={block} onChange={e => setBlock(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Town/Village</label>
                  <input type="text" value={cityTownVillage} onChange={e => setCityTownVillage(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">PIN Code *</label>
                  <input type="text" required value={pincode} onChange={e => setPincode(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#0070F3] outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Complete Address (House No, Street, Landmark) *</label>
                <textarea required value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" rows={3} placeholder="Enter your full address including house/flat number, street name, and any landmarks..."></textarea>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm mt-4">
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      )}
      {activeTab === "seller_hub" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Become a Seller or Reseller</h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Join the Bhulia ecosystem to start selling or earning commissions.</p>
          <SellerSetupHub userRole={userData?.role || "customer"} />
        </div>
      )}
    </div>
  );
}


/* ==========================================
   2. WEAVER DASHBOARD (DARK/GOLD THEME)
   ========================================== */
/* ==========================================
   2. WEAVER DASHBOARD
   ========================================== */
function SellerDashboard({ activeTab, onTabChange, roleTitle, affiliateCommissionsPaid = 0 }: { activeTab: string, onTabChange: (id: string) => void, roleTitle: string, affiliateCommissionsPaid?: number }) {
  // Common hooks
  const { products } = useProducts();
  const { orders } = useOrders();
  const { transactions } = useTransactions();
  const sellerTransactions = transactions.filter(t => t.sellerId === auth.currentUser?.uid);
  const availableBalance = sellerTransactions.filter(t => t.status === "completed" || t.status === "paid_out").reduce((sum, t) => sum + t.amount, 0);
  
  // Products and Orders
  const sellerProductsRaw = products.filter(p => p.sellerId === auth.currentUser?.uid);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Staff Accounts State
  const [staffMembers, setStaffMembers] = useState<string[]>([]);
  const [staffEmailInput, setStaffEmailInput] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<string>("approved");
  const isStaff = roleTitle.includes("Staff");
  


  const sellerProducts = sellerProductsRaw.filter(p => {
    const matchesSearch = String(p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (p as any).status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const sellerOrders = orders.filter(o => o.sellerId === auth.currentUser?.uid && o.logisticsStatus !== "Delivered");

  // Personal Profile State
  const [personalName, setPersonalName] = useState("");
  const [personalCountry, setPersonalCountry] = useState("India");
  const [customPersonalCountry, setCustomPersonalCountry] = useState("");
  const [personalState, setPersonalState] = useState("Odisha");
  const [personalDistrict, setPersonalDistrict] = useState("");
  const [personalBlock, setPersonalBlock] = useState("");
  const [personalTownVillage, setPersonalTownVillage] = useState("");
  const [personalPin, setPersonalPin] = useState("");
  const [personalAddress, setPersonalAddress] = useState("");
  const [personalDob, setPersonalDob] = useState("");
  const [personalExperience, setPersonalExperience] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpi, setBankUpi] = useState("");

  // Professional Store State
  const [storeName, setStoreName] = useState("");
  const [publicDesc, setPublicDesc] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("India");
  const [customCountry, setCustomCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [cityTownVillage, setCityTownVillage] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [kycType, setKycType] = useState("");
  const [kycId, setKycId] = useState("");
  const [kycDocumentUrl, setKycDocumentUrl] = useState("");
  
  // New Weaver Fields
  const [weaverExperience, setWeaverExperience] = useState("");
  const [generations, setGenerations] = useState("");
  const [specialties, setSpecialties] = useState(""); // Comma separated for now
  const [materials, setMaterials] = useState(""); // Comma separated for now
  const [scale, setScale] = useState("");
  const [googlePin, setGooglePin] = useState("");
  const [gallery1, setGallery1] = useState("");
  const [gallery2, setGallery2] = useState("");
  const [gallery3, setGallery3] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [currentProfileStep, setCurrentProfileStep] = useState(1);
  const [storeStatus, setStoreStatus] = useState("");
  const [canSellWholesale, setCanSellWholesale] = useState(false);
  const [isUpgraderOpen, setIsUpgraderOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      getDoc(doc(db, "users", auth.currentUser.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setApplicationStatus(data.applicationStatus || "approved");
          // Staff Members
          setStaffMembers(data.staffMembers || []);
          // Personal
          setPersonalName(data.personalName || data.name || "");
          if (data.personalCountry && data.personalCountry !== "India" && data.personalCountry !== "International") {
            setPersonalCountry("International");
            setCustomPersonalCountry(data.personalCountry);
          } else {
            setPersonalCountry(data.personalCountry || "India");
            setCustomPersonalCountry("");
          }
          setPersonalState(data.personalState || "Odisha");
          setPersonalDistrict(data.personalDistrict || "");
          setPersonalBlock(data.personalBlock || "");
          setPersonalTownVillage(data.personalTownVillage || "");
          setPersonalPin(data.personalPin || "");
          setPersonalAddress(data.personalAddress || "");
          setPersonalDob(data.personalDob || "");
          setPersonalExperience(data.personalExperience || "");
          setBankHolder(data.bankHolder || "");
          setBankName(data.bankName || "");
          setBankAccount(data.bankAccount || "");
          setBankIfsc(data.bankIfsc || "");
          setBankUpi(data.bankUpi || "");
          setKycType(data.kycType || "");
          setKycId(data.kycId || "");
          setKycDocumentUrl(data.kycDocumentUrl || "");

          // Professional
          setStoreName(data.storeName || data.name || "");
          setPublicDesc(data.publicDesc || "");
          setStoreLogo(data.storeLogo || "");
          setPhone(data.phone || "");
          setWhatsapp(data.whatsapp || "");
          if (data.country && data.country !== "India" && data.country !== "International") {
            setCountry("International");
            setCustomCountry(data.country);
          } else {
            setCountry(data.country || "India");
            setCustomCountry("");
          }
          setStreetAddress(typeof data.address === "string" ? data.address : (data.address?.streetAddress || ""));
          setDistrict(data.address?.district || data.district || "");
          setBlock(data.address?.block || data.block || "");
          setCityTownVillage(data.address?.cityTownVillage || data.townVillage || "");
          setState(data.address?.state || data.state || "");
          setPincode(data.address?.pincode || data.pin || "");
        }
      });
      
      const targetCollection = roleTitle === "Weaver Hub" ? "weavers" : "stores";
      getDoc(doc(db, targetCollection, auth.currentUser.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setStoreStatus(data.status || "");
          setCanSellWholesale(data.canSellWholesale || false);
          if (roleTitle === "Weaver Hub") {
            setWeaverExperience(data.weaverExperience || "");
            setGenerations(data.generations || "");
            setSpecialties((data.specialties || []).join(", "));
            setMaterials((data.materials || []).join(", "));
            setScale(data.scale || "");
            setGooglePin(data.googlePin || "");
            setGallery1(data.gallery?.[0] || "");
            setGallery2(data.gallery?.[1] || "");
            setGallery3(data.gallery?.[2] || "");
            setGooglePlaceId(data.googlePlaceId || "");
            setFacebookUrl(data.facebookUrl || "");
            setInstagramUrl(data.instagramUrl || "");
          }
        }
      });
    }
  }, [roleTitle]);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      let finalKycUrl = kycDocumentUrl;
      if (kycDocumentUrl && kycDocumentUrl.startsWith("data:image")) {
        finalKycUrl = await uploadBase64ToStorage(kycDocumentUrl, `kyc/${auth.currentUser.uid}`);
        setKycDocumentUrl(finalKycUrl);
      }

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        personalName,
        personalCountry: personalCountry === "International" && customPersonalCountry ? customPersonalCountry : personalCountry,
        personalState,
        personalDistrict,
        personalBlock,
        personalTownVillage,
        personalPin,
        personalAddress,
        personalDob,
        personalExperience,
        bankHolder,
        bankName,
        bankAccount,
        bankIfsc,
        bankUpi,
        kycType,
        kycId,
        kycDocumentUrl: finalKycUrl,
        kycPrivacy: "confidential"
      });
      alert("Personal Profile saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save personal profile.");
    }
    setIsSaving(false);
  };

  const handleSaveStore = async (e?: React.FormEvent, isAutoSave = false) => {
    if (e) e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      // 1. Update general user profile
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        storeName,
        publicDesc,
        storeLogo,
        phone,
        whatsapp,
        country: country === "International" && customCountry ? customCountry : country,
        address: {
          state,
          district,
          block,
          cityTownVillage,
          streetAddress,
          pincode
        }
      });

      // 2. Generate clean slug from store name
      const slug = String(storeName || "").toLowerCase().replace(/[^a-z0-9]+/g, '-') || auth.currentUser.uid;
      
      // 3. Update public storefront data in the correct collection
      const targetCollection = roleTitle === "Weaver Hub" ? "weavers" : "stores";
      const { setDoc } = await import("firebase/firestore");
      
      await setDoc(doc(db, targetCollection, auth.currentUser.uid), {
        id: auth.currentUser.uid,
        slug,
        title: storeName,
        desc: publicDesc,
        img: storeLogo,
        phone,
        whatsapp,
        country: country === "International" && customCountry ? customCountry : country,
        state,
        district,
        block,
        cityTownVillage,
        address: {
          state,
          district,
          block,
          cityTownVillage,
          streetAddress,
          pincode
        },
        tier: "Silver", // Default
        status: storeStatus || "pending",
        ...(roleTitle === "Weaver Hub" && {
          weaverExperience,
          generations,
          specialties: specialties.split(",").map(s => s.trim()).filter(Boolean),
          materials: materials.split(",").map(m => m.trim()).filter(Boolean),
          scale,
          googlePin,
          gallery: [gallery1, gallery2, gallery3].filter(Boolean),
          googlePlaceId,
          facebookUrl,
          instagramUrl
        })
      }, { merge: true });

      if (!isAutoSave) alert("Professional Store updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save store details.");
    }
    setIsSaving(false);
  };

  // Upload Form State
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [commercialPrice, setCommercialPrice] = useState("");
  const [availableForRetail, setAvailableForRetail] = useState(true);
  const [availableForWholesale, setAvailableForWholesale] = useState(false);
  const [wholesaleTerms, setWholesaleTerms] = useState("");
  const [productCategory, setProductCategory] = useState("Saree");
  const [productDesc, setProductDesc] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [allowResellerMargin, setAllowResellerMargin] = useState(false);
  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);
  const [specialOfferTag, setSpecialOfferTag] = useState("");
  const [productImage, setProductImage] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  
  const [imgCaption, setImgCaption] = useState("");
  const [img2Caption, setImg2Caption] = useState("");
  const [img3Caption, setImg3Caption] = useState("");
  const [img4Caption, setImg4Caption] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [productMrp, setProductMrp] = useState("");
  const [productLongDesc, setProductLongDesc] = useState("");
  const [originalWeaver, setOriginalWeaver] = useState("");
  const [sareeType, setSareeType] = useState("");
  const [material, setMaterial] = useState("");
  const [design, setDesign] = useState("");
  const [colorUse, setColorUse] = useState("");
  const [length, setLength] = useState("");
  const [hasBlouse, setHasBlouse] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const saveDraft = () => {
    const draft = { productName, productPrice, commercialPrice, availableForRetail, availableForWholesale, wholesaleTerms, productCategory, productDesc, stockQuantity, allowResellerMargin, resellerMarginPercentage, isSpecialOffer, specialOfferTag, productImage, img2, img3, img4, youtubeUrl, productMrp, productLongDesc, originalWeaver, sareeType, material, design, colorUse, length, hasBlouse };
    localStorage.setItem("sd_product_draft", JSON.stringify(draft));
    alert("Draft saved to browser!");
  };

  const handleAddNewClick = () => {
    setEditingProductId(null);
    setIsAddInventoryOpen(true);
    setUploadStep(1);
    setShowAdvanced(false);
    setProductName(""); setProductPrice(""); setProductMrp(""); setProductDesc(""); setProductLongDesc("");
    setProductImage(""); setImg2(""); setImg3(""); setImg4("");
    setYoutubeUrl("");
    setAvailableForRetail(true); setAvailableForWholesale(false); setCommercialPrice(""); setWholesaleTerms("");
    setOriginalWeaver(storeName || ""); // Auto-fill
    
    // Load from localStorage if draft exists
    try {
      const draft = localStorage.getItem("sd_product_draft");
      if (draft && confirm("You have an unsaved product draft. Would you like to restore it?")) {
        const p = JSON.parse(draft);
        if(p.productName) setProductName(p.productName);
        if(p.productPrice) setProductPrice(p.productPrice);
        if(p.productMrp) setProductMrp(p.productMrp);
        if(p.productDesc) setProductDesc(p.productDesc);
        if(p.productLongDesc) setProductLongDesc(p.productLongDesc);
        if(p.productCategory) setProductCategory(p.productCategory);
        if(p.originalWeaver) setOriginalWeaver(p.originalWeaver);
        if(p.material) setMaterial(p.material);
        if(p.design) setDesign(p.design);
        if(p.colorUse) setColorUse(p.colorUse);
        if(p.length) setLength(p.length);
        if(p.hasBlouse !== undefined) setHasBlouse(p.hasBlouse);
        if(p.stockQuantity) setStockQuantity(p.stockQuantity);
        if(p.productImage) setProductImage(p.productImage);
        if(p.img2) setImg2(p.img2);
        if(p.img3) setImg3(p.img3);
        if(p.img4) setImg4(p.img4);
        if(p.youtubeUrl) setYoutubeUrl(p.youtubeUrl);
        if(p.commercialPrice) setCommercialPrice(p.commercialPrice);
        if(p.wholesaleTerms) setWholesaleTerms(p.wholesaleTerms);
        if(p.availableForRetail !== undefined) setAvailableForRetail(p.availableForRetail);
        if(p.availableForWholesale !== undefined) setAvailableForWholesale(p.availableForWholesale);
        if(p.allowResellerMargin !== undefined) setAllowResellerMargin(p.allowResellerMargin);
        if(p.resellerMarginPercentage) setResellerMarginPercentage(p.resellerMarginPercentage);
        if(p.isSpecialOffer !== undefined) setIsSpecialOffer(p.isSpecialOffer);
        if(p.specialOfferTag) setSpecialOfferTag(p.specialOfferTag);
      }
    } catch (e) {}
  };

  const handleEditClick = (p: any) => {
    setEditingProductId(p.id);
    setProductName(p.title || "");
    setProductPrice(p.price?.toString() || "");
    setProductMrp(p.mrp?.toString() || "");
    setProductDesc(p.desc || "");
    setProductLongDesc(p.longDesc || "");
    setAvailableForRetail(p.availableForRetail !== false);
    setAvailableForWholesale(p.availableForWholesale || false);
    setCommercialPrice(p.commercialPrice?.toString() || "");
    setWholesaleTerms(p.wholesaleTerms || "");
    setProductImage(p.img || "");
    setImg2(p.img2 || "");
    setImg3(p.img3 || "");
    setImg4(p.img4 || "");
    setYoutubeUrl(p.youtubeUrl || "");
    setUploadStep(1);
    setShowAdvanced(false);
    setIsAddInventoryOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsUploading(true);
    try {
      let isAutoApprovedUser = false;
      let targetCollection = roleTitle.includes("Weaver") ? "weavers" : "stores";
      
      const uploaderUid = isStaff ? (localStorage.getItem("sd_boss_uid") || auth.currentUser.uid) : auth.currentUser.uid;

      const sellerDoc = await getDoc(doc(db, targetCollection, uploaderUid));
      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data();
        isAutoApprovedUser = sellerData.isAutoApproved || false;
        
        if (!editingProductId) {
          const maxAllowed = sellerData.subscription?.uploadLimit || sellerData.productLimit || 10;
          const currentCount = sellerProductsRaw.length;
          if (currentCount >= maxAllowed) {
            alert(`Credit not allowed. You have reached your product upload limit (${maxAllowed}). Please contact admin to increase your limit.`);
            setIsUploading(false);
            return;
          }
        }
      }

      const parsedPrice = Number(productPrice.toString().replace(/[^0-9.]/g, '')) || 0;
      const parsedMrp = Number(productMrp.toString().replace(/[^0-9.]/g, '')) || 0;
      const parsedCommercialPrice = Number(commercialPrice.toString().replace(/[^0-9.]/g, '')) || 0;

      // Generate GI-Tracking Product ID
      const generateProductId = () => `BHL-${Math.floor(10000 + Math.random() * 90000)}`;
      const bhuliaProductId = editingProductId ? undefined : generateProductId();

      // Upload Images
      const img1Url = await uploadBase64ToStorage(productImage, `products/${auth.currentUser.uid}`);
      const img2Url = await uploadBase64ToStorage(img2, `products/${auth.currentUser.uid}`);
      const img3Url = await uploadBase64ToStorage(img3, `products/${auth.currentUser.uid}`);
      const img4Url = await uploadBase64ToStorage(img4, `products/${auth.currentUser.uid}`);

      const finalImages = [img1Url, img2Url, img3Url, img4Url].filter(Boolean);

      const productData: any = {
        title: productName,
        slug: String(productName).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        price: parsedPrice,
        mrp: parsedMrp,
        availableForRetail,
        availableForWholesale,
        commercialPrice: parsedCommercialPrice,
        wholesaleTerms,
        category: productCategory,
        desc: productDesc,
        longDesc: productLongDesc || productDesc,
        sareeType: material || sareeType, // Fallback for backwards compat
        material: material,
        design: design,
        colorUse: colorUse,
        length: length,
        hasBlouse: hasBlouse,
        weaverName: originalWeaver,
        img: img1Url || "https://images.unsplash.com/photo-1605814526362-790100f91eb8?w=800&q=80",
        img2: img2Url,
        img3: img3Url,
        img4: img4Url,
        images: finalImages,
        imageCaptions: [imgCaption, img2Caption, img3Caption, img4Caption],
        youtubeUrl: youtubeUrl || undefined,
        stockQuantity: Number(stockQuantity),
        inStock: Number(stockQuantity) > 0,
        allowResellerMargin,
        resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,
        resellerPrice: allowResellerMargin ? String(Math.floor(parsedPrice * (1 - Number(resellerMarginPercentage) / 100))) : undefined,
        isSpecialOffer,
        specialOfferTag: isSpecialOffer ? specialOfferTag : undefined,
      };

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), {
          ...productData,
          status: isAutoApprovedUser ? "approved" : "pending_approval", // Resubmit for QC on edit
          updatedAt: serverTimestamp(),
        });
        alert(isAutoApprovedUser ? "Inventory updated and went live instantly (VIP)!" : "Inventory updated successfully and submitted for QC!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          bhuliaProductId,
          isBhuliaVerified: true,
          escrowStatus: "Payment Protected",
          sellerId: uploaderUid,
          uploadedBy: isStaff ? auth.currentUser.uid : null,
          sellerType: roleTitle.includes("Store") ? "store" : "weaver",
          status: isAutoApprovedUser ? "approved" : "pending_approval",
          createdAt: serverTimestamp(),
        });
        alert(isAutoApprovedUser ? "Inventory batch saved and went live instantly (VIP)!" : "Inventory batch saved to Firestore and submitted for QC!");
      }
      
      setIsAddInventoryOpen(false);
      setEditingProductId(null);
      localStorage.removeItem("sd_product_draft"); // Clear draft on success
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
    setIsUploading(false);
  };

  if (applicationStatus === "pending_approval") {
    return (
      <div className="bg-yellow-50 p-12 rounded-3xl text-center border border-yellow-200 mt-10 animate-in fade-in">
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-3xl font-black text-yellow-900 mb-4">Account Under Review</h2>
        <p className="text-yellow-800 text-lg font-medium max-w-2xl mx-auto">
          You have successfully joined as a {roleTitle.replace(' Hub', '')}. 
          Your dashboard features will be unlocked as soon as an Admin approves your profile.
        </p>
      </div>
    );
  }

  // Security Sandbox: Staff cannot access sensitive tabs even if forced via state
  if (isStaff && !["home", "products"].includes(activeTab)) {
    return (
      <div className="bg-red-50 p-8 rounded-3xl text-center border border-red-200 mt-10 animate-in fade-in">
        <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied (Staff Account)</h2>
        <p className="text-red-700 font-medium">Your account permissions are restricted to "My Catalog" only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <SaaSUpgraderModal isOpen={isUpgraderOpen} onClose={() => setIsUpgraderOpen(false)} />
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{roleTitle}</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your inventory and dispatch operations.</p>
        </div>
      </header>

      {activeTab === "home" && (
        <div className="space-y-6 animate-in fade-in">
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
              View Pricing Plans
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Inventory</h3>
            <div className="text-3xl font-black text-gray-900">{sellerProducts.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</h3>
            <div className="text-3xl font-black text-green-600">₹{availableBalance.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-50 text-purple-200">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Affiliate Comm. Paid</h3>
            <div className="text-3xl font-black text-purple-600 relative z-10">₹{affiliateCommissionsPaid.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Orders</h3>
            <div className="text-3xl font-black text-gray-900">{sellerOrders.length}</div>
          </div>
        </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <PricingTab isPublicPage={false} userRole={roleTitle.toLowerCase().includes('store') || roleTitle.toLowerCase().includes('shop') ? 'shop' : 'weaver'} />
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-5xl animate-in fade-in">
          {!isAddInventoryOpen ? (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Products Catalog</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage and track your inventory.</p>
                </div>
                <button onClick={handleAddNewClick} className="bg-[#1f2937] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors shadow-sm w-full md:w-auto">
                  + Add Inventory
                </button>
              </div>

              {sellerProductsRaw.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search products by name..." 
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="py-2 px-4 rounded-xl border border-gray-200 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none text-sm bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Live (Approved)</option>
                    <option value="pending_approval">Pending QC</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {sellerProductsRaw.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <div className="text-4xl mb-4">🛍️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't added any products to your catalog. Add your first item to start selling.</p>
                  <button onClick={handleAddNewClick} className="bg-[#0070F3] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#005BB5] transition-colors shadow-sm">
                    Upload First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-4 font-bold">Product</th>
                        <th className="pb-4 font-bold">Price</th>
                        <th className="pb-4 font-bold">Category</th>
                        <th className="pb-4 font-bold">Status</th>
                        <th className="pb-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sellerProducts.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                <img 
                                  src={product.img || "/bhulia-hero.png"} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/bhulia-hero.png";
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{product.title}</div>
                                {product.weaverName && (
                                  <div className="text-xs text-gray-500">Weaver: {product.weaverName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-gray-900">₹{Number(product.price).toLocaleString()}</td>
                          <td className="py-4 font-medium text-gray-500">{product.category || "Uncategorized"}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              (product as any).status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                              (product as any).status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}>
                              {String((product as any).status || 'pending').replace('_approval', '').charAt(0).toUpperCase() + String((product as any).status || 'pending').replace('_approval', '').slice(1)}
                            </span>
                            {(product as any).status === "rejected" && (product as any).rejectionReason && (
                              <div className="mt-1 text-[10px] text-red-600 font-medium bg-red-50 p-1 rounded">
                                Reason: {(product as any).rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <a href={"/product/" + product.slug} target="_blank" className="inline-block bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors mr-2">
                              View Live ↗
                            </a>
                            <button onClick={() => handleEditClick(product)} className="inline-block bg-blue-50 text-[#0070F3] border border-blue-100 hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setIsAddInventoryOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  ← Back to Catalog
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{editingProductId ? "Edit Inventory" : "Upload New Inventory"}</h2>
              </div>
              
              
<div className="mb-8 bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-200">
  <div className="flex gap-2 w-full justify-between items-center">
    <div className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors ${uploadStep === 1 ? 'bg-white shadow-sm text-[#0070F3]' : 'text-gray-400'}`}>1. Basic Info</div>
    <div className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors ${uploadStep === 2 ? 'bg-white shadow-sm text-[#0070F3]' : 'text-gray-400'}`}>2. Specifications</div>
    <div className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors ${uploadStep === 3 ? 'bg-white shadow-sm text-[#0070F3]' : 'text-gray-400'}`}>3. Media & Options</div>
  </div>
</div>
<form className="space-y-6" onSubmit={handleUpload}>

  {uploadStep === 1 && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in">
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Name</label>
        <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Category</label>
        <input list="categoryList" value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type category..." required />
        <datalist id="categoryList">
          <option value="Saree" />
          <option value="Dress material" />
          <option value="Bedsheet" />
          <option value="RedyMade shirts" />
          <option value="Redy made Kurti" />
          <option value="Kurti dress material" />
        </datalist>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Original Weaver Name</label>
        <input type="text" value={originalWeaver} onChange={e => setOriginalWeaver(e.target.value)} placeholder="e.g. Sambalpuri Cooperative" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Retail Selling Price (₹)</label>
        <input type="text" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required placeholder="e.g. 34500" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Retail MRP (₹)</label>
        <input type="text" value={productMrp} onChange={e => setProductMrp(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required placeholder="e.g. 42000" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Short Description</label>
        <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required rows={2} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Long Artisan Story Description</label>
        <textarea value={productLongDesc} onChange={e => setProductLongDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required rows={4} />
      </div>
    </div>
  )}

  {uploadStep === 2 && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in">
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Material</label>
        <input list="materialList" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type material..." required />
        <datalist id="materialList">
          <option value="Pure Cotton" />
          <option value="Pure Silk (Pata)" />
          <option value="Mix Silk(Pata) (Silk+Polyster)" />
          <option value="Mix Cotton (Cotton+Polyster)" />
        </datalist>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Design</label>
        <input list="designList" value={design} onChange={e => setDesign(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type design..." required />
        <datalist id="designList">
          <option value="Sambalpuri Ikat (Bandha)" />
          <option value="Sambalpuri Traditional Ikat Design" />
          <option value="Sambalpuri Modern Ikat Design" />
          <option value="Sambalpuri Double Ikat (Pashapali/Saptapar)" />
          <option value="Bomkei" />
          <option value="Bomkei+Ikat" />
        </datalist>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Color Palette</label>
        <input type="text" value={colorUse} onChange={e => setColorUse(e.target.value)} placeholder="e.g. Royal Blue & Gold" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Length</label>
        <input type="text" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 6.2 Meters" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Blouse Status</label>
        <select value={hasBlouse ? "true" : "false"} onChange={e => setHasBlouse(e.target.value === "true")} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all">
          <option value="true">With Blouse Piece</option>
          <option value="false">Without Blouse Piece</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Total Stock Quantity</label>
        <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
    </div>
  )}

  {uploadStep === 3 && (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Product Images & Video</h3>
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#FF0000] uppercase tracking-wider mb-2">YouTube Demo Video (Optional)</label>
          <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="e.g. https://youtube.com/shorts/..." className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#FF0000] outline-none transition-all" />
          <p className="text-[10px] text-gray-500 mt-1">Paste a YouTube Shorts link to embed a vertical product demo.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ImageUploader label="Main Photo" value={productImage} onChange={setProductImage} aspectRatio="portrait" captionValue={imgCaption} onCaptionChange={setImgCaption} />
          <ImageUploader label="Photo 2" value={img2} onChange={setImg2} aspectRatio="portrait" captionValue={img2Caption} onCaptionChange={setImg2Caption} />
          <ImageUploader label="Photo 3" value={img3} onChange={setImg3} aspectRatio="portrait" captionValue={img3Caption} onCaptionChange={setImg3Caption} />
          <ImageUploader label="Photo 4" value={img4} onChange={setImg4} aspectRatio="portrait" captionValue={img4Caption} onCaptionChange={setImg4Caption} />
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <span className="font-bold text-gray-900 text-sm">⚙️ Advanced Selling Options (B2B & Resellers)</span>
          <span className="text-gray-500">{showAdvanced ? "▲" : "▼"}</span>
        </button>
        
        {showAdvanced && (
          <div className="p-6 space-y-6 animate-in slide-in-from-top-2">

            
            {availableForRetail && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-6">
                <label className="flex items-start space-x-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="form-checkbox text-[#0070F3] rounded w-5 h-5 mt-0.5 focus:ring-[#0070F3]" />
                  <div>
                    <span className="text-sm text-blue-900 font-bold block">Allow Resellers to promote this product?</span>
                    <span className="text-xs text-blue-700">Agents will market your item for a commission.</span>
                  </div>
                </label>
                {allowResellerMargin && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Reseller Discount Percentage (Min 5%)</label>
                    <input type="number" min="5" max="90" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Math.max(5, Number(e.target.value)))} className="w-full bg-white border border-blue-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                    <div className="text-xs text-blue-800 font-bold mt-2">
                      Resellers will sell this at a ₹{Math.floor(Number(productPrice || 0) * (Number(resellerMarginPercentage) / 100))} discount from your MRP.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <label className="flex items-start space-x-3 cursor-pointer mb-3">
                <input type="checkbox" checked={isSpecialOffer} onChange={e => setIsSpecialOffer(e.target.checked)} className="form-checkbox text-yellow-600 rounded w-5 h-5 mt-0.5 focus:ring-yellow-600" />
                <div>
                  <span className="text-sm text-yellow-900 font-bold block">Mark as Special Limited-Time Offer?</span>
                  <span className="text-xs text-yellow-700">This will display a flashy badge and feature the product on the homepage.</span>
                </div>
              </label>
              {isSpecialOffer && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Offer Tag Text</label>
                  <input type="text" value={specialOfferTag} onChange={e => setSpecialOfferTag(e.target.value)} placeholder="e.g. 50% OFF! or Mega Discount" className="w-full bg-white border border-yellow-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-yellow-500 outline-none transition-all" required />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  <div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t border-gray-100 gap-4 mt-8">
    <div className="flex gap-4">
      <button type="button" onClick={saveDraft} className="w-full md:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-3 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
        Save Draft
      </button>
      {uploadStep > 1 && (
        <button type="button" onClick={() => { setUploadStep(uploadStep - 1); saveDraft(); }} className="w-full md:w-auto bg-gray-100 text-gray-700 px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
          Previous Step
        </button>
      )}
    </div>
    
    <div className="flex gap-4">
      {uploadStep < 3 ? (
        <button type="button" onClick={() => { setUploadStep(uploadStep + 1); saveDraft(); }} className="w-full md:w-auto bg-black text-white px-8 py-3 font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
          Next Step →
        </button>
      ) : (
        <button type="submit" disabled={isUploading} className="w-full md:w-auto bg-[#0070F3] text-white px-8 py-3 font-bold rounded-xl disabled:opacity-50 hover:bg-[#005BB5] transition-colors shadow-sm">
          {isUploading ? "Uploading to Database..." : "Submit Inventory for QC"}
        </button>
      )}
    </div>
  </div>

</form>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Management</h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Order ID</th>
                  <th className="py-4 px-4 font-bold">Product</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellerOrders.length > 0 ? sellerOrders.map(order => (
                  <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{order.orderId || order.id}</td>
                    <td className="py-4 px-4 text-gray-900 font-bold">
                      {order.productName || "Proxy Order"}
                      {order.referralId && (
                        <div className="mt-1">
                          <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest shadow-sm">
                            Reseller Cut
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                        {order.logisticsStatus || "Pending Sourcing"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {(!order.logisticsStatus || order.logisticsStatus === "Pending Sourcing") && (
                        <button 
                          onClick={async () => {
                            if (!confirm("Confirm dispatch? This will check Admin Routing rules and generate an AWB with the assigned partner.")) return;
                            try {
                              const res = await fetch("/api/shipping/create-order", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  orderDetails: {
                                    order_id: order.id,
                                    order_date: new Date().toISOString(),
                                    pickup_location: "Primary",
                                    billing_customer_name: order.customerInfo?.fullName || "Customer",
                                    billing_last_name: "",
                                    billing_address: order.customerInfo?.streetAddress || "Address",
                                    billing_address_2: order.customerInfo?.cityTownVillage || "",
                                    billing_city: order.customerInfo?.cityTownVillage || "City",
                                    billing_pincode: order.customerInfo?.pincode || "751001",
                                    billing_state: order.customerInfo?.state || "Odisha",
                                    billing_country: "India",
                                    billing_email: order.customerInfo?.email || "dummy@example.com",
                                    billing_phone: order.customerInfo?.phone || "0000000000",
                                    shipping_is_billing: true,
                                    order_items: order.items?.map((i: any) => ({
                                      name: i.name || "Item",
                                      sku: i.id || "SKU",
                                      units: i.cartQuantity || 1,
                                      selling_price: parseInt((i.price || "0").replace(/[^0-9]/g, "")),
                                    })) || [],
                                    payment_method: "Prepaid",
                                    sub_total: order.subTotal || 0,
                                    length: 10,
                                    breadth: 10,
                                    height: 10,
                                    weight: 0.5,
                                  }
                                })
                              });
                              
                              const data = await res.json();
                              if (!data.success) throw new Error(data.error);

                              await updateDoc(doc(db, "orders", order.id), {
                                logisticsStatus: "Dispatched via Shiprocket",
                                assignedLogisticsPartner: "Shiprocket",
                                trackingNumber: data.awbCode || "PENDING_AWB",
                                shipmentId: data.shipmentId,
                                awbGenerated: true
                              });
                              alert(`AWB Generated Successfully! Tracking ID: ${data.awbCode || "Pending"}`);
                            } catch (e: any) {
                              alert("Failed to generate AWB: " + e.message);
                            }
                          }}
                          className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 transition-colors rounded-lg text-xs font-bold border border-green-200"
                        >
                          Generate AWB
                        </button>
                      )}
                      {(order.logisticsStatus === "Dispatched via Shiprocket" || order.logisticsStatus === "Dispatched via Hub") && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.assignedLogisticsPartner || 'Shiprocket'}</span>
                          <span className="text-xs font-mono text-gray-900 font-bold">{order.trackingNumber || 'AWB-PENDING'}</span>
                        </div>
                      )}
                      <button onClick={() => window.open(`/dashboard/print-slip?orderId=${order.id}`, '_blank')} className="mt-2 w-full px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-[10px] font-bold uppercase tracking-widest border border-gray-300 shadow-sm flex items-center justify-center gap-1">🖨️ Print Slip</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-gray-500 font-medium text-sm">No active orders to dispatch.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Pending Payouts</div>
              <div className="text-3xl font-black text-gray-900">₹0</div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Total Payouts</div>
              <div className="text-3xl font-black text-green-600">₹0</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Bank Details</h3>
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); alert("Bank details saved securely."); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Account Holder Name</label>
                  <input type="text" placeholder="As per bank records" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Bank Name</label>
                  <input type="text" placeholder="e.g. State Bank of India" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Account Number</label>
                  <input type="text" placeholder="Account Number" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">IFSC Code</label>
                  <input type="text" placeholder="e.g. SBIN0001234" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none font-mono uppercase" required />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">UPI Details (Optional)</label>
                  <input type="text" placeholder="yourname@upi" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none font-mono" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] transition-colors shadow-[0_4px_14px_0_rgb(229,113,56,0.39)]">
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {activeTab === "messages" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Buyer Messages</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 md:border-r border-gray-100 md:pr-6">
              <div className="p-5 bg-gray-50 rounded-2xl text-sm text-gray-500 font-medium text-center border border-gray-100">No active conversations</div>
            </div>
            <div className="w-full md:w-2/3 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[300px]">
              Select a chat to start messaging
            </div>
          </div>
        </div>
      )}

      {activeTab === "support" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900">Contact Admin Support</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">Raise a dispute or ask for help regarding GI-tags or payouts.</p>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-5">Raise a Ticket</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Subject" className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
              <textarea rows={4} placeholder="Describe your issue..." className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all"></textarea>
              <button type="button" className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">Submit Ticket</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "staff" && (
        <div className="animate-in fade-in max-w-2xl">
          <StaffAccountsTab 
            userUid={auth.currentUser?.uid || ""}
            roleType={roleTitle.includes("Weaver") ? "weaver" : "store"}
            staffMembers={staffMembers}
            setStaffMembers={setStaffMembers}
          />
        </div>
      )}

      {activeTab === "personal" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Personal Profile & KYC Settings</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <h3 className="text-red-800 font-bold text-sm mb-1">Strictly Confidential</h3>
            <p className="text-red-700 text-xs font-medium">This information is strictly for official use only (Bank, DOB, KYC) and will NEVER be shown to the public.</p>
          </div>

          <form className="space-y-8" onSubmit={handleSavePersonal}>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. Personal Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Full Name (As per Bank/Aadhaar)</label>
                  <input type="text" value={personalName} onChange={e => setPersonalName(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input type="date" value={personalDob} onChange={e => setPersonalDob(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                </div>
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Country</label>
                    <select value={personalCountry} onChange={e => {
                      setPersonalCountry(e.target.value);
                      if (e.target.value !== "India") { setPersonalState(""); setPersonalDistrict(""); }
                      else { setPersonalState("Odisha"); }
                    }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none disabled:bg-gray-200 disabled:text-gray-500" required disabled={roleTitle === "Weaver Hub"}>
                      <option value="India">India</option>
                      {roleTitle !== "Weaver Hub" && <option value="International">International</option>}
                    </select>
                    {personalCountry === "International" && roleTitle !== "Weaver Hub" && (
                      <input type="text" value={customPersonalCountry} onChange={e => setCustomPersonalCountry(e.target.value)} placeholder="Enter Country Name (e.g. USA, UK)" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none mt-2" required />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">State</label>
                    {personalCountry === "India" ? (
                      <select value={personalState} onChange={e => { setPersonalState(e.target.value); setPersonalDistrict(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none disabled:bg-gray-200 disabled:text-gray-500" required disabled={roleTitle === "Weaver Hub"}>
                        <option value="">Select State...</option>
                        {roleTitle === "Weaver Hub" ? (
                          <option value="Odisha">Odisha</option>
                        ) : (
                          INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)
                        )}
                      </select>
                    ) : (
                      <input type="text" value={personalState} onChange={e => setPersonalState(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">District</label>
                    {personalCountry === "India" && personalState === "Odisha" ? (
                      <select value={personalDistrict} onChange={e => { setPersonalDistrict(e.target.value); setPersonalBlock(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required>
                        <option value="">Select District...</option>
                        {(roleTitle === "Weaver Hub" ? WEAVER_DISTRICTS : ODISHA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={personalDistrict} onChange={e => setPersonalDistrict(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Block</label>
                    {personalCountry === "India" && personalState === "Odisha" && personalDistrict && ODISHA_DISTRICT_BLOCKS[personalDistrict] ? (
                      <select value={personalBlock} onChange={e => setPersonalBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required>
                        <option value="">Select Block...</option>
                        {ODISHA_DISTRICT_BLOCKS[personalDistrict].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={personalBlock} onChange={e => setPersonalBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Town / Village</label>
                    <input type="text" value={personalTownVillage} onChange={e => setPersonalTownVillage(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">PIN Code</label>
                    <input type="text" value={personalPin} onChange={e => setPersonalPin(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Street Address</label>
                    <textarea value={personalAddress} onChange={e => setPersonalAddress(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required rows={2} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Years of Experience / Established Year</label>
                  <input type="text" value={personalExperience} onChange={e => setPersonalExperience(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Account Holder Name</label>
                  <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Account Number</label>
                  <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">IFSC Code</label>
                  <input type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none font-mono uppercase" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">UPI ID (Optional)</label>
                  <input type="text" value={bankUpi} onChange={e => setBankUpi(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none font-mono" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors shadow-sm">
                {isSaving ? "Saving..." : "Save Personal Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Verification (KYC)</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <h3 className="text-blue-800 font-bold text-sm mb-1">Earn the Bhulia Verified Badge</h3>
            <p className="text-blue-700 text-xs font-medium">Submitting your KYC documents allows us to verify your identity and unlock payouts. This information is strictly confidential.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSavePersonal}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">KYC Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">KYC Document Type</label>
                  <select value={kycType} onChange={e => setKycType(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required>
                    <option value="">Select Document Type...</option>
                    <option value="gst">GST Registration Number</option>
                    <option value="udyam">Aadhaar Udyam Number</option>
                    <option value="aadhaar">Personal Aadhaar Card</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Document ID / Number</label>
                  <input type="text" value={kycId} onChange={e => setKycId(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Upload KYC Document (Photo/PDF)</label>
                  <div className="bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 border-dashed rounded-xl p-6">
                    <ImageUploader folder="kyc_docs" onUpload={url => setKycDocumentUrl(url)} currentImage={kycDocumentUrl} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors shadow-sm">
                {isSaving ? "Saving..." : "Submit KYC Documents"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "vanity_url" && (
        <div className="max-w-4xl animate-in fade-in">
          <VanityUrlManager currentSlug={"shyam-dash-303"} />
        </div>
      )}


      {activeTab === "store_settings" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Professional Store Profile</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <h3 className="text-blue-800 font-bold text-sm mb-1">Public Display Data</h3>
            <p className="text-blue-700 text-xs font-medium">This information will be displayed exactly as typed on your public storefront.</p>
          </div>

          <form className="space-y-8" onSubmit={(e) => {
            if (roleTitle === "Weaver Hub" && currentProfileStep < 3) {
              e.preventDefault();
              handleSaveStore(undefined, true);
              setCurrentProfileStep(prev => prev + 1);
            } else {
              handleSaveStore(e);
            }
          }}>
            
            {/* Step Indicators */}
            {roleTitle === "Weaver Hub" && storeStatus === "pending" && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="text-xl">⏳</div>
                <div>
                  <h4 className="font-bold text-sm">Store Profile Under Review</h4>
                  <p className="text-xs mt-1">Your public store profile is currently being reviewed by our Admin team. It will be live once approved!</p>
                </div>
              </div>
            )}
            
            {roleTitle === "Weaver Hub" && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex-1 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentProfileStep >= 1 ? 'bg-[#0070F3] text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <div className={`flex-1 h-1 mx-2 ${currentProfileStep >= 2 ? 'bg-[#0070F3]' : 'bg-gray-100'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentProfileStep >= 2 ? 'bg-[#0070F3] text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <div className={`flex-1 h-1 mx-2 ${currentProfileStep >= 3 ? 'bg-[#0070F3]' : 'bg-gray-100'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentProfileStep >= 3 ? 'bg-[#0070F3] text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                </div>
                {(currentProfileStep < 3) ? (
                  <button type="submit" className="ml-4 bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-sm">
                    Save & Next 
                  </button>
                ) : (
                  <button type="submit" disabled={isSaving} className="ml-4 bg-[#0070F3] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#005BB5] transition-colors shadow-sm disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Store Settings"}
                  </button>
                )}
              </div>
            )}

            {currentProfileStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-lg font-bold text-gray-900">1. {roleTitle === "Weaver Hub" ? "Weaver" : "Store"} Details & Location</h3>
                  <button type="button" onClick={() => {
                    setStoreName(personalName);
                    setPhone(bankAccount ? "9999999999" : ""); // Demo purpose copy
                  }} className="bg-[#0070F3] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#005BB5] transition-colors shadow-sm whitespace-nowrap">
                    Copy from Personal Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Store Name / Professional Name</label>
                    <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Public Description</label>
                    <textarea value={publicDesc} onChange={e => setPublicDesc(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none min-h-[120px]" required />
                  </div>
                  <div className="col-span-2">
                    <ImageUploader value={storeLogo} onChange={setStoreLogo} label="Store Logo / Profile Picture" aspectRatio="square" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Public Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Public WhatsApp Number</label>
                    <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                  {roleTitle === "Weaver Hub" ? (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Country</label>
                        <input type="text" value="India" disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">State</label>
                        <input type="text" value="Odisha" disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">District</label>
                        <select value={district} onChange={e => { setDistrict(e.target.value); setBlock(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required>
                          <option value="">Select Handloom District...</option>
                          {WEAVER_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Country</label>
                        <select value={country} onChange={e => {
                          setCountry(e.target.value);
                          if (e.target.value === "International") {
                            setState(""); setDistrict("");
                          } else {
                            setState("Odisha");
                          }
                        }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none disabled:bg-gray-200 disabled:text-gray-500" required disabled={roleTitle === "Weaver Hub"}>
                          <option value="India">India</option>
                          {roleTitle !== "Weaver Hub" && <option value="International">International</option>}
                        </select>
                        {country === "International" && roleTitle !== "Weaver Hub" && (
                          <input type="text" value={customCountry} onChange={e => setCustomCountry(e.target.value)} placeholder="Enter Country Name (e.g. USA, UK)" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none mt-2" required />
                        )}
                      </div>

                      {country === "India" ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">State</label>
                          <select value={state} onChange={e => { setState(e.target.value); setDistrict(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none disabled:bg-gray-200 disabled:text-gray-500" required disabled={roleTitle === "Weaver Hub"}>
                            <option value="">Select State...</option>
                            {roleTitle === "Weaver Hub" ? (
                              <option value="Odisha">Odisha</option>
                            ) : (
                              INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)
                            )}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">State / Province</label>
                          <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                        </div>
                      )}

                      {country === "India" && state === "Odisha" ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">District</label>
                          <select value={district} onChange={e => { setDistrict(e.target.value); setBlock(""); }} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required>
                            <option value="">Select District...</option>
                            {(roleTitle === "Weaver Hub" ? WEAVER_DISTRICTS : ODISHA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">City / District</label>
                          <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Block</label>
                    {((country === "India" && state === "Odisha") || roleTitle === "Weaver Hub") && district && ODISHA_DISTRICT_BLOCKS[district] ? (
                      <select value={block} onChange={e => setBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required>
                        <option value="">Select Block...</option>
                        {ODISHA_DISTRICT_BLOCKS[district].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={block} onChange={e => setBlock(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Town / Village / City</label>
                    <input type="text" value={cityTownVillage} onChange={e => setCityTownVillage(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                </div>

                <div className="mb-4 mt-6">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Street Address (House No, Landmark)</label>
                  <textarea required value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none min-h-[80px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">PIN / ZIP Code</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" required />
                  </div>
                </div>
              </div>
            )}

            {currentProfileStep === 2 && roleTitle === "Weaver Hub" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-lg font-bold text-gray-900">2. Craft & Heritage</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Years of Experience</label>
                    <input type="text" placeholder="e.g. 15 Years" value={weaverExperience} onChange={e => setWeaverExperience(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Generations in Weaving</label>
                    <input type="text" placeholder="e.g. 3rd Generation" value={generations} onChange={e => setGenerations(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Specialties (Comma Separated)</label>
                    <input type="text" placeholder="e.g. Sambalpuri, Bomkai, Ikat" value={specialties} onChange={e => setSpecialties(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Materials Used (Comma Separated)</label>
                    <input type="text" placeholder="e.g. Cotton, Tussar Silk" value={materials} onChange={e => setMaterials(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Scale of Operation</label>
                    <input type="text" placeholder="e.g. 2 Handlooms, Small Workshop" value={scale} onChange={e => setScale(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                </div>
              </div>
            )}

            {currentProfileStep === 3 && roleTitle === "Weaver Hub" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-lg font-bold text-gray-900">3. Visual Showcase</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Workshop Gallery (Up to 3 photos)</label>
                  </div>
                  <ImageUploader value={gallery1} onChange={setGallery1} label="Photo 1" aspectRatio="square" />
                  <ImageUploader value={gallery2} onChange={setGallery2} label="Photo 2" aspectRatio="square" />
                  <ImageUploader value={gallery3} onChange={setGallery3} label="Photo 3" aspectRatio="square" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Google Maps Pin URL (Optional)</label>
                      <button type="button" onClick={(e) => {
                        const btn = e.currentTarget;
                        if (navigator.geolocation) {
                          btn.innerText = "Locating...";
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const lat = position.coords.latitude;
                              const lng = position.coords.longitude;
                              setGooglePin(`https://www.google.com/maps?q=${lat},${lng}`);
                              btn.innerText = "📍 Use Current Location";
                            },
                            (error) => {
                              alert("Unable to retrieve your location. Please check browser permissions.");
                              btn.innerText = "📍 Use Current Location";
                            }
                          );
                        } else {
                          alert("Geolocation is not supported by your browser");
                        }
                      }} className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-md font-bold transition-colors border border-blue-200 shadow-sm whitespace-nowrap">
                        📍 Use Current Location
                      </button>
                    </div>
                    <input type="text" placeholder="https://maps.app.goo.gl/..." value={googlePin} onChange={e => setGooglePin(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Google Place ID (Optional)</label>
                    <input type="text" placeholder="ChIJ..." value={googlePlaceId} onChange={e => setGooglePlaceId(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Facebook URL (Optional)</label>
                    <input type="text" placeholder="https://facebook.com/..." value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Instagram URL (Optional)</label>
                    <input type="text" placeholder="https://instagram.com/..." value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] outline-none" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              {currentProfileStep > 1 && roleTitle === "Weaver Hub" && (
                <button type="button" onClick={() => { handleSaveStore(undefined, true); setCurrentProfileStep(prev => prev - 1); }} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                  Previous
                </button>
              )}
              
              {(currentProfileStep < 3 && roleTitle === "Weaver Hub") ? (
                <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">
                  Save & Next
                </button>
              ) : (
                <button type="button" onClick={(e) => handleSaveStore(e as any)} disabled={isSaving} className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors shadow-[0_4px_14px_0_rgb(0,112,243,0.39)] hover:shadow-[0_6px_20px_rgba(0,112,243,0.23)]">
                  {isSaving ? "Saving..." : "Save Store Settings"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function WeaverDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return <SellerDashboard activeTab={activeTab} onTabChange={onTabChange} roleTitle="Weaver Hub" />;
}

function VendorDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return <SellerDashboard activeTab={activeTab} onTabChange={onTabChange} roleTitle="Store Hub" />;
}


/* ==========================================
   4. RESELLER DASHBOARD
   ========================================== */
function ResellerDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const { products, loading: productsLoading } = useProducts();
  const { orders } = useOrders();
  const { transactions } = useTransactions();
  const resellerProducts = products.filter(p => p.allowResellerMargin === true);

  // Filter transactions for this reseller
  const myTransactions = transactions.filter(t => t.resellerId === auth.currentUser?.uid);

  // Calculate balances from ledger
  const escrowBalance = myTransactions.filter(t => t.status === "pending_escrow").reduce((sum, t) => sum + t.amount, 0);
  const availableBalance = myTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const paidOutBalance = myTransactions.filter(t => t.status === "paid_out").reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = availableBalance + paidOutBalance;

  // Legacy variables
  const myReferralOrders = orders.filter(o => o.referralId === auth.currentUser?.uid || o.proxyBuyerId === auth.currentUser?.uid || (o as any).resellerId === auth.currentUser?.uid);

  // Proxy Order State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  // Bank State
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);

  // KYC State
  const [kycType, setKycType] = useState("aadhaar");
  const [kycDocUrl, setKycDocUrl] = useState("");
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSavingBank(true);
    try {
      await addDoc(collection(db, "kyc_verifications"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        type: "bank",
        bankName,
        accountNumber,
        ifsc,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setBankSaved(true);
    } catch (error) {
      console.error(error);
      alert("Failed to save bank details");
    }
    setIsSavingBank(false);
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !kycDocUrl) {
      alert("Please upload a document first.");
      return;
    }
    setIsSubmittingKyc(true);
    try {
      let finalKycUrl = kycDocUrl;
      if (kycDocUrl.startsWith("data:image")) {
        finalKycUrl = await uploadBase64ToStorage(kycDocUrl, `kyc/${auth.currentUser.uid}`);
        setKycDocUrl(finalKycUrl);
      }

      await addDoc(collection(db, "kyc_verifications"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        type: "identity",
        documentType: kycType,
        documentUrl: finalKycUrl,
        privacy: "confidential",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setKycSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit KYC");
    }
    setIsSubmittingKyc(false);
  };

  const handleProxyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsOrdering(true);
    try {
      const orderRef = await addDoc(collection(db, "proxy_orders"), {
        customerName,
        customerPhone,
        pinCode,
        address,
        paymentMethod,
        resellerId: auth.currentUser?.uid,
        status: "placed",
        hubStatus: "pending",
        createdAt: serverTimestamp(),
      });

      // Phase 3: Financial Ledger Auto-Logging
      // Record a pending commission transaction to be resolved when escrow clears
      await addDoc(collection(db, "transactions"), {
        type: "reseller_commission",
        resellerId: auth.currentUser?.uid,
        orderId: orderRef.id,
        amount: 0, // To be calculated on checkout
        status: "pending_escrow",
        createdAt: serverTimestamp(),
      });

      alert("Proxy order secured in Firestore! Ledger transaction queued.");
      setCustomerName("");
      setCustomerPhone("");
      setPinCode("");
      setAddress("");
      setPaymentMethod("");
      onTabChange("home");
    } catch (error) {
      console.error(error);
      alert("Failed to place proxy order.");
    }
    setIsOrdering(false);
  };

  const handleRequestPayout = async () => {
    if (!auth.currentUser) return;
    if (availableBalance <= 0) {
      alert("You have no available balance to withdraw.");
      return;
    }

    try {
      await addDoc(collection(db, "payout_requests"), {
        resellerId: auth.currentUser.uid,
        amount: availableBalance,
        status: "pending",
        createdAt: serverTimestamp()
      });
      alert("Payout request submitted successfully. It will be reviewed by the admin.");
    } catch (e) {
      console.error(e);
      alert("Failed to request payout.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Reseller Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Curate products and place proxy orders for your customers.</p>
        </div>
      </header>
      
      {activeTab === "home" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-500 text-xl shadow-sm shrink-0">⏳</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Activation Pending</h3>
              <p className="text-sm text-gray-600 mt-1">Our staff will contact you shortly to verify your identity and activate your storefront link.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">My Curated Products</h3>
              <div className="text-3xl font-black text-gray-900">{resellerProducts.length}</div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Commission Earned</h3>
              <div className="text-3xl font-black text-green-600">₹{Math.floor(totalEarned).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "curation" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curate Products</h2>
          <p className="text-gray-500 mb-8 font-medium">Browse the master catalog and select products to display on your personal link. Share these links on WhatsApp or Facebook to earn commissions!</p>
          
          {productsLoading ? (
            <div className="text-center py-16 text-gray-500 font-medium">Loading catalog...</div>
          ) : resellerProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">No products available for resale yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resellerProducts.map(product => {
                const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${product.slug}?ref=${auth.currentUser?.uid}` : "";
                return (
                  <div key={product.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative w-full aspect-[3/4] sm:aspect-[9/16] bg-gray-100">
                      <img src={product.img} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 truncate mb-1">{product.title}</h3>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-500 line-through">₹{product.price}</span>
                        <span className="text-lg font-black text-[#0070F3]">₹{product.resellerPrice}</span>
                      </div>
                      <div className="text-xs text-green-600 font-bold mb-4 bg-green-50 px-2 py-1 rounded w-max">
                        Your Margin: {product.resellerMarginPercentage}%
                      </div>
                      <div className="mt-auto space-y-2">
                        <button onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          alert("Affiliate link copied to clipboard!");
                        }} className="w-full py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors">
                          Copy Link
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <a href={`https://wa.me/?text=${encodeURIComponent("Check out this authentic handloom product: " + shareUrl)}`} target="_blank" rel="noreferrer" className="w-full py-2 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#128C7E] transition-colors text-center flex items-center justify-center gap-1">
                            WhatsApp
                          </a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="w-full py-2 bg-[#1877F2] text-white font-bold text-sm rounded-xl hover:bg-[#166FE5] transition-colors text-center flex items-center justify-center gap-1">
                            Facebook
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "proxy" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Place Proxy Order</h2>
          <form className="space-y-6" onSubmit={handleProxyOrder}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Customer Full Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Customer WhatsApp/Phone</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">PIN Code</label>
                <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required>
                  <option value="">Select Method</option>
                  <option value="UPI">Send UPI Link to Customer</option>
                  <option value="COD">Cash on Delivery (₹100 Extra)</option>
                  <option value="PREPAID">I will pay now (Prepaid)</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
              <span className="text-xl">ℹ️</span>
              <p className="text-sm text-blue-800 font-medium">Proxy orders are shipped in your name. The customer will not see Bhulia.com pricing, ensuring your markup is protected.</p>
            </div>
            <button type="submit" disabled={isOrdering} className="w-full bg-[#0070F3] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-[#005BB5] transition-colors shadow-sm mt-4">
              {isOrdering ? "Securing Order..." : "Place Proxy Order"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet & Earnings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-3xl shadow-lg text-white">
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Available Balance</h3>
              <div className="text-4xl font-black mb-1">₹{availableBalance.toLocaleString('en-IN')}</div>
              <p className="text-xs text-green-100 mt-4">Funds cleared from delivered orders. Ready to withdraw.</p>
              <button 
                onClick={handleRequestPayout}
                className="mt-6 w-full py-2 bg-white text-green-700 font-bold rounded-xl text-sm shadow-sm hover:bg-gray-50 transition-colors"
              >
                Request Withdrawal
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Escrow</h3>
                <div className="text-4xl font-black text-orange-500">₹{escrowBalance.toLocaleString('en-IN')}</div>
                <p className="text-xs text-gray-400 mt-4">Commissions locked in active transit. Auto-funds upon delivery.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Earned</h3>
                <div className="text-4xl font-black text-gray-900">₹{totalEarned.toLocaleString('en-IN')}</div>
                <p className="text-xs text-gray-400 mt-4">Lifetime earnings from Bhulia Hub.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Ledger Transactions</h3>
            {myTransactions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-medium">No transactions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                      <th className="py-4 px-4 font-bold rounded-tl-xl">Order Ref</th>
                      <th className="py-4 px-4 font-bold">Type</th>
                      <th className="py-4 px-4 font-bold">Status</th>
                      <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {myTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-mono text-xs text-gray-500">{t.orderId}</td>
                        <td className="py-4 px-4 font-medium text-gray-700 capitalize">{t.type.replace('_', ' ')}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            t.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            t.status === 'pending_escrow' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900">+₹{t.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "kyc" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Identity & Tier</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="font-bold text-gray-900 mb-1">Reseller KYC</div>
                <div className="text-sm text-gray-500 font-medium">Aadhaar / PAN</div>
              </div>
              <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold">Pending Review</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="font-bold text-gray-900 mb-1">Current Tier</div>
                <div className="text-sm text-gray-500 font-medium">Standard Reseller (10% Margin)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Store Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Total Views</p>
              <p className="text-3xl font-black text-gray-900">0</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Conversion Rate</p>
              <p className="text-3xl font-black text-gray-900">0.0%</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Est. Earnings</p>
              <p className="text-3xl font-black text-blue-900">₹0</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 font-medium">Chart Data Unavailable</div>
        </div>
      )}

      {activeTab === "links" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Marketing Links</h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Generate unique tracking links for individual products or your entire curated store.</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Your Custom Storefront Link</h3>
            <div className="flex gap-4 items-center">
              <input type="text" readOnly value={`https://bhulia.com/store/${auth.currentUser?.uid}`} className="flex-1 border border-gray-300 rounded-xl p-3 text-sm text-gray-500 bg-white" />
              <button className="bg-[#0070F3] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005BB5] transition-colors shadow-sm">Copy</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "support" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900">Contact Admin Support</h2>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-5">Raise a Ticket</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Subject" className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
              <textarea rows={4} placeholder="Describe your issue..." className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all"></textarea>
              <button type="button" className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">Submit Ticket</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" defaultValue="Reseller User" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Shipping/Billing Address</label>
              <textarea className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" rows={3}></textarea>
            </div>
            <button className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm mt-4">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleImporterTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [pageToken, setPageToken] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const handleSearch = async (token?: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, pageToken: token || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (token) {
        setResults(prev => [...prev, ...(data.places || [])]);
      } else {
        setResults(data.places || []);
        setSelectedIds(new Set());
      }
      setPageToken(data.nextPageToken || "");
    } catch (e: any) {
      alert("Failed to search: " + e.message);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Import ${selectedIds.size} listings to Stores directory?`)) return;
    
    setImporting(true);
    try {
      const { collection, setDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const itemsToImport = results.filter(r => selectedIds.has(r.id));
      
      for (const item of itemsToImport) {
        const title = item.displayName?.text || "Unknown Store";
        // Generate a URL-friendly slug based on the name and last 5 chars of the Google ID
        const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + item.id.slice(-5).toLowerCase();

        await setDoc(doc(db, "stores", item.id), {
          title: title,
          slug: generatedSlug,
          address: item.formattedAddress || "",
          phone: item.nationalPhoneNumber || "",
          website: item.websiteUri || "",
          googleRating: item.rating || 0,
          googleReviewsCount: item.userRatingCount || 0,
          googlePlaceId: item.id,
          coordinates: item.location ? { lat: item.location.latitude, lng: item.location.longitude } : null,
          status: "unclaimed",
          country: "India",
          state: "Odisha",
          district: "Bargarh", // Default fallback
          desc: "This profile was automatically generated from Google Maps. If you are the owner, please verify it.",
          isBhuliaVerified: false,
          createdAt: Date.now()
        }, { merge: true });
      }
      alert(`Successfully imported ${selectedIds.size} stores!`);
      setSelectedIds(new Set());
    } catch (e: any) {
      alert("Failed to import: " + e.message);
    }
    setImporting(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-6xl animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Maps Data Ingestion</h2>
      <p className="text-gray-500 mb-8">Search Google Places and bulk-import them as Unverified stores to capture leads.</p>
      
      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. Sambalpuri Saree Shops in Bhubaneswar" 
          className="flex-1 bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-4 text-gray-900 focus:border-[#0070F3] outline-none"
        />
        <button 
          onClick={() => handleSearch()} 
          disabled={loading}
          className="bg-[#0070F3] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? "Searching..." : "Search Places"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedIds.size === results.length && results.length > 0} 
                onChange={toggleAll}
                className="w-5 h-5 rounded border-gray-300 text-[#0070F3] focus:ring-[#0070F3]"
              />
              <span className="font-bold text-gray-900">{selectedIds.size} Selected</span>
            </div>
            <button 
              onClick={handleImport}
              disabled={importing || selectedIds.size === 0}
              className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {importing ? "Importing..." : "Import Selected to Database"}
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl max-h-[500px]">
            <table className="w-full text-left relative">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-12 bg-gray-50"></th>
                  <th className="p-4 font-bold bg-gray-50">Store Name</th>
                  <th className="p-4 font-bold bg-gray-50">Location</th>
                  <th className="p-4 font-bold bg-gray-50">Rating</th>
                  <th className="p-4 font-bold bg-gray-50">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(r.id)} 
                        onChange={() => toggleSelect(r.id)}
                        className="w-5 h-5 rounded border-gray-300 text-[#0070F3] focus:ring-[#0070F3]"
                      />
                    </td>
                    <td className="p-4 font-bold text-gray-900">{r.displayName?.text}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={r.formattedAddress}>{r.formattedAddress}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="font-bold text-gray-900">{r.rating || "N/A"}</span>
                        <span className="text-xs text-gray-400">({r.userRatingCount || 0})</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900 font-mono">{r.nationalPhoneNumber || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageToken && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => handleSearch(pageToken)}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                {loading ? "Loading..." : "Load Next 20 Results"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   5. SUPER ADMIN DASHBOARD
   ========================================== */
function SuperAdminDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();
  const { stores: stores, loading: storesLoading } = useStores();
  const { resellers: franchises, loading: franchisesLoading } = useResellers();
  const { orders, loading: ordersLoading } = useOrders();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group pending items
  const pendingWeavers = weavers.filter(w => w.status === "pending_approval" || (w.status as string) === "pending");
  const pendingStores = stores.filter(s => s.status === "pending_approval" || (s.status as string) === "pending");
  const pendingFranchises = franchises.filter(f => f.status === "pending_approval" || (f.status as string) === "pending");
  const pendingProducts = products.filter(p => p.escrowStatus === "pending_approval" || (p as any).status === "pending_approval" || (p as any).status === "pending");

  const pendingList = [
    ...pendingWeavers.map(w => ({ id: w.id, title: w.title || w.slug, type: "weavers" as const, data: w as any })),
    ...pendingStores.map(s => ({ id: s.id, title: s.title || s.slug, type: "stores" as const, data: s as any })),
    ...pendingFranchises.map(f => ({ id: f.id, title: f.name || f.slug, type: "franchises" as const, data: f as any })),
    ...pendingProducts.map(p => ({ id: p.id, title: p.title, type: "products" as const, data: p as any }))
  ];

  const totalCatalogValue = products.reduce((acc, curr) => {
    const priceStr = curr.price?.toString().replace(/[^0-9]/g, '') || "0";
    return acc + (parseInt(priceStr) || 0);
  }, 0);

  const [personalDataCache, setPersonalDataCache] = useState<Record<string, any>>({});
  
  const handleInspect = async (item: any) => {
    setSelectedItem(item);
    if (item.type === "weavers" || item.type === "stores" || item.type === "franchises") {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const userDoc = await getDoc(doc(db, "users", item.id));
        if (userDoc.exists()) {
          setPersonalDataCache((prev: any) => ({ ...prev, [item.id]: userDoc.data() }));
        }
      } catch (e) {
        console.error("Failed to fetch personal data", e);
      }
    }
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    const { id, type, data } = selectedItem;
    
    let updates: any = { ...data, status: "approved", pendingChanges: null };

    if (type === "products") {
      updates.isBhuliaVerified = true;
    }

    const res = await updateDocumentStatus(type, id, updates);
    if (res.success) {
      alert("Successfully verified and published to Bhulia Hub!");
      setSelectedItem(null);
    } else {
      alert("Error approving changes: " + (res.error as any)?.message);
    }
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    
    const reason = window.prompt("Please enter the reason for rejection (this will be visible to the user):");
    if (reason === null) return; // Cancelled
    
    if (!reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    setIsSubmitting(true);
    const { id, type, data } = selectedItem;
    
    let updates: any = { status: "rejected", rejectionReason: reason };
    
    if (data.pendingChanges) {
      // If rejecting an edit, we drop the pending changes and keep the existing status (likely approved)
      updates = { pendingChanges: null, rejectionReason: reason };
    }
    
    const res = await updateDocumentStatus(type, id, updates);
    if (res.success) {
      alert("Application rejected successfully with reason.");
      setSelectedItem(null);
    } else {
      alert("Error rejecting application");
    }
    setIsSubmitting(false);
  };

  const updateOrderStatus = async (orderId: string, statusKey: string, newValue: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { [statusKey]: newValue });
      alert(`Order ${statusKey} updated to ${newValue}`);
    } catch (e) {
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Super Admin Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage KYC, Products, Logistics, and Payout Finances.</p>
        </div>
      </header>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <PremiumMetricCard title="Total Catalog Value" value={<>{productsLoading ? "..." : `₹${totalCatalogValue.toLocaleString()}`}</>} index={0} />
            <PremiumMetricCard title="Live Products" value={<>{productsLoading ? "..." : products.length}</>} index={1} />
            <PremiumMetricCard title="Verified Weavers" value={<>{weaversLoading ? "..." : weavers.length}</>} index={2} />
            <PremiumMetricCard title="Retail Stores" value={<>{storesLoading ? "..." : stores.length}</>} index={3} />
            <PremiumMetricCard title="Resellers" value={<>{franchisesLoading ? "..." : franchises.length}</>} index={4} />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Global Action Queue</h2>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b border-gray-100">
                    <th className="pb-4 font-bold tracking-wider">Tenant / Asset</th>
                    <th className="pb-4 font-bold tracking-wider">Category</th>
                    <th className="pb-4 font-bold tracking-wider">Status</th>
                    <th className="pb-4 font-bold tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {pendingList.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-4">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">ID: {item.id}</div>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">{item.type}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-[#0070F3] font-bold">Pending Review</span>
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleInspect(item)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">Review</button>
                      </td>
                    </tr>
                  ))}
                  {pendingList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No pending items in the queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "kyc" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User KYC & Verification</h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-bold tracking-wider">User Details</th>
                  <th className="pb-4 font-bold tracking-wider">Role</th>
                  <th className="pb-4 font-bold tracking-wider text-right">KYC Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {[...pendingWeavers, ...pendingStores, ...pendingFranchises].map((user: any) => (
                  <tr key={user.id}>
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{user.title || user.name || user.slug}</div>
                      <div className="text-xs text-gray-500">{user.id}</div>
                    </td>
                    <td className="py-4 font-bold text-gray-600 uppercase text-xs">{user.status ? "Platform User" : "Unknown"}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => handleInspect({ id: user.id, title: user.title || user.name || user.slug, type: user.name ? "franchises" : user.title ? "stores" : "weavers", data: user })} className="px-4 py-2 border border-gray-200 text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                        Review KYC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-xl mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-blue-800 font-bold text-lg">The Admin Hub has Moved!</h3>
              <p className="text-blue-600 text-sm mt-1">We have upgraded to the new Enterprise Admin Engine. Please use the new hub for all Product Approvals, KYC, and Orders.</p>
            </div>
            <a href="/admin/dashboard" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition-colors">
              Go to Enterprise Admin →
            </a>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 line-through text-gray-400">Product Approvals (Legacy)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
            {pendingProducts.map(p => (
              <div key={p.id} className="p-6 border border-gray-200 rounded-2xl flex flex-col justify-between group hover:border-[#0070F3]/30 transition-colors">
                <div>
                  <div className="font-bold text-gray-900 mb-1">{p.title}</div>
                  <div className="text-sm font-bold text-[#0070F3] mb-6">Price: {p.price}</div>
                </div>
                <button onClick={() => handleInspect({ id: p.id, title: p.title, type: "products", data: p })} className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
                  Verify Handloom Authenticity
                </button>
              </div>
            ))}
            {pendingProducts.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 font-medium">No products pending review.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "logistics" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Logistics & Order Fulfillment</h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-bold tracking-wider">Order Details</th>
                  <th className="pb-4 font-bold tracking-wider">Customer</th>
                  <th className="pb-4 font-bold tracking-wider">Logistics Status</th>
                  <th className="pb-4 font-bold tracking-wider text-right">Update</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{order.productName || "Proxy Order"}</div>
                      <div className="text-xs text-gray-500">ID: {order.orderId || order.id}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerAddress}</div>
                    </td>
                    <td className="py-4">
                      <select value={order.logisticsStatus || (order as any).status || "Pending QC"} onChange={(e) => updateOrderStatus(order.id, "logisticsStatus", e.target.value)} className="bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0070F3]">
                        <option value="placed">Placed (Pending QC)</option>
                        <option value="QC Passed">QC Passed</option>
                        <option value="Pending Weaver Handover">Pending Weaver Handover</option>
                        <option value="Dispatched via Hub">Dispatched via Hub</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => alert("Shiprocket AWB creation will pop up here.")} className="text-sm text-[#0070F3] font-bold hover:underline">Generate AWB</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payout & Reseller Finance</h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-bold tracking-wider">Order ID</th>
                  <th className="pb-4 font-bold tracking-wider">Amount / Method</th>
                  <th className="pb-4 font-bold tracking-wider">Payment Status</th>
                  <th className="pb-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="py-4 font-mono text-xs text-gray-500">{order.orderId || order.id}</td>
                    <td className="py-4">
                      <div className="font-bold text-[#0070F3]">{order.productPrice || "TBD"}</div>
                      <div className="text-xs font-bold text-slate-800 uppercase">{order.paymentMode || "Online"}</div>
                      {(order.referralId || order.proxyBuyerId || (order as any).resellerId) && (
                        <div className="mt-1 text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded inline-block">Has Reseller Margin</div>
                      )}
                    </td>
                    <td className="py-4">
                      <select value={order.paymentStatus || (order as any).status || "Payout Locked"} onChange={(e) => updateOrderStatus(order.id, "paymentStatus", e.target.value)} className="bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0070F3]">
                        <option value="Payout Locked">Payout Locked</option>
                        <option value="placed">Placed (Cash)</option>
                        <option value="Payout Pending (Weaver)">Payout Pending (Weaver)</option>
                        <option value="Settled">Fully Settled</option>
                      </select>
                    </td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => updateOrderStatus(order.id, "paymentStatus", "Settled")} 
                        disabled={order.paymentStatus === "Settled" || (order as any).status !== "delivered"}
                        className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:bg-green-100"
                      >
                        {order.paymentStatus === "Settled" ? "Paid" : "Release Payout"}
                      </button>
                      {(order.referralId || order.proxyBuyerId || (order as any).resellerId) && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "paymentStatus", "Settled")} 
                          disabled={order.paymentStatus === "Settled" || (order as any).status !== "delivered"}
                          className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:bg-blue-100"
                        >
                          Pay Comm.
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0070F3]">Ecosystem Verification</span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">Inspect: {selectedItem.title}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-4">
              <div className="col-span-full mb-2 border-b border-blue-200 pb-2">
                <h4 className="text-sm font-bold text-blue-900 uppercase">Public Store Profile</h4>
              </div>
              {Object.keys(selectedItem.data).filter(key => key !== "id" && key !== "status" && key !== "pendingChanges" && key !== "layoutConfig").map(key => (
                <div key={key} className="space-y-1">
                  <span className="text-xs text-blue-700 font-bold uppercase tracking-wider block">{key}</span>
                  <input 
                    type="text" 
                    value={selectedItem.data[key] || ""} 
                    onChange={(e) => {
                      const newData = { ...selectedItem.data, [key]: e.target.value };
                      setSelectedItem({ ...selectedItem, data: newData });
                    }}
                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {(selectedItem.type === "weavers" || selectedItem.type === "stores" || selectedItem.type === "franchises") && personalDataCache[selectedItem.id] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-red-50 p-6 rounded-2xl border border-red-100 mb-8">
                <div className="col-span-full mb-2 border-b border-red-200 pb-2">
                  <h4 className="text-sm font-bold text-red-900 uppercase">Private Personal Profile (KYC)</h4>
                </div>
                {["personalName", "personalDob", "personalAddress", "bankName", "bankAccount", "bankIfsc", "kycType", "kycId", "phone", "whatsapp"].map(key => (
                  <div key={`personal-${key}`} className="space-y-1">
                    <span className="text-xs text-red-700 font-bold uppercase tracking-wider block">{key}</span>
                    <span className="text-sm font-medium text-gray-900">{String(personalDataCache[selectedItem.id]?.[key] || "N/A")}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedItem.type === "weavers" && !personalDataCache[selectedItem.id] && (
              <div className="grid grid-cols-1 gap-4 bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-8">
                <div className="col-span-full mb-2 border-b border-purple-200 pb-2">
                  <h4 className="text-sm font-bold text-purple-900 uppercase">Orphan Profile / Dummy Account</h4>
                </div>
                <p className="text-sm text-purple-800 font-medium">This Weaver profile does not have an active login account. Create credentials for them below.</p>
                <div className="flex flex-col gap-3">
                  <input id="dummyEmail" type="email" placeholder="Weaver's Email (e.g. gmail.com)" className="bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input id="dummyPassword" type="text" placeholder="Temporary Password" defaultValue="bhulia123" className="bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      const emailInput = document.getElementById('dummyEmail') as HTMLInputElement;
                      const pwdInput = document.getElementById('dummyPassword') as HTMLInputElement;
                      if (!emailInput.value || !pwdInput.value) { alert('Enter email and password'); return; }
                      
                      const btn = e.currentTarget;
                      btn.textContent = "Creating...";
                      btn.disabled = true;
                      try {
                        const { initializeApp } = await import('firebase/app');
                        const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
                        const { setDoc } = await import('firebase/firestore');
                        
                        const secondaryApp = initializeApp(auth.app.options, "Secondary" + Date.now());
                        const secondaryAuth = getAuth(secondaryApp);
                        
                        const cred = await createUserWithEmailAndPassword(secondaryAuth, emailInput.value, pwdInput.value);
                        const newUid = cred.user.uid;
                        
                        // 1. Copy weaver data to new ID
                        const oldDocRef = doc(db, 'weavers', selectedItem.id);
                        const newDocRef = doc(db, 'weavers', newUid);
                        const oldSnap = await getDoc(oldDocRef);
                        if (oldSnap.exists()) {
                          await setDoc(newDocRef, { ...oldSnap.data(), uid: newUid, updatedAt: serverTimestamp() });
                          await setDoc(doc(db, 'users', newUid), {
                            uid: newUid,
                            email: emailInput.value,
                            role: 'weaver',
                            weaverDocId: newUid,
                            createdAt: serverTimestamp()
                          });
                          await updateDoc(oldDocRef, { status: "migrated", migratedTo: newUid, title: oldSnap.data().title + " (MIGRATED)" });
                          alert('Credentials created successfully! They can now log in.');
                          setSelectedItem(null);
                        }
                        
                        await secondaryAuth.signOut();
                      } catch (err: any) {
                        alert(err.message);
                      } finally {
                        btn.textContent = "Create Login & Claim Profile";
                        btn.disabled = false;
                      }
                    }}
                    className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Create Login & Claim Profile
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <button onClick={handleReject} disabled={isSubmitting} className="px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">Reject</button>
              <button onClick={handleApprove} disabled={isSubmitting} className="px-8 py-3 bg-[#0070F3] text-white font-bold rounded-xl hover:bg-[#005BB5] transition-colors shadow-sm disabled:opacity-50">Approve & Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* ==========================================
   SECURITY TAB (SHARED)
   ========================================== */
import { EmailAuthProvider, linkWithCredential, updatePassword } from "firebase/auth";



/* ==========================================
   SUPPLIER DASHBOARD (RAW MATERIAL)
   ========================================== */
function SupplierDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#8B4513] tracking-tight">Raw Material Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Supply authentic silk, cotton, and dyes to Bhulia weavers.</p>
        </div>
      </header>

      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Orders</h3>
            <div className="text-4xl font-black text-[#8B4513]">0</div>
            <button onClick={() => onTabChange("orders")} className="mt-6 text-sm text-[#8B4513] font-bold text-left">View Orders →</button>
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory Items</h3>
            <div className="text-4xl font-black text-[#8B4513]">0</div>
            <button onClick={() => onTabChange("inventory")} className="mt-6 text-sm text-[#8B4513] font-bold text-left">Manage Inventory →</button>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Materials</h2>
            <button className="px-5 py-2 bg-[#8B4513] text-white rounded-xl text-xs font-bold">+ Add Material</button>
          </div>
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">No materials added yet.</div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bulk Orders</h2>
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">No bulk orders yet.</div>
        </div>
      )}
      
      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}
/* ==========================================
   MARKETING & PROMOTIONS TAB
   ========================================== */
function MarketingTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  const fetchCoupons = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, "coupons"), where("sellerId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(data);
    } catch (e) {
      console.error("Failed to fetch coupons", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!code || !discountValue) {
      alert("Please fill all fields.");
      return;
    }
    
    setSaving(true);
    try {
      await addDoc(collection(db, "coupons"), {
        code: code.toUpperCase(),
        type: discountType,
        value: Number(discountValue),
        sellerId: auth.currentUser.uid,
        active: true,
        createdAt: new Date().toISOString()
      });
      alert("Coupon created successfully!");
      setIsModalOpen(false);
      setCode("");
      setDiscountValue("");
      fetchCoupons();
    } catch (e) {
      console.error(e);
      alert("Failed to create coupon.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Marketing & Promos</h2>
          <p className="text-sm text-gray-500 font-medium">Create discount codes and run flash sales.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-[#0A1021] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#C5A059] hover:text-[#0A1021] transition-all shadow-md"
        >
          + Create Coupon
        </button>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Coupon Code</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required placeholder="e.g. FESTIVAL20" className="w-full border border-gray-300 rounded-xl p-3 font-mono font-bold uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Discount Type</label>
                <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 font-bold">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Discount Value</label>
                <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required placeholder="e.g. 20" className="w-full border border-gray-300 rounded-xl p-3 font-bold" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="text-center py-10 font-mono text-gray-500">Loading coupons...</div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Code</th>
                  <th className="py-4 px-4 font-bold">Type</th>
                  <th className="py-4 px-4 font-bold">Value</th>
                  <th className="py-4 px-4 font-bold rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-blue-700">{coupon.code}</td>
                    <td className="py-4 px-4 capitalize font-medium">{coupon.type}</td>
                    <td className="py-4 px-4 font-bold">{coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${coupon.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-medium">
            <div className="text-4xl mb-4">🏷️</div>
            <p className="text-gray-900 font-bold text-lg mb-2">No Active Promotions</p>
            <p className="text-sm">Create a coupon code (e.g. DIWALI20) to share with your customers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
