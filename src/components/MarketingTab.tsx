import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function MarketingTab() {
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
