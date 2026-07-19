"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import UniversalProductUpload from "@/components/dashboard/UniversalProductUpload";
import { useOrders, useProducts } from "@/lib/db-hooks";
import Image from "next/image";

export default function WholesalerDashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userUid, setUserUid] = useState("");

  const { products } = useProducts();
  const { orders } = useOrders();

  const myProducts = products.filter(p => p.sellerId === userUid && p.availableForWholesale);
  const myOrders = orders.filter(o => o.sellerId === userUid && o.isB2B);

  // KYC state
  const [gstNumber, setGstNumber] = useState("");
  const [udyamNumber, setUdyamNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [isSavingKyc, setIsSavingKyc] = useState(false);

  useEffect(() => {
    const viewAsRole = localStorage.getItem("sd_view_as_role");
    if (viewAsRole === "wholesaler") {
      setUserName(localStorage.getItem("sd_view_as_name") || "Demo Wholesaler");
      setUserUid(localStorage.getItem("sd_view_as_uid") || "demo-wholesaler");
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const actualRole = userDoc.data().role;
            if (actualRole !== "wholesaler") {
              router.push("/dashboard");
              return;
            }
            setUserName(userDoc.data().name || user.email?.split("@")[0] || "Wholesaler");
            setUserUid(user.uid);
            
            const storeDoc = await getDoc(doc(db, "stores", user.uid));
            if (storeDoc.exists()) {
              setGstNumber(storeDoc.data().gstNumber || "");
              setUdyamNumber(storeDoc.data().udyamNumber || "");
              setBusinessAddress(storeDoc.data().businessAddress || "");
            }
          }
        } catch (error) {
          console.error("Error fetching user role", error);
        }
      } else {
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

  const navItems: NavItem[] = [
    { id: "kyc", label: "Business Profile & KYC", icon: "🏢", category: "1. Profile & Setup" },
    { id: "home", label: "Overview & Insights", icon: "📊", category: "Dashboard & Reports" },
    { id: "catalog", label: "Bulk Catalog Management", icon: "📦", category: "Catalog & Inventory" },
    { id: "orders", label: "B2B Orders & Fulfillment", icon: "🚚", category: "Orders & Logistics" },
    { id: "finance", label: "Finance & Payouts", icon: "💰", category: "Orders & Logistics" },
  ];

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) return alert("Demo mode: Cannot save KYC.");
    setIsSavingKyc(true);
    try {
      await updateDoc(doc(db, "stores", userUid), {
        gstNumber,
        udyamNumber,
        businessAddress
      });
      alert("Business Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
    setIsSavingKyc(false);
  };

  return (
    <DashboardLayout
      userName={userName}
      userRole="wholesaler"
      userStatus="active"
      storeSlug="b2b-store"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      navItems={navItems}
      globalNotifications={[]}
      isSuperAdminViewAs={isDemoMode}
      isSellerMode={true}
      setIsSellerMode={() => router.push("/dashboard")}
    >
      <div className="p-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">B2B Wholesaler Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your bulk catalog, MOQ pricing, and B2B orders.</p>
          </div>
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl font-bold border border-blue-200">
            Wholesale Mode Active
          </div>
        </div>

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
              <h3 className="text-gray-500 font-bold mb-1">Total Bulk Orders</h3>
              <p className="text-4xl font-black text-[#0074E4]">{myOrders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-500">
              <h3 className="text-gray-500 font-bold mb-1">Active B2B Products</h3>
              <p className="text-4xl font-black text-emerald-600">{myProducts.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-amber-500">
              <h3 className="text-gray-500 font-bold mb-1">Pending Receivables</h3>
              <p className="text-4xl font-black text-amber-600">₹0</p>
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="animate-in fade-in space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Catalog Management</h2>
                <p className="text-gray-500">Upload products with B2B Tiered Bulk Pricing and custom MOQ.</p>
              </div>
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-[#0074E4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005bb5] transition-colors shadow-lg flex items-center gap-2"
              >
                <span>+</span> Add B2B Product
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-500 font-medium">You have no active B2B products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-video relative bg-gray-100">
                      {p.img ? (
                        <Image src={p.img} alt={p.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">B2B ACTIVE</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{p.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Wholesale Price</span>
                        <span className="text-lg font-black text-emerald-600">₹{p.commercialPrice || p.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">Terms: {p.wholesaleTerms || 'Standard MOQ'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">B2B Orders & Fulfillment</h2>
            {myOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-medium">No wholesale orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-gray-100 rounded-tl-xl">Order ID</th>
                      <th className="p-4 font-bold border-b border-gray-100">Date</th>
                      <th className="p-4 font-bold border-b border-gray-100">Amount</th>
                      <th className="p-4 font-bold border-b border-gray-100">Status</th>
                      <th className="p-4 font-bold border-b border-gray-100 rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 text-sm text-gray-500">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                        <td className="p-4 text-sm font-bold text-emerald-600">₹{order.total}</td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-[#0074E4] font-bold text-xs hover:underline">Manage Shipment</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "finance" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Finance & Payouts</h2>
            <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No active payout methods</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Add your business bank account details to receive your B2B settlements directly.</p>
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all">
                Add Bank Account
              </button>
            </div>
          </div>
        )}

        {activeTab === "kyc" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Profile & KYC</h2>
            <form onSubmit={handleSaveKyc} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Address</label>
                <textarea 
                  value={businessAddress}
                  onChange={e => setBusinessAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                  rows={3}
                  placeholder="Full business address..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">GST Number</label>
                  <input 
                    type="text" 
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all uppercase bg-gray-50 focus:bg-white"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Udyam Registration</label>
                  <input 
                    type="text" 
                    value={udyamNumber}
                    onChange={e => setUdyamNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all uppercase bg-gray-50 focus:bg-white"
                    placeholder="UDYAM-XX-00-0000000"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSavingKyc}
                className="w-full bg-[#0074E4] text-white font-bold py-3 rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50"
              >
                {isSavingKyc ? "Saving..." : "Save Business Profile"}
              </button>
            </form>
          </div>
        )}

        <UniversalProductUpload 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          sellerRole="wholesaler"
          sellerId={userUid}
        />
      </div>
    </DashboardLayout>
  );
}
