"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import SupplierInventoryUpload from "@/components/dashboard/SupplierInventoryUpload";
import { useOrders, useProducts } from "@/lib/db-hooks";
import Image from "next/image";

export default function SupplierDashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userUid, setUserUid] = useState("");

  const { products } = useProducts();
  const { orders } = useOrders();

  const myMaterials = products.filter(p => p.sellerId === userUid && p.sellerType === "supplier");
  const myOrders = orders.filter(o => o.sellerId === userUid);

  // KYC state
  const [gstNumber, setGstNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [isSavingKyc, setIsSavingKyc] = useState(false);

  // Pricing State
  const [cottonPrice, setCottonPrice] = useState("3200");
  const [silkPrice, setSilkPrice] = useState("5500");

  useEffect(() => {
    const viewAsRole = localStorage.getItem("sd_view_as_role");
    if (viewAsRole === "supplier") {
      setUserName(localStorage.getItem("sd_view_as_name") || "Demo Supplier");
      setUserUid(localStorage.getItem("sd_view_as_uid") || "demo-supplier");
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
            if (actualRole !== "supplier") {
              router.push("/dashboard");
              return;
            }
            setUserName(userDoc.data().name || user.email?.split("@")[0] || "Supplier");
            setUserUid(user.uid);
            
            const storeDoc = await getDoc(doc(db, "stores", user.uid));
            if (storeDoc.exists()) {
              setGstNumber(storeDoc.data().gstNumber || "");
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
    { id: "profile", label: "Supplier Profile", icon: "🏢", category: "1. Profile & Setup" },
    { id: "home", label: "Inventory & Stock", icon: "📦", category: "Dashboard & Reports" },
    { id: "catalog", label: "Catalog Management", icon: "📋", category: "Catalog & Inventory" },
    { id: "pricing", label: "Market Rates Update", icon: "📉", category: "Catalog & Inventory" },
    { id: "crm", label: "Weaver CRM & Orders", icon: "🤝", category: "Orders & Logistics" },
  ];

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) return alert("Demo mode: Cannot save KYC.");
    setIsSavingKyc(true);
    try {
      await updateDoc(doc(db, "stores", userUid), {
        gstNumber,
        businessAddress
      });
      alert("Business Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
    setIsSavingKyc(false);
  };

  const totalStockKg = myMaterials.reduce((acc, curr) => acc + (Number(curr.stockKg) || 0), 0);

  return (
    <DashboardLayout
      userName={userName}
      userRole="supplier"
      userStatus="active"
      storeSlug="raw-materials"
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
            <h1 className="text-3xl font-black text-gray-900">Raw Material Supplier Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage yarn inventory, daily market rates, and weaver orders.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-800 px-4 py-2 rounded-xl font-bold border border-indigo-200">
            Supplier Mode Active
          </div>
        </div>

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
              <h3 className="text-gray-500 font-bold mb-1">Total Stock (Kg)</h3>
              <p className="text-4xl font-black text-indigo-900">{totalStockKg}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
              <h3 className="text-gray-500 font-bold mb-1">Active Materials</h3>
              <p className="text-4xl font-black text-emerald-900">{myMaterials.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
              <h3 className="text-gray-500 font-bold mb-1">Pending Orders</h3>
              <p className="text-4xl font-black text-amber-900">{myOrders.length}</p>
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="animate-in fade-in space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
                <p className="text-gray-500">Upload raw materials with B2B Pricing and custom MOQ.</p>
              </div>
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2"
              >
                <span>+</span> Add Raw Material
              </button>
            </div>

            {myMaterials.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-500 font-medium">You have no active raw materials in stock.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myMaterials.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-square relative bg-gray-100">
                      {m.img ? (
                        <Image src={m.img} alt={m.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">{m.stockKg} Kg STOCK</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{m.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{m.category} • {m.color}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Price / Kg</span>
                        <span className="text-lg font-black text-gray-900">₹{m.pricePerKg}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Market Rates</h2>
            <p className="text-gray-500 mb-8">Update your base market prices for standard yarn types. These are visible publicly to weavers.</p>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Cotton Yarn (Base)</h3>
                  <p className="text-xs text-gray-500">Per 10 Kg Bundle</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">₹</span>
                  <input type="number" value={cottonPrice} onChange={e => setCottonPrice(e.target.value)} className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold text-gray-900 focus:ring-2 focus:ring-[#0074E4] outline-none" />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Premium Silk Yarn</h3>
                  <p className="text-xs text-gray-500">Per Kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">₹</span>
                  <input type="number" value={silkPrice} onChange={e => setSilkPrice(e.target.value)} className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold text-gray-900 focus:ring-2 focus:ring-[#0074E4] outline-none" />
                </div>
              </div>

              <button className="w-full bg-[#051815] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#0a2f29] transition-colors shadow-lg mt-4">
                Publish New Rates
              </button>
            </div>
          </div>
        )}

        {activeTab === "crm" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weaver CRM & Orders</h2>
            {myOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-medium">No material orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-gray-100 rounded-tl-xl">Order ID</th>
                      <th className="p-4 font-bold border-b border-gray-100">Weaver</th>
                      <th className="p-4 font-bold border-b border-gray-100">Amount</th>
                      <th className="p-4 font-bold border-b border-gray-100">Status</th>
                      <th className="p-4 font-bold border-b border-gray-100 rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 text-sm font-medium text-gray-700">{order.customerName || 'Guest Weaver'}</td>
                        <td className="p-4 text-sm font-bold text-emerald-600">₹{order.total}</td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-indigo-600 font-bold text-xs hover:underline">Process Order</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Supplier Profile & KYC</h2>
            <form onSubmit={handleSaveKyc} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Address / Godown</label>
                <textarea 
                  value={businessAddress}
                  onChange={e => setBusinessAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0074E4] outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                  rows={3}
                  placeholder="Full business address..."
                />
              </div>
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
              <button 
                type="submit" 
                disabled={isSavingKyc}
                className="w-full bg-[#0074E4] text-white font-bold py-3 rounded-xl hover:bg-[#005bb5] transition-colors disabled:opacity-50"
              >
                {isSavingKyc ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        )}

        <SupplierInventoryUpload 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          sellerId={userUid}
        />
      </div>
    </DashboardLayout>
  );
}
