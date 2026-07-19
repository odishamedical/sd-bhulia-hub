"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  price: string;
  img: string;
  allowResellerMargin: boolean;
  resellerMarginPercentage: number;
  slug: string;
  sellerId: string;
}

interface CommissionTrack {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  amount: number;
  status: "pending" | "cleared" | "paid";
  createdAt: string;
}

export default function ResellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userUid, setUserUid] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [promotableProducts, setPromotableProducts] = useState<Product[]>([]);
  const [commissions, setCommissions] = useState<CommissionTrack[]>([]);
  
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalSignups, setTotalSignups] = useState(0);
  
  const router = useRouter();

  // 1. Auth & Identity Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            if (role === "reseller" || role === "super_admin") {
              setUserName(userDoc.data().name || "Reseller");
              setUserUid(user.uid);
              setTotalClicks(userDoc.data().totalClicks || 0);
              setTotalSignups(userDoc.data().totalSignups || 0);
            } else {
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Fetch Promotable Products & Commissions (No Mock Data)
  useEffect(() => {
    if (!userUid) return;

    // Fetch Products where allowResellerMargin is true
    const productsQ = query(collection(db, "products"), where("allowResellerMargin", "==", true));
    const unsubProducts = onSnapshot(productsQ, (snapshot) => {
      const pData: Product[] = [];
      snapshot.forEach(doc => pData.push({ id: doc.id, ...doc.data() } as Product));
      setPromotableProducts(pData);
    });

    // Fetch Commissions for this Reseller
    const commsQ = query(collection(db, "reseller_commissions"), where("resellerId", "==", userUid));
    const unsubComms = onSnapshot(commsQ, (snapshot) => {
      const cData: CommissionTrack[] = [];
      snapshot.forEach(doc => cData.push({ id: doc.id, ...doc.data() } as CommissionTrack));
      // Sort by newest
      cData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCommissions(cData);
    });

    return () => {
      unsubProducts();
      unsubComms();
    };
  }, [userUid]);

  const copyRefLink = (slug: string) => {
    const link = `${window.location.origin}/product/${slug}?ref=${userUid}`;
    navigator.clipboard.writeText(link);
    alert(`Link copied! When customers buy using this link, you earn commission.\n\n${link}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems: NavItem[] = [
    { id: "home", label: "Financial Ledger", icon: "📊", category: "Performance" },
    { id: "promo_hub", label: "Promotional Hub", icon: "📢", category: "Marketing" },
    { id: "payouts", label: "Withdrawals", icon: "💸", category: "Finance" },
  ];

  // Calculations
  const pendingCommissions = commissions.filter(c => c.status === "pending").reduce((acc, curr) => acc + curr.amount, 0);
  const clearedCommissions = commissions.filter(c => c.status === "cleared").reduce((acc, curr) => acc + curr.amount, 0);
  const paidCommissions = commissions.filter(c => c.status === "paid").reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <DashboardLayout
      userName={userName}
      userRole="reseller"
      userStatus="active"
      storeSlug={`reseller-${userUid}`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={navItems}
      globalNotifications={[]}
      isSuperAdminViewAs={false}
      isSellerMode={true}
      setIsSellerMode={() => router.push("/dashboard")}
    >
      <div className="p-6">
        
        {/* Header Block */}
        <div className="bg-gradient-to-r from-orange-900 to-amber-900 rounded-3xl p-8 shadow-xl border border-orange-500/30 mb-8 flex justify-between items-center text-white">
          <div>
            <h1 className="text-3xl font-black mb-2">Reseller Hub</h1>
            <p className="text-orange-200">Welcome, {userName}. Share products, drive sales, and earn commissions.</p>
          </div>
          <div className="hidden md:block bg-black/20 p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] text-orange-200 uppercase font-bold tracking-widest mb-1">Your Reseller ID</p>
            <p className="text-xl font-mono font-bold text-white tracking-widest">{userUid.substring(0, 8)}</p>
          </div>
        </div>

        {/* Tab Content: Home / Ledger */}
        {activeTab === "home" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                <h3 className="text-gray-500 font-bold mb-1 text-sm uppercase tracking-wider">Link Clicks</h3>
                <p className="text-4xl font-black text-purple-600">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">Traffic generated.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                <h3 className="text-gray-500 font-bold mb-1 text-sm uppercase tracking-wider">Registrations</h3>
                <p className="text-4xl font-black text-indigo-600">{totalSignups.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">Users who joined.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                <h3 className="text-gray-500 font-bold mb-1 text-sm uppercase tracking-wider">Pending (Transit)</h3>
                <p className="text-4xl font-black text-amber-500">₹{pendingCommissions.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">Awaiting delivery.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                <h3 className="text-gray-500 font-bold mb-1 text-sm uppercase tracking-wider">Cleared (Payouts)</h3>
                <p className="text-4xl font-black text-emerald-600">₹{clearedCommissions.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">Ready to withdraw.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Recent Commission Ledger</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Product Sold</th>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Commission</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {commissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                          No sales recorded yet. Head to the Promo Hub to start sharing!
                        </td>
                      </tr>
                    ) : commissions.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{c.productName}</td>
                        <td className="px-6 py-4 font-mono text-xs">{c.orderId}</td>
                        <td className="px-6 py-4 font-black text-green-600">+₹{c.amount}</td>
                        <td className="px-6 py-4">
                          {c.status === "pending" && <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold uppercase">Transit</span>}
                          {c.status === "cleared" && <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold uppercase">Cleared</span>}
                          {c.status === "paid" && <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-bold uppercase">Paid</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Promo Hub */}
        {activeTab === "promo_hub" && (
          <div>
            <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-bold text-blue-900">How it works</h4>
                <p className="text-sm text-blue-700">Browse the products below. Click "Copy Promo Link" and share it on WhatsApp, Instagram, or Facebook. When someone buys through your link, you instantly earn the margin amount shown!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotableProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 font-bold italic">
                  No promotable products found at the moment.
                </div>
              ) : promotableProducts.map(p => {
                const numericPrice = parseFloat(p.price.replace(/[^0-9]/g, ''));
                const marginAmt = Math.floor(numericPrice * (p.resellerMarginPercentage / 100));
                
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
                    <div className="relative aspect-square bg-gray-100">
                      <Image src={p.img || "https://placehold.co/400x400/png"} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-2 right-2 bg-black/80 text-[#C5A059] px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                        {p.resellerMarginPercentage}% Margin
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">{p.title}</h3>
                      <div className="mt-auto">
                        <div className="flex justify-between items-baseline mb-4">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Retail</p>
                            <p className="text-sm text-gray-500 line-through">₹{numericPrice.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-green-600 uppercase font-bold tracking-widest">Your Profit</p>
                            <p className="text-lg font-black text-green-600">+₹{marginAmt.toLocaleString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => copyRefLink(p.slug)}
                          className="w-full bg-[#0A1021] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          Copy Promo Link
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab Content: Payouts */}
        {activeTab === "payouts" && (
          <div className="max-w-xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💸</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Request Payout</h2>
              <p className="text-gray-500 mb-8">You have <span className="font-bold text-green-600">₹{clearedCommissions.toLocaleString()}</span> in cleared funds ready to withdraw.</p>
              
              {clearedCommissions >= 500 ? (
                <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg hover:bg-green-700 transition-colors">
                  Withdraw via UPI
                </button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-500">Minimum withdrawal amount is ₹500.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </DashboardLayout>
  );
}
