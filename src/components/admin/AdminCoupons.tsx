"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue?: number;
  expirationDate?: string;
  status: "active" | "inactive";
  usageCount: number;
  createdAt?: any;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, "coupons"));
      const data: Coupon[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() } as Coupon);
      });
      // Sort by creation date (newest first), fallback to ID if no timestamp
      data.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });
      setCoupons(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(res);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "coupons", id), { status: newStatus });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (e) {
      console.error(e);
      alert("Error toggling status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error deleting coupon.");
    }
  };

  const openEditModal = (c: Coupon) => {
    setEditingId(c.id);
    setCode(c.code);
    setType(c.type);
    setValue(c.value.toString());
    setMinOrderValue(c.minOrderValue ? c.minOrderValue.toString() : "");
    setExpirationDate(c.expirationDate || "");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setType("percentage");
    setValue("");
    setMinOrderValue("");
    setExpirationDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      alert("Code and Value are required.");
      return;
    }

    try {
      const couponData = {
        code: code.toUpperCase().trim(),
        type,
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        expirationDate: expirationDate || null,
      };

      if (editingId) {
        await updateDoc(doc(db, "coupons", editingId), couponData);
        setCoupons(prev => prev.map(c => c.id === editingId ? { ...c, ...couponData } as Coupon : c));
      } else {
        const newId = doc(collection(db, "coupons")).id;
        const newCoupon = {
          ...couponData,
          status: "active",
          usageCount: 0,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "coupons", newId), newCoupon);
        setCoupons([{ id: newId, ...newCoupon } as any, ...coupons]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Error saving coupon.");
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading coupons...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Coupons & Offers</h2>
          <p className="text-gray-500 text-sm">Manage promotional discount codes for your customers.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-blue-700 transition-colors"
        >
          + Create New Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Conditions</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No coupons found. Create your first promotion!
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 text-base">
                      {c.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {c.type === "percentage" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {c.minOrderValue && <div className="mb-1">Min Order: <span className="font-bold text-gray-700">₹{c.minOrderValue}</span></div>}
                      {c.expirationDate ? (
                        <div className={new Date(c.expirationDate) < new Date() ? "text-red-500 font-bold" : ""}>
                          Expires: {c.expirationDate}
                        </div>
                      ) : (
                        <div className="text-gray-400">No Expiration</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {c.usageCount} times
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${c.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEditModal(c)} className="text-blue-600 font-bold text-xs hover:underline uppercase">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 font-bold text-xs hover:underline uppercase">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">{editingId ? "Edit Coupon" : "Create New Coupon"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. DIWALI20"
                    required
                  />
                  <button type="button" onClick={generateRandomCode} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200">
                    Generate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Value</label>
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={type === "percentage" ? "e.g. 15" : "e.g. 500"}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Order Value (Optional)</label>
                <input 
                  type="number" 
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2000"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if no minimum is required.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expiration Date (Optional)</label>
                <input 
                  type="date" 
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow">
                  {editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
