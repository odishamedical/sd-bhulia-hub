"use client";

import PremiumMetricCard from "@/components/PremiumMetricCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  useOrders,
  useProducts,
  useWeavers,
  useVendors,
  useResellers,
  updateDocumentStatus
} from "@/lib/db-hooks";

import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ImageUploader from "@/components/ImageUploader";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [isViewAsMode, setIsViewAsMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        document.cookie = `bhulia-auth-token=${user.uid}; path=/; max-age=86400`;
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const actualRole = userDoc.data().role;
            const viewAsUid = localStorage.getItem("sd_view_as_uid");
            const viewAsRole = localStorage.getItem("sd_view_as_role");
            const viewAsName = localStorage.getItem("sd_view_as_name");
            
            if (actualRole === "super_admin" && viewAsUid && viewAsRole) {
              setRole(viewAsRole);
              setUserName(viewAsName || "Viewing User");
              setIsViewAsMode(true);
            } else {
              setRole(actualRole);
              setUserName(userDoc.data().name || user.email?.split("@")[0] || "User");
              setIsViewAsMode(false);
            }
          } else {
            setRole("onboarding");
          }
        } catch (error) {
          console.error("Error fetching user role", error);
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

  if (role === "onboarding") {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  const isCustomer = role === "customer" || role === "user" || !role;
  const isSuperAdmin = role === "super_admin";
  const displayRole = role === "franchisee" ? "reseller" : (role === "store" || role === "shop") ? "vendor" : role;
  
  // Resolve actual role mapping
  let actualRole = "customer";
  if (isSuperAdmin) actualRole = "super_admin";
  else if (!isCustomer && displayRole) actualRole = displayRole;

  let navItems: NavItem[] = [];
  if (isCustomer) {
    navItems = [
      { id: "home", label: "Dashboard", icon: "📊" },
      { id: "orders", label: "My Orders", icon: "📦" },
      { id: "wishlist", label: "Wishlist", icon: "❤️" },
      { id: "messages", label: "Messages", icon: "💬" },
      { id: "support", label: "Support", icon: "📞" },
      { id: "profile", label: "Profile Settings", icon: "⚙️" },
    ];
  } else if (actualRole === "super_admin") {
    navItems = [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "kyc", label: "KYC (Users)", icon: "🛡️" },
      { id: "products", label: "Products", icon: "🛍️" },
      { id: "logistics", label: "Logistics", icon: "🚚" },
      { id: "finance", label: "Finance", icon: "💰" },
    ];
    // Override default tab if needed
    if (activeTab === "home") setActiveTab("overview");
  } else if (actualRole === "weaver") {
    navItems = [
      { id: "home", label: "Dashboard", icon: "📊" },
      { id: "upload", label: "Upload Product", icon: "📤" },
      { id: "orders", label: "My Orders", icon: "📦" },
      { id: "wallet", label: "Wallet & Earnings", icon: "💰" },
      { id: "verification", label: "Verification", icon: "🛡️" },
    ];
  } else if (actualRole === "vendor") {
    navItems = [
      { id: "home", label: "Overview", icon: "📊" },
      { id: "products", label: "Products Catalog", icon: "🛍️" },
      { id: "orders", label: "Order Management", icon: "📦" },
      { id: "finance", label: "Finance & Payouts", icon: "💰" },
      { id: "marketing", label: "Marketing", icon: "📢" },
      { id: "settings", label: "Store Settings", icon: "⚙️" },
    ];
  } else if (actualRole === "reseller") {
    navItems = [
      { id: "home", label: "Dashboard", icon: "📊" },
      { id: "curation", label: "Store Curation", icon: "🛍️" },
      { id: "proxy", label: "Proxy Orders", icon: "🛒" },
      { id: "wallet", label: "Commissions", icon: "💰" },
      { id: "verification", label: "Verification", icon: "🛡️" },
    ];
  }

  return (
    <DashboardLayout
      userName={userName}
      userRole={actualRole}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {isViewAsMode && (
        <div className="bg-blue-600 text-white p-3 rounded-xl mb-6 flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span className="font-bold text-sm">Super Admin View-As Mode:</span>
            <span className="text-sm font-medium">You are viewing {userName}'s Dashboard. Actions taken here may affect their account.</span>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("sd_view_as_uid");
              localStorage.removeItem("sd_view_as_role");
              localStorage.removeItem("sd_view_as_name");
              window.location.reload();
            }}
            className="px-4 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            Exit View As
          </button>
        </div>
      )}

      {isCustomer && <CustomerDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      {actualRole === "weaver" && <WeaverDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      {actualRole === "vendor" && <VendorDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      {actualRole === "reseller" && <ResellerDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
      {actualRole === "super_admin" && <SuperAdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />}
    </DashboardLayout>
  );
}

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [selectedRole, setSelectedRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const uid = localStorage.getItem("sd_current_user_uid") || auth.currentUser?.uid;
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
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Complete Your Profile</h2>
        <p className="text-gray-500 text-center mb-6">Select your account type to proceed</p>
        
        <select 
          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 mb-6 focus:border-[#0070F3] focus:outline-none focus:ring-1 focus:ring-[#0070F3]"
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
          className="w-full bg-[#0070F3] text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-[#005BB5] transition-colors"
        >
          {loading ? "Saving..." : `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   1. CUSTOMER DASHBOARD
   ========================================== */
function CustomerDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Customer Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your authentic handloom collection seamlessly.</p>
        </div>
      </header>

      {activeTab === "home" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
                <div className="text-sm text-gray-500">No new notifications.</div>
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

      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" defaultValue="Customer User" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" rows={3}></textarea>
            </div>
            <button className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm mt-4">Save Changes</button>
          </div>
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
function WeaverDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  // Upload Form State
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("Saree");
  const [productDesc, setProductDesc] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [allowResellerMargin, setAllowResellerMargin] = useState(false);
  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);
  const [productImage, setProductImage] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  
  const [imgCaption, setImgCaption] = useState("");
  const [img2Caption, setImg2Caption] = useState("");
  const [img3Caption, setImg3Caption] = useState("");
  const [img4Caption, setImg4Caption] = useState("");

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
  const { orders } = useOrders();

  const weaverOrders = orders.filter(o => o.logisticsStatus !== "Delivered");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsUploading(true);
    try {
      const parsedPrice = Number(productPrice.toString().replace(/[^0-9.]/g, '')) || 0;
      const parsedMrp = Number(productMrp.toString().replace(/[^0-9.]/g, '')) || 0;

      const productData = {
        title: productName,
        slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        price: parsedPrice,
        mrp: parsedMrp,
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
        img: productImage || "https://images.unsplash.com/photo-1605814526362-790100f91eb8?w=800&q=80",
        img2: img2,
        img3: img3,
        img4: img4,
        images: [productImage, img2, img3, img4].filter(Boolean),
        imageCaptions: [imgCaption, img2Caption, img3Caption, img4Caption],
        stockQuantity: Number(stockQuantity),
        inStock: Number(stockQuantity) > 0,
        allowResellerMargin,
        resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,
        resellerPrice: allowResellerMargin ? String(Math.floor(parsedPrice * (1 - Number(resellerMarginPercentage) / 100))) : undefined,
      };

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), {
          ...productData,
          status: "pending", // Resubmit for QC on edit
          updatedAt: serverTimestamp(),
        });
        alert("Inventory updated successfully and submitted for QC!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          isBhuliaVerified: true,
          escrowStatus: "Payment Protected",
          sellerId: auth.currentUser?.uid,
          sellerType: "vendor",
          status: "pending",
          createdAt: serverTimestamp(),
        });
        alert("Inventory batch saved to Firestore and submitted for QC!");
      }
      
      setIsAddInventoryOpen(false);
      setEditingProductId(null);
      setProductName("");
      setProductPrice("");
      setProductMrp("");
      setProductDesc("");
      setProductLongDesc("");
      setColorUse("");
      setLength("");
      setOriginalWeaver("");
      setProductImage("");
      setImg2("");
      setImg3("");
      setImg4("");
      setImgCaption("");
      setImg2Caption("");
      setImg3Caption("");
      setImg4Caption("");
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Vendor Hub</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-500 font-medium">Manage your retail inventory and dispatch operations.</p>
            <a href={"/vendor/" + (storeName?.toLowerCase().replace(/\s+/g, '-') || 'demo')} target="_blank" className="text-xs font-bold text-[#0070F3] hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              View Storefront ↗
            </a>
          </div>
        </div>
        
      </header>

      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Inventory</h3>
            <div className="text-3xl font-black text-gray-900">{vendorProducts.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</h3>
            <div className="text-3xl font-black text-green-600">₹0</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Orders</h3>
            <div className="text-3xl font-black text-gray-900">{vendorOrders.length}</div>
          </div>
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

              {vendorProductsRaw.length > 0 && (
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending QC</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {vendorProductsRaw.length === 0 ? (
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
                      {vendorProducts.map(product => (
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
                          <td className="py-4 font-medium text-gray-500">{product.category || "Silk"}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              (product as any).status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                              (product as any).status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}>
                              {(product as any).status.charAt(0).toUpperCase() + (product as any).status.slice(1)}
                            </span>
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
              
              <form className="space-y-6" onSubmit={handleUpload}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Details */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selling Price (₹)</label>
                    <input type="text" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required placeholder="e.g. 34500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">MRP (₹)</label>
                    <input type="text" value={productMrp} onChange={e => setProductMrp(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required placeholder="e.g. 42000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Original Weaver Name</label>
                    <input type="text" value={originalWeaver} onChange={e => setOriginalWeaver(e.target.value)} placeholder="e.g. Sambalpuri Cooperative" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Description</label>
                    <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Long Artisan Story Description</label>
                    <textarea value={productLongDesc} onChange={e => setProductLongDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required rows={4} />
                  </div>
                  
                  {/* Specs */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Material</label>
                    <input list="materialList" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type material..." required />
                    <datalist id="materialList">
                      <option value="Pure Cotton" />
                      <option value="Pure Silk (Pata)" />
                      <option value="Mix Silk(Pata) (Silk+Polyster)" />
                      <option value="Mix Cotton (Cotton+Polyster)" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Design</label>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color Palette</label>
                    <input type="text" value={colorUse} onChange={e => setColorUse(e.target.value)} placeholder="e.g. Royal Blue & Gold" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Length</label>
                    <input type="text" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 6.2 Meters" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Blouse Status</label>
                    <select value={hasBlouse ? "true" : "false"} onChange={e => setHasBlouse(e.target.value === "true")} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all">
                      <option value="true">With Blouse Piece</option>
                      <option value="false">Without Blouse Piece</option>
                    </select>
                  </div>
                </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Stock Quantity</label>
                    <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 md:col-span-2">
                    <label className="flex items-start space-x-3 cursor-pointer mb-3">
                      <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="form-checkbox text-[#0070F3] rounded w-5 h-5 mt-0.5 focus:ring-[#0070F3]" />
                      <div>
                        <span className="text-sm text-gray-900 font-bold block">Allow Reseller Promotion?</span>
                        <span className="text-xs text-gray-500">Opt-in to allow resellers to market your product.</span>
                      </div>
                    </label>
                    {allowResellerMargin && (
                      <div className="animate-in fade-in slide-in-from-top-2 mt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Margin Percentage (Min 5%)</label>
                        <input type="number" min="5" max="90" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Math.max(5, Number(e.target.value)))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                        <div className="text-xs text-green-600 font-bold mt-2">
                          Resellers will sell this at a ₹{Math.floor(Number(productPrice || 0) * (Number(resellerMarginPercentage) / 100))} discount.
                        </div>
                      </div>
                    )}
                  </div>

                {/* Images Section */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Product Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <ImageUploader label="Main Photo" value={productImage} onChange={setProductImage} aspectRatio="portrait" captionValue={imgCaption} onCaptionChange={setImgCaption} />
                    <ImageUploader label="Photo 2" value={img2} onChange={setImg2} aspectRatio="portrait" captionValue={img2Caption} onCaptionChange={setImg2Caption} />
                    <ImageUploader label="Photo 3" value={img3} onChange={setImg3} aspectRatio="portrait" captionValue={img3Caption} onCaptionChange={setImg3Caption} />
                    <ImageUploader label="Photo 4" value={img4} onChange={setImg4} aspectRatio="portrait" captionValue={img4Caption} onCaptionChange={setImg4Caption} />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isUploading} className="w-full md:w-auto bg-[#0070F3] text-white px-8 py-3.5 font-bold rounded-xl disabled:opacity-50 hover:bg-[#005BB5] transition-colors shadow-sm">
                    {isUploading ? "Uploading to Database..." : "Submit Inventory for QC"}
                  </button>
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
                {vendorOrders.length > 0 ? vendorOrders.map(order => (
                  <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{order.orderId || order.id}</td>
                    <td className="py-4 px-4 text-gray-900 font-bold">{order.productName || "Proxy Order"}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                        {order.logisticsStatus || "Pending Sourcing"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {(!order.logisticsStatus || order.logisticsStatus === "Pending Sourcing") && (
                        <button 
                          onClick={async () => {
                            if (!confirm("Confirm dispatch to Bhulia QC Hub? This will generate a Shiprocket AWB.")) return;
                            try {
                              await updateDoc(doc(db, "orders", order.id), {
                                logisticsStatus: "Dispatched via Hub",
                                awbGenerated: true
                              });
                              alert(`Shiprocket AWB Generated Successfully for ${order.id}. Order is now tracked to QC Hub!`);
                            } catch (e) {
                              alert("Failed to generate AWB.");
                            }
                          }}
                          className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 transition-colors rounded-lg text-xs font-bold border border-green-200"
                        >
                          Dispatch to Hub
                        </button>
                      )}
                      {(order.logisticsStatus === "Dispatched via Hub") && (
                        <span className="text-xs text-gray-500 font-medium">AWB Generated</span>
                      )}
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
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pending Commissions</div>
              <div className="text-3xl font-black text-gray-900">₹0</div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Payouts</div>
              <div className="text-3xl font-black text-green-600">₹0</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Bank Details</h3>
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); alert("Bank details saved securely."); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Holder Name</label>
                  <input type="text" placeholder="As per bank records" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name</label>
                  <input type="text" placeholder="e.g. State Bank of India" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Number</label>
                  <input type="text" placeholder="Account Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IFSC Code</label>
                  <input type="text" placeholder="e.g. SBIN0001234" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none font-mono uppercase" required />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UPI Details (Optional)</label>
                  <input type="text" placeholder="yourname@upi" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none font-mono" />
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

      {activeTab === "marketing" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing & Promotions</h2>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">📢</div>
            <h3 className="font-bold text-blue-900 text-lg">Promote Your Store on the Homepage!</h3>
            <p className="text-blue-700 font-medium text-sm max-w-md">Marketing tools will be unlocked once your store completes 10 successful sales. Need early access? Request a promotion package.</p>
            <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors mt-2">
              Request Featured Placement
            </button>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Store Profile & KYC Settings</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <h3 className="text-yellow-800 font-bold text-sm mb-1">Privacy Enforcement Active</h3>
            <p className="text-yellow-700 text-xs font-medium">Your contact details (Phone & WhatsApp) are securely stored for internal Bhulia Hub operations. They are automatically masked and hidden from your public storefront to protect your privacy.</p>
          </div>

          <form className="space-y-8" onSubmit={handleSaveSettings}>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. Public Brand Info</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Name</label>
                    <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g. Sonepur Silk Emporium" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Public Description</label>
                    <input type="text" value={publicDesc} onChange={e => setPublicDesc(e.target.value)} placeholder="e.g. Authentic handlooms direct from weavers." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                  </div>
                </div>
                <div>
                  <ImageUploader
                    value={storeLogo}
                    onChange={setStoreLogo}
                    label="Store Logo"
                    aspectRatio="square"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Private Contact Details (Masked)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9999999999" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 9999999999" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">3. KYC & Verification Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">KYC Document Type</label>
                  <select value={kycType} onChange={e => setKycType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required>
                    <option value="">Select Document Type...</option>
                    <option value="gst">GST Registration Number</option>
                    <option value="udyam">Aadhaar Udyam Number</option>
                    <option value="aadhaar">Personal Aadhaar Card</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document ID / Number</label>
                  <input type="text" value={kycId} onChange={e => setKycId(e.target.value)} placeholder="Enter the ID number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none" required />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Document Scan (PDF/JPG)</label>
                  <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0070F3] file:text-white hover:file:bg-[#005BB5] border border-gray-200 rounded-xl p-2 cursor-pointer bg-white transition-all shadow-sm" accept=".pdf,.jpg,.jpeg,.png" required />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] disabled:opacity-50 transition-colors shadow-[0_4px_14px_0_rgb(229,113,56,0.39)] hover:shadow-[0_6px_20px_rgba(229,113,56,0.23)]">
                {isSaving ? "Saving..." : "Save Settings & Submit KYC"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


/* ==========================================
   4. RESELLER DASHBOARD
   ========================================== */
function ResellerDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const { products, loading: productsLoading } = useProducts();
  const resellerProducts = products.filter(p => p.allowResellerMargin === true);

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
      await addDoc(collection(db, "kyc_verifications"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        type: "identity",
        documentType: kycType,
        documentUrl: kycDocUrl,
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
      await addDoc(collection(db, "proxy_orders"), {
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
      alert("Proxy order secured in Firestore! Payment link dispatched.");
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
              <div className="text-3xl font-black text-green-600">₹0</div>
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
                    <img src={product.img} alt={product.title} className="w-full h-48 object-cover" />
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Full Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer WhatsApp/Phone</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN Code</label>
                <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unsettled Commissions</div>
              <div className="text-3xl font-black text-gray-900">₹0</div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Settled Payouts</div>
              <div className="text-3xl font-black text-green-600">₹0</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Bank Details</h3>
            <p className="text-sm text-gray-500 font-medium">No bank account linked. Please add your bank details for automated payouts.</p>
            <button className="mt-6 px-6 py-2.5 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors">Add Bank Account</button>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
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
    </div>
  );
}

/* ==========================================
   5. SUPER ADMIN DASHBOARD
   ========================================== */
function SuperAdminDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  const { products, loading: productsLoading } = useProducts();
  const { weavers, loading: weaversLoading } = useWeavers();
  const { vendors: stores, loading: storesLoading } = useVendors();
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

  const handleInspect = (item: any) => setSelectedItem(item);

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    const { id, type, data } = selectedItem;
    let updates: any = { status: "approved" };

    if (data.pendingChanges) {
      updates = { ...updates, ...data.pendingChanges, pendingChanges: null };
    }
    if (type === "products") {
      updates.isBhuliaVerified = true;
      updates.status = "approved";
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
    if (!confirm("Are you sure you want to reject this item?")) return;
    setIsSubmitting(true);
    const { id, type, data } = selectedItem;
    
    let updates: any = { status: "rejected" };
    if (data.pendingChanges) {
      updates = { status: "approved", pendingChanges: null };
    }
    
    const res = await updateDocumentStatus(type, id, updates);
    if (res.success) {
      alert("Application rejected.");
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
          <p className="text-gray-500 mt-2 font-medium">Manage KYC, Products, Logistics, and Escrow Finances.</p>
        </div>
      </header>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <PremiumMetricCard title="Total Catalog Value" value={<>₹{totalCatalogValue.toLocaleString()}</>} index={0} />
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Product Approvals (GI-Tag Validation)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <select value={order.logisticsStatus || (order as any).status || "Pending QC"} onChange={(e) => updateOrderStatus(order.id, "logisticsStatus", e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0070F3]">
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Escrow & Reseller Finance</h2>
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
                      <div className="text-xs font-bold text-gray-500 uppercase">{order.paymentMode || "Online"}</div>
                    </td>
                    <td className="py-4">
                      <select value={order.paymentStatus || (order as any).status || "Escrow Locked"} onChange={(e) => updateOrderStatus(order.id, "paymentStatus", e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0070F3]">
                        <option value="Escrow Locked">Escrow Locked</option>
                        <option value="placed">Placed (Cash)</option>
                        <option value="Payout Pending (Weaver)">Payout Pending (Weaver)</option>
                        <option value="Settled">Fully Settled</option>
                      </select>
                    </td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <button onClick={() => alert("Initiating Weaver Razorpay Route...")} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold">Release Escrow</button>
                      {(order.referralId || order.proxyBuyerId || (order as any).resellerId) && (
                        <button onClick={() => alert("Initiating Reseller Commission Payout...")} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold">Pay Comm.</button>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
              {Object.keys(selectedItem.data).filter(key => key !== "id" && key !== "status" && key !== "pendingChanges" && key !== "layoutConfig").map(key => (
                <div key={key} className="space-y-1">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">{key}</span>
                  <span className="text-sm font-medium text-gray-900">{String(selectedItem.data[key])}</span>
                </div>
              ))}
            </div>

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
