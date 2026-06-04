"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useOrders } from "@/lib/db-hooks";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        document.cookie = `bhulia-auth-token=${user.uid}; path=/; max-age=86400`;
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
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
      <div className="min-h-screen flex items-center justify-center bg-bhulia-bg">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (role === "onboarding") {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  const isCustomer = role === "customer" || role === "user" || !role;
  const displayRole = role === "franchisee" ? "reseller" : role === "store" ? "vendor" : role;

  return (
    <div className={`min-h-screen ${isCustomer ? "bg-[#EBF5FB] text-gray-900" : "bg-[#051815] text-white"} p-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-display capitalize ${isCustomer ? "text-[#1A5276]" : "bhulia-gold-text"}`}>
            {isCustomer ? "Customer" : displayRole} Dashboard
          </h1>
          <button 
            onClick={() => auth.signOut()}
            className={`px-4 py-2 rounded transition-colors ${isCustomer ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-red-900/50 text-red-200 hover:bg-red-800/50"}`}
          >
            Sign Out
          </button>
        </div>

        {isCustomer && <CustomerDashboard />}
        {role === "weaver" && <WeaverDashboard />}
        {(role === "vendor" || role === "store") && <VendorDashboard />}
        {(role === "reseller" || role === "franchisee") && <ResellerDashboard />}
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

/* ==========================================
   1. CUSTOMER DASHBOARD (LIGHT/PASTEL THEME)
   ========================================== */
function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("home");

  const NavButton = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-all ${activeTab === id ? "bg-white text-[#1A5276] shadow-sm border-t-2 border-[#3498DB]" : "text-gray-500 hover:text-[#1A5276]"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-gray-200">
        <NavButton id="home" label="Home" />
        <NavButton id="orders" label="My Orders" />
        <NavButton id="wishlist" label="Wishlist" />
        <NavButton id="messages" label="Messages" />
        <NavButton id="support" label="Support" />
        <NavButton id="profile" label="Profile" />
      </div>

      <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-lg border border-blue-50 min-h-[500px]">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-[#D6EAF8] to-[#EBF5FB] p-8 rounded-xl border border-blue-100">
              <h2 className="text-3xl font-display text-[#1A5276] mb-2">Welcome back!</h2>
              <p className="text-[#2874A6]">Manage your authentic handloom collection seamlessly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#FDFEFE] rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-[#1A5276] mb-4">Recent Orders</h3>
                <div className="text-sm text-gray-500">No recent orders found.</div>
                <button onClick={() => setActiveTab("orders")} className="mt-4 text-sm text-[#3498DB] font-semibold">View All Orders →</button>
              </div>
              <div className="p-6 bg-[#FDFEFE] rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-[#1A5276] mb-4">Wishlist Preview</h3>
                <div className="text-sm text-gray-500">Your wishlist is empty.</div>
                <button onClick={() => setActiveTab("wishlist")} className="mt-4 text-sm text-[#3498DB] font-semibold">View Wishlist →</button>
              </div>
              <div className="p-6 bg-[#FDFEFE] rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-[#1A5276] mb-4">Notifications</h3>
                <div className="text-sm text-gray-500">No new notifications.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex gap-2 mb-6">
              {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
                <button key={f} className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200">{f}</button>
              ))}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1A5276]">Order #ORD-99382</p>
                <p className="text-xs text-gray-500">Status: Dispatched via Bhulia Hub</p>
              </div>
              <button className="px-4 py-2 bg-[#3498DB] text-white text-xs font-bold rounded-lg hover:bg-[#2980B9]">Track Order (Bhulia Logistics)</button>
            </div>
            <div className="text-center py-8 text-gray-400 text-sm">End of order history.</div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-[#1A5276]">Saved Items</h2>
            <div className="text-center py-12 text-gray-400">Your wishlist is currently empty.</div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-[#1A5276]">Direct Messages</h2>
            <div className="flex gap-4">
              <div className="w-1/3 border-r pr-4">
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">No active conversations</div>
              </div>
              <div className="w-2/3 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 min-h-[300px]">
                Select a chat to start messaging
              </div>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="space-y-6 animate-in fade-in max-w-2xl">
            <h2 className="text-xl font-bold text-[#1A5276]">Contact Support & Shops</h2>
            <p className="text-sm text-gray-500 mb-4">Your privacy is protected. Contact sellers directly via masked hub routing.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex items-center justify-center gap-2 py-4 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition-colors">
                <span>WhatsApp Shop (Masked)</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                <span>Call Shop (Masked)</span>
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Raise a Ticket</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Subject" className="w-full border-gray-300 rounded p-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
                <textarea rows={4} placeholder="Describe your issue..." className="w-full border-gray-300 rounded p-2 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"></textarea>
                <button type="button" className="bg-[#1A5276] text-white px-6 py-2 rounded font-semibold hover:bg-[#154360]">Submit Ticket</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in max-w-xl">
            <h2 className="text-xl font-bold text-[#1A5276]">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input type="text" className="w-full border border-gray-300 rounded p-2" defaultValue="Customer User" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input type="email" className="w-full border border-gray-300 rounded p-2 bg-gray-50" disabled />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Shipping Address</label>
                <textarea className="w-full border border-gray-300 rounded p-2" rows={3}></textarea>
              </div>
              <button className="bg-[#1A5276] text-white px-6 py-2 rounded font-semibold">Save Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ==========================================
   2. WEAVER DASHBOARD (DARK/GOLD THEME)
   ========================================== */
function WeaverDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  
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
      setActiveTab("home");
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
    setIsUploading(false);
  };
  
  const NavButton = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-semibold text-sm transition-all ${activeTab === id ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-800 mb-6 overflow-x-auto custom-scrollbar">
        <NavButton id="home" label="Home Overview" />
        <NavButton id="upload" label="Upload Product" />
        <NavButton id="orders" label="My Orders" />
        <NavButton id="wallet" label="Wallet" />
        <NavButton id="verification" label="Verification" />
      </div>

      {activeTab === "home" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bhulia-premium-card p-6 border-t-4 border-t-[#C5A059]">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Wallet Balance</h3>
              <div className="text-3xl font-display bhulia-gold-text">₹0</div>
            </div>
            <div className="bhulia-premium-card p-6 border-t-4 border-t-green-600">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Subscription</h3>
              <div className="text-xl font-semibold text-green-500 mt-1">Active</div>
            </div>
            <div className="bhulia-premium-card p-6 border-t-4 border-t-yellow-500">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Pending Approvals</h3>
              <div className="text-3xl font-display text-white">0</div>
            </div>
            <div className="bhulia-premium-card p-6 border-t-4 border-t-blue-500">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">New Orders</h3>
              <div className="text-3xl font-display text-white">0</div>
            </div>
          </div>
          <div className="bhulia-premium-card p-6">
            <h3 className="text-lg font-display bhulia-gold-text mb-4">Notifications Timeline</h3>
            <div className="text-sm text-gray-500">No recent activity.</div>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="bhulia-premium-card p-8 max-w-3xl animate-in fade-in">
          <h2 className="text-2xl font-display bhulia-gold-text mb-6">Upload New Sambalpuri Saree</h2>
          <form className="space-y-6" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Product Name</label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Selling Price (₹)</label>
                <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Category</label>
              <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]">
                <option>Saree</option>
                <option>Dupatta</option>
                <option>Fabric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Description & Details</label>
              <textarea rows={4} value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Upload Images (Max 4)</label>
              <div className="flex gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-24 h-24 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-500 hover:border-[#C5A059] cursor-pointer transition-colors">+</div>
                ))}
              </div>
            </div>
            <div className="bg-[#0B2B26] p-4 rounded border border-[#C5A059]/30">
              <label className="flex items-start space-x-3">
                <input type="checkbox" className="form-checkbox text-[#C5A059] rounded w-5 h-5 mt-0.5" required />
                <span className="text-sm text-gray-300">I declare that this is an authentic, handwoven Sambalpuri handloom product. I understand Bhulia.com strictly enforces GI-Tag authenticity.</span>
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" className="flex-1 bg-[#051815] border border-gray-700 text-white py-3 rounded hover:bg-gray-800 transition-colors">Save Draft</button>
              <button type="submit" disabled={isUploading} className="flex-1 bhulia-gold-button py-3 rounded disabled:opacity-50">
                {isUploading ? "Uploading to Database..." : "Submit for Approval"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bhulia-premium-card p-6 animate-in fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-6">Order Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs uppercase tracking-widest text-gray-500">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {weaverOrders.length > 0 ? weaverOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-800 text-sm">
                    <td className="py-4 text-gray-300 font-mono text-xs">{order.orderId || order.id}</td>
                    <td className="py-4 text-white font-semibold">{order.productName || "Proxy Order"}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded text-xs">
                        {order.logisticsStatus || "Pending Sourcing"}
                      </span>
                    </td>
                    <td className="py-4">
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
                          className="px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-800/50 transition-colors rounded text-xs uppercase tracking-wider font-bold"
                        >
                          Send to Bhulia Hub (Generate AWB)
                        </button>
                      )}
                      {(order.logisticsStatus === "Dispatched via Hub") && (
                        <span className="text-xs text-gray-500 italic">AWB Generated. En Route to Hub.</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">No active orders to dispatch.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bhulia-premium-card p-6 border-l-4 border-l-yellow-500">
              <div className="text-sm text-gray-400 mb-1">Funds in Escrow (Pending QC)</div>
              <div className="text-2xl font-bold text-white">₹0</div>
            </div>
            <div className="bhulia-premium-card p-6 border-l-4 border-l-green-500">
              <div className="text-sm text-gray-400 mb-1">Completed Payouts</div>
              <div className="text-2xl font-bold text-[#C5A059]">₹0</div>
            </div>
          </div>
          <div className="bhulia-premium-card p-6">
            <h3 className="font-display text-[#C5A059] mb-4">Bank Details</h3>
            <p className="text-sm text-gray-400">No bank account linked. Please add Jan Dhan or standard bank details for payouts.</p>
            <button className="mt-4 px-4 py-2 border border-[#C5A059] text-[#C5A059] rounded text-sm hover:bg-[#C5A059]/10">Add Bank Account</button>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="bhulia-premium-card p-8 max-w-2xl animate-in fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-6">Identity & Subscription</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-[#0B2B26] rounded border border-gray-800">
              <div>
                <div className="font-bold text-white mb-1">KYC Documents</div>
                <div className="text-xs text-gray-400">Aadhaar / Artisan Card</div>
              </div>
              <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-full text-xs font-semibold">Approved</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#0B2B26] rounded border border-gray-800">
              <div>
                <div className="font-bold text-white mb-1">Platform Subscription</div>
                <div className="text-xs text-gray-400">₹5,000 / year</div>
              </div>
              <button className="bhulia-gold-button px-4 py-2 text-sm rounded">Renew Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ==========================================
   3. VENDOR / SHOP DASHBOARD (DARK THEME)
   ========================================== */
function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  
  // Upload Form State
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [originalWeaver, setOriginalWeaver] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [isUploading, setIsUploading] = useState(false);
  const { orders } = useOrders();

  const vendorOrders = orders.filter(o => o.logisticsStatus !== "Delivered");

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
      setActiveTab("home");
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
    setIsUploading(false);
  };

  const NavButton = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-semibold text-sm transition-all ${activeTab === id ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-800 mb-6 overflow-x-auto custom-scrollbar">
        <NavButton id="home" label="Overview" />
        <NavButton id="upload" label="Upload Inventory" />
        <NavButton id="orders" label="Manage Orders" />
        <NavButton id="wallet" label="Wallet" />
        <NavButton id="verification" label="Verification" />
      </div>

      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          <div className="bhulia-premium-card p-6 border-t-4 border-t-blue-500">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Inventory</h3>
            <div className="text-3xl font-display text-white">0</div>
          </div>
          <div className="bhulia-premium-card p-6 border-t-4 border-t-[#C5A059]">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Wallet</h3>
            <div className="text-3xl font-display bhulia-gold-text">₹0</div>
          </div>
          <div className="bhulia-premium-card p-6 border-t-4 border-t-yellow-500">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Pending Orders</h3>
            <div className="text-3xl font-display text-white">0</div>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="bhulia-premium-card p-8 max-w-3xl animate-in fade-in">
          <h2 className="text-2xl font-display bhulia-gold-text mb-6">Upload New Inventory Batch</h2>
          <form className="space-y-6" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Product Name</label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Selling Price (₹)</label>
                <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Original Weaver Name</label>
                <select value={originalWeaver} onChange={e => setOriginalWeaver(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required>
                  <option value="">Select Weaver</option>
                  <option value="bargarh">Bargarh Cooperative</option>
                  <option value="sonepur">Sonepur Master Weavers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Stock Quantity</label>
                <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white focus:border-[#C5A059]" required />
              </div>
            </div>
            <button type="submit" disabled={isUploading} className="bhulia-gold-button w-full py-3 rounded mt-4 disabled:opacity-50">
              {isUploading ? "Uploading to Database..." : "Submit Inventory for QC"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bhulia-premium-card p-6 animate-in fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-6">Order Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs uppercase tracking-widest text-gray-500">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendorOrders.length > 0 ? vendorOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-800 text-sm">
                    <td className="py-4 text-gray-300 font-mono text-xs">{order.orderId || order.id}</td>
                    <td className="py-4 text-white font-semibold">{order.productName || "Proxy Order"}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded text-xs">
                        {order.logisticsStatus || "Pending Sourcing"}
                      </span>
                    </td>
                    <td className="py-4">
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
                          className="px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-800/50 transition-colors rounded text-xs uppercase tracking-wider font-bold"
                        >
                          Send to Bhulia Hub (Generate AWB)
                        </button>
                      )}
                      {(order.logisticsStatus === "Dispatched via Hub") && (
                        <span className="text-xs text-gray-500 italic">AWB Generated. En Route to Hub.</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">No active orders to dispatch.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="bhulia-premium-card p-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-l-4 border-l-yellow-500 bg-[#0B2B26]">
              <div className="text-sm text-gray-400 mb-1">Pending Commissions</div>
              <div className="text-2xl font-bold text-white">₹0</div>
            </div>
            <div className="p-6 border-l-4 border-l-green-500 bg-[#0B2B26]">
              <div className="text-sm text-gray-400 mb-1">Total Payouts</div>
              <div className="text-2xl font-bold text-[#C5A059]">₹0</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="bhulia-premium-card p-8 max-w-2xl animate-in fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-6">Shop Verification & Subscription</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-[#0B2B26] rounded border border-gray-800">
              <div>
                <div className="font-bold text-white mb-1">Vendor KYC</div>
                <div className="text-xs text-gray-400">GST / Trade License</div>
              </div>
              <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-full text-xs font-semibold">Approved</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#0B2B26] rounded border border-gray-800">
              <div>
                <div className="font-bold text-white mb-1">Vendor Subscription</div>
                <div className="text-xs text-gray-400">₹10,000 / year</div>
              </div>
              <button className="bhulia-gold-button px-4 py-2 text-sm rounded">Renew Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ==========================================
   4. RESELLER DASHBOARD (DARK THEME)
   ========================================== */
function ResellerDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  
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
      setActiveTab("home");
    } catch (error) {
      console.error(error);
      alert("Failed to place proxy order.");
    }
    setIsOrdering(false);
  };

  const NavButton = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-semibold text-sm transition-all ${activeTab === id ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-gray-500 hover:text-gray-300"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-800 mb-6 overflow-x-auto custom-scrollbar">
        <NavButton id="home" label="Home" />
        <NavButton id="curation" label="Store Curation" />
        <NavButton id="proxy" label="Proxy Orders" />
        <NavButton id="wallet" label="Commissions" />
        <NavButton id="verification" label="Verification" />
      </div>
      
      {activeTab === "home" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center text-yellow-500">⏳</div>
            <div>
              <h3 className="font-bold text-yellow-500">Activation Pending</h3>
              <p className="text-sm text-yellow-200/70">Our staff will contact you shortly to verify your identity and activate your storefront link.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bhulia-premium-card p-6 border-l-4 border-l-[#C5A059]">
              <div className="text-sm text-gray-400 mb-1">Wallet Balance</div>
              <div className="text-3xl font-display bhulia-gold-text">₹0</div>
            </div>
            <div className="bhulia-premium-card p-6 border-l-4 border-l-blue-500">
              <div className="text-sm text-gray-400 mb-1">Curated Products on Shelf</div>
              <div className="text-3xl font-display text-white">0</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "curation" && (
        <div className="bhulia-premium-card p-8 animate-in fade-in">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-display bhulia-gold-text">Curate Your Shelf</h2>
              <p className="text-sm text-gray-400 mt-1">Select global products to feature on your personal Reseller link.</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-[#051815] border border-gray-700 text-sm text-white p-2 rounded"><option>Category</option></select>
              <select className="bg-[#051815] border border-gray-700 text-sm text-white p-2 rounded"><option>Price</option></select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
            <div className="bg-[#051815] border border-gray-800 p-8 rounded-xl text-center text-gray-500 col-span-full">Global catalog is currently empty.</div>
          </div>
        </div>
      )}
      
      {activeTab === "proxy" && (
        <div className="bhulia-premium-card p-8 max-w-2xl animate-in fade-in">
          <h2 className="text-xl font-display bhulia-gold-text mb-6">Place Proxy Order</h2>
          <form className="space-y-4" onSubmit={handleProxyOrder}>
             <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Full Name" className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white" required />
             <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Customer Phone (For payment link)" className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white" required />
             <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="Delivery PIN Code" className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white" required />
             <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete Delivery Address" rows={3} className="w-full bg-[#051815] border border-gray-700 rounded p-3 text-white" required></textarea>
             
             <div className="pt-4">
               <label className="block text-sm text-gray-400 mb-2">Select Payment Method</label>
               <div className="flex gap-4">
                 <label className="flex items-center gap-2 text-white bg-[#0B2B26] p-3 rounded border border-gray-700 flex-1 cursor-pointer hover:border-[#C5A059]">
                   <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={e => setPaymentMethod(e.target.value)} required /> Send Online Link
                 </label>
                 <label className="flex items-center gap-2 text-white bg-[#0B2B26] p-3 rounded border border-gray-700 flex-1 cursor-pointer hover:border-[#C5A059]">
                   <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={e => setPaymentMethod(e.target.value)} required /> Cash Received
                 </label>
               </div>
             </div>
             
             <button type="submit" disabled={isOrdering} className="bhulia-gold-button w-full py-4 rounded font-bold tracking-wider mt-4 disabled:opacity-50">
               {isOrdering ? "Writing to Database..." : "LOCK ORDER"}
             </button>
          </form>
        </div>
      )}

      {(activeTab === "wallet" || activeTab === "verification") && (
        <div className="bhulia-premium-card p-8 text-center text-gray-500 animate-in fade-in">
          {activeTab === "wallet" ? "No commissions earned yet." : "KYC Verification module loading..."}
        </div>
      )}
    </div>
  );
}
