"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  useOrders,
  useProducts,
  useWeavers,
  useStores,
  useFranchises,
  updateDocumentStatus
} from "@/lib/db-hooks";

import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        document.cookie = `bhulia-auth-token=${user.uid}; path=/; max-age=86400`;
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
            setUserName(userDoc.data().name || user.email?.split("@")[0] || "User");
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
        <div className="w-12 h-12 border-4 border-[#E57138] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (role === "onboarding") {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  const isCustomer = role === "customer" || role === "user" || !role;
  const isSuperAdmin = role === "super_admin";
  const displayRole = role === "franchisee" ? "reseller" : role === "store" ? "vendor" : role;
  
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
          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 mb-6 focus:border-[#E57138] focus:outline-none focus:ring-1 focus:ring-[#E57138]"
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
          className="w-full bg-[#E57138] text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-[#D56128] transition-colors"
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
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#E57138]/30 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="text-sm text-gray-500">No recent orders found.</div>
              </div>
              <button onClick={() => onTabChange("orders")} className="mt-6 text-sm text-[#E57138] font-bold text-left w-max group-hover:underline">View All Orders →</button>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#E57138]/30 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Wishlist Preview</h3>
                <div className="text-sm text-gray-500">Your wishlist is empty.</div>
              </div>
              <button onClick={() => onTabChange("wishlist")} className="mt-6 text-sm text-[#E57138] font-bold text-left w-max group-hover:underline">View Wishlist →</button>
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
              <button key={f} className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-[#E57138] border border-gray-200 transition-colors">{f}</button>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between hover:border-gray-200 transition-colors">
            <div>
              <p className="text-sm font-bold text-gray-900">Order #ORD-99382</p>
              <p className="text-xs text-gray-500 mt-1">Status: Dispatched via Bhulia Hub</p>
            </div>
            <button className="px-5 py-2.5 bg-[#E57138] text-white text-xs font-bold rounded-xl hover:bg-[#D56128] transition-colors shadow-sm">Track Order (Bhulia Logistics)</button>
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
              <input type="text" placeholder="Subject" className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" />
              <textarea rows={4} placeholder="Describe your issue..." className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors"></textarea>
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
              <input type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#E57138] focus:outline-none" defaultValue="Customer User" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#E57138] focus:outline-none" rows={3}></textarea>
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
  const [isUploading, setIsUploading] = useState(false);
  const { orders } = useOrders();

  const weaverOrders = orders.filter(o => o.logisticsStatus !== "Delivered");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, "products"), {
        title: productName,
        price: Number(productPrice),
        category: productCategory,
        description: productDesc,
        ownerId: auth.currentUser.uid,
        ownerRole: "weaver",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Product saved to Firestore and sent for Admin Approval!");
      setProductName("");
      setProductPrice("");
      setProductDesc("");
      onTabChange("home");
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
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Master Weaver Hub</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your digital storefront and orders.</p>
        </div>
        <button onClick={() => onTabChange("upload")} className="bg-[#E57138] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#D56128] transition-colors shadow-sm self-start md:self-auto">
          + Upload Product
        </button>
      </header>

      {activeTab === "home" && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</h3>
              <div className="text-3xl font-black text-gray-900">₹0</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Subscription</h3>
              <div className="text-xl font-bold text-green-500 mt-1">Active</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Approvals</h3>
              <div className="text-3xl font-black text-gray-900">0</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">New Orders</h3>
              <div className="text-3xl font-black text-gray-900">0</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Notifications Timeline</h3>
            <div className="text-sm text-gray-500 font-medium">No recent activity.</div>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Upload New Sambalpuri Saree</h2>
          <form className="space-y-6" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selling Price (₹)</label>
                <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors">
                <option>Saree</option>
                <option>Dupatta</option>
                <option>Fabric</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description & Details</label>
              <textarea rows={4} value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Images (Max 4)</label>
              <div className="flex gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:border-[#E57138] hover:text-[#E57138] cursor-pointer transition-colors bg-gray-50">+</div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" className="form-checkbox text-[#E57138] rounded w-5 h-5 mt-0.5 focus:ring-[#E57138]" required />
                <span className="text-sm text-gray-700 font-medium">I declare that this is an authentic, handwoven Sambalpuri handloom product. I understand Bhulia.com strictly enforces GI-Tag authenticity.</span>
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">Save Draft</button>
              <button type="submit" disabled={isUploading} className="flex-1 bg-[#E57138] text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-[#D56128] transition-colors shadow-sm">
                {isUploading ? "Uploading to Database..." : "Submit for Approval"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Management</h2>
          <div className="overflow-x-auto">
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
                {weaverOrders.length > 0 ? weaverOrders.map(order => (
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

      {activeTab === "wallet" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Funds in Escrow (Pending QC)</div>
              <div className="text-3xl font-black text-gray-900">₹0</div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Completed Payouts</div>
              <div className="text-3xl font-black text-green-600">₹0</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Bank Details</h3>
            <p className="text-sm text-gray-500 font-medium">No bank account linked. Please add Jan Dhan or standard bank details for payouts.</p>
            <button className="mt-6 px-6 py-2.5 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors">Add Bank Account</button>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Identity & Subscription</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="font-bold text-gray-900 mb-1">KYC Documents</div>
                <div className="text-sm text-gray-500 font-medium">Aadhaar / Artisan Card</div>
              </div>
              <span className="px-4 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">Approved</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="font-bold text-gray-900 mb-1">Platform Subscription</div>
                <div className="text-sm text-gray-500 font-medium">₹5,000 / year</div>
              </div>
              <button className="bg-[#1f2937] text-white px-6 py-2.5 text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm">Renew Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ==========================================
   3. VENDOR / SHOP DASHBOARD
   ========================================== */
function VendorDashboard({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  // Upload Form State
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [originalWeaver, setOriginalWeaver] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [isUploading, setIsUploading] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState("");
  const [publicDesc, setPublicDesc] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [kycType, setKycType] = useState("");
  const [kycId, setKycId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { orders } = useOrders();

  const vendorOrders = orders.filter(o => o.logisticsStatus !== "Delivered");

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      // Create or update the store profile
      await updateDoc(doc(db, "stores", auth.currentUser.uid), {
        title: storeName,
        desc: publicDesc,
        img: storeLogo || "/bhulia-hero.png",
        heroImg: storeBanner,
        phone,
        whatsapp,
        kycType,
        kycId,
        status: "pending_approval",
        updatedAt: serverTimestamp()
      }).catch(async (error) => {
        // If it doesn't exist, create it
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "stores", auth.currentUser.uid), {
          id: auth.currentUser!.uid,
          slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: storeName,
          desc: publicDesc,
          img: storeLogo || "/bhulia-hero.png",
          heroImg: storeBanner,
          phone,
          whatsapp,
          kycType,
          kycId,
          tier: "Silver",
          status: "pending_approval",
          productLimit: 50,
          createdAt: serverTimestamp()
        });
      });
      alert("Settings saved successfully! KYC is under review.");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    }
    setIsSaving(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, "products"), {
        title: productName,
        price: Number(productPrice),
        originalWeaver: originalWeaver,
        stockQuantity: Number(stockQuantity),
        ownerId: auth.currentUser.uid,
        ownerRole: "vendor",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Inventory batch saved to Firestore and submitted for QC!");
      setProductName("");
      setProductPrice("");
      setOriginalWeaver("");
      setStockQuantity("1");
      onTabChange("home");
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
          <p className="text-gray-500 mt-2 font-medium">Manage your retail inventory and dispatch operations.</p>
        </div>
        <button onClick={() => onTabChange("upload")} className="bg-[#E57138] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#D56128] transition-colors shadow-sm self-start md:self-auto">
          + Add Inventory
        </button>
      </header>

      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Inventory</h3>
            <div className="text-3xl font-black text-gray-900">0</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</h3>
            <div className="text-3xl font-black text-green-600">₹0</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Orders</h3>
            <div className="text-3xl font-black text-gray-900">0</div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Upload New Inventory Batch</h2>
          <form className="space-y-6" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selling Price (₹)</label>
                <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Original Weaver Name</label>
                <select value={originalWeaver} onChange={e => setOriginalWeaver(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required>
                  <option value="">Select Weaver</option>
                  <option value="bargarh">Bargarh Cooperative</option>
                  <option value="sonepur">Sonepur Master Weavers</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Quantity</label>
                <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
            </div>
            <button type="submit" disabled={isUploading} className="w-full bg-[#E57138] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-[#D56128] transition-colors shadow-sm mt-4">
              {isUploading ? "Uploading to Database..." : "Submit Inventory for QC"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Management</h2>
          <div className="overflow-x-auto">
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
            <h3 className="font-bold text-gray-900 mb-4">Bank Details</h3>
            <p className="text-sm text-gray-500 font-medium">No bank account linked. Please add your business bank details for payouts.</p>
            <button className="mt-6 px-6 py-2.5 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors">Add Bank Account</button>
          </div>
        </div>
      )}

      {activeTab === "marketing" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Marketing & Promotions</h2>
          <p className="text-gray-500 font-medium">Marketing tools will be unlocked once your store completes 10 successful sales.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Name</label>
                  <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g. Sonepur Silk Emporium" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Public Description</label>
                  <input type="text" value={publicDesc} onChange={e => setPublicDesc(e.target.value)} placeholder="e.g. Authentic handlooms direct from weavers." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Logo (URL)</label>
                  <input type="text" value={storeLogo} onChange={e => setStoreLogo(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Banner Image (URL)</label>
                  <input type="text" value={storeBanner} onChange={e => setStoreBanner(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Private Contact Details (Masked)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9999999999" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 9999999999" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">3. KYC & Verification Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">KYC Document Type</label>
                  <select value={kycType} onChange={e => setKycType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" required>
                    <option value="">Select Document Type...</option>
                    <option value="gst">GST Registration Number</option>
                    <option value="udyam">Aadhaar Udyam Number</option>
                    <option value="aadhaar">Personal Aadhaar Card</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document ID / Number</label>
                  <input type="text" value={kycId} onChange={e => setKycId(e.target.value)} placeholder="Enter the ID number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Document Scan (PDF/JPG)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-500 font-medium text-sm">Click to upload or drag and drop your document file here</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-[#E57138] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D56128] disabled:opacity-50 transition-colors shadow-[0_4px_14px_0_rgb(229,113,56,0.39)] hover:shadow-[0_6px_20px_rgba(229,113,56,0.23)]">
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
  // Proxy Order State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const handleProxyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsOrdering(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName,
        customerPhone,
        pinCode,
        address,
        paymentMethod,
        resellerId: auth.currentUser.uid,
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
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-orange-500 text-xl shadow-sm shrink-0">⏳</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Activation Pending</h3>
              <p className="text-sm text-gray-600 mt-1">Our staff will contact you shortly to verify your identity and activate your storefront link.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">My Curated Products</h3>
              <div className="text-3xl font-black text-gray-900">0</div>
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
          <p className="text-gray-500 mb-8 font-medium">Browse the master catalog and select products to display on your personal link.</p>
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-medium">No products in catalog yet.</div>
        </div>
      )}

      {activeTab === "proxy" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Place Proxy Order</h2>
          <form className="space-y-6" onSubmit={handleProxyOrder}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Full Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer WhatsApp/Phone</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN Code</label>
                <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-[#E57138] focus:ring-1 focus:ring-[#E57138] focus:outline-none transition-colors" required>
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
            <button type="submit" disabled={isOrdering} className="w-full bg-[#E57138] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-[#D56128] transition-colors shadow-sm mt-4">
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
  const { stores, loading: storesLoading } = useStores();
  const { franchises, loading: franchisesLoading } = useFranchises();
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Catalog Value</h3>
              <p className="text-3xl font-black text-gray-900">₹{totalCatalogValue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Live Products</h3>
              <p className="text-3xl font-black text-[#E57138]">{productsLoading ? "..." : products.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verified Weavers</h3>
              <p className="text-3xl font-black text-[#E57138]">{weaversLoading ? "..." : weavers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Retail Stores</h3>
              <p className="text-3xl font-black text-[#E57138]">{storesLoading ? "..." : stores.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resellers</h3>
              <p className="text-3xl font-black text-[#E57138]">{franchisesLoading ? "..." : franchises.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Global Action Queue</h2>
            <div className="overflow-x-auto">
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
                        <span className="text-[#E57138] font-bold">Pending Review</span>
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
          <div className="overflow-x-auto">
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
              <div key={p.id} className="p-6 border border-gray-200 rounded-2xl flex flex-col justify-between group hover:border-[#E57138]/30 transition-colors">
                <div>
                  <div className="font-bold text-gray-900 mb-1">{p.title}</div>
                  <div className="text-sm font-bold text-[#E57138] mb-6">Price: {p.price}</div>
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
          <div className="overflow-x-auto">
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
                      <select value={order.logisticsStatus || (order as any).status || "Pending QC"} onChange={(e) => updateOrderStatus(order.id, "logisticsStatus", e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E57138]">
                        <option value="placed">Placed (Pending QC)</option>
                        <option value="QC Passed">QC Passed</option>
                        <option value="Pending Weaver Handover">Pending Weaver Handover</option>
                        <option value="Dispatched via Hub">Dispatched via Hub</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => alert("Shiprocket AWB creation will pop up here.")} className="text-sm text-[#E57138] font-bold hover:underline">Generate AWB</button>
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
          <div className="overflow-x-auto">
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
                      <div className="font-bold text-[#E57138]">{order.productPrice || "TBD"}</div>
                      <div className="text-xs font-bold text-gray-500 uppercase">{order.paymentMode || "Online"}</div>
                    </td>
                    <td className="py-4">
                      <select value={order.paymentStatus || (order as any).status || "Escrow Locked"} onChange={(e) => updateOrderStatus(order.id, "paymentStatus", e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E57138]">
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
                <span className="text-xs font-bold uppercase tracking-wider text-[#E57138]">Ecosystem Verification</span>
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
              <button onClick={handleApprove} disabled={isSubmitting} className="px-8 py-3 bg-[#E57138] text-white font-bold rounded-xl hover:bg-[#D56128] transition-colors shadow-sm disabled:opacity-50">Approve & Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
