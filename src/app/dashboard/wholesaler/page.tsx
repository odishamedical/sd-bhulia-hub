"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

export default function WholesalerDashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check demo mode override first
    const viewAsRole = localStorage.getItem("sd_view_as_role");
    if (viewAsRole === "wholesaler") {
      setUserName(localStorage.getItem("sd_view_as_name") || "Demo Wholesaler");
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
              // Redirect non-wholesalers back to main dashboard
              router.push("/dashboard");
              return;
            }
            setUserName(userDoc.data().name || user.email?.split("@")[0] || "Wholesaler");
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
    { id: "home", label: "Overview & Insights", icon: "📊", category: "Dashboard & Reports" },
    { id: "catalog", label: "Bulk Catalog Management", icon: "📦", category: "Catalog & Inventory" },
    { id: "orders", label: "B2B Orders & Fulfillment", icon: "🚚", category: "Orders & Logistics" },
    { id: "kyc", label: "Business Profile & KYC", icon: "🏢", category: "User Management" },
  ];

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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-black text-gray-900">B2B Wholesaler Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your bulk catalog, MOQ pricing, and B2B orders.</p>
        </div>

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 font-bold mb-1">Total Bulk Orders</h3>
              <p className="text-4xl font-black text-[#0074E4]">0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 font-bold mb-1">Active B2B Products</h3>
              <p className="text-4xl font-black text-emerald-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 font-bold mb-1">Pending Receivables</h3>
              <p className="text-4xl font-black text-amber-600">₹0</p>
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tri-Tier Pricing Catalog</h2>
            <p className="text-gray-500 mb-6">Upload products with Retail MSRP, B2B Tiered Bulk Pricing, and Reseller Base Price.</p>
            <button className="bg-[#0074E4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005bb5] transition-colors shadow-lg">
              + Add B2B Product
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
