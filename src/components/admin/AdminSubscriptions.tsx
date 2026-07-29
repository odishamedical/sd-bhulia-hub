import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminSubscriptions() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("subscriptionStatus", "in", ["active", "cancelled"])
      );
      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(subs.sort((a: any, b: any) => {
        if (a.subscriptionStatus === "active" && b.subscriptionStatus !== "active") return -1;
        return 0;
      }));
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceCancel = async (uid: string, subscriptionId: string) => {
    if (!confirm(`Are you sure you want to FORCE CANCEL subscription ${subscriptionId}? This will stop all Razorpay billing instantly.`)) {
      return;
    }
    
    setCancellingId(uid);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          customerId: uid,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to cancel subscription");
      }
      
      alert("Subscription Successfully Cancelled on Razorpay and Database.");
      fetchSubscriptions(); // Refresh the list
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 min-h-[400px] flex items-center justify-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
      
      <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Subscription Management
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Monitor active subscriptions and forcibly cancel rogue or delinquent accounts directly via Razorpay API.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {users.filter(u => u.subscriptionStatus === "active").length} Active Subs
        </div>
      </div>

      <div className="p-8">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No subscriptions found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">User / Shop</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Razorpay Sub ID</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{user.email || 'Unknown Email'}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">UID: {user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full text-xs">
                        {user.planId || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.subscriptionStatus === "active" ? (
                        <div className="flex items-center gap-1.5 text-green-600 font-bold">
                          <span>✅</span> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-bold">
                          <span>❌</span> Cancelled
                          {user.subscriptionCancelledAt && (
                            <span className="text-xs text-gray-400 font-normal ml-1">
                              ({new Date(user.subscriptionCancelledAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">
                        {user.subscriptionId || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.subscriptionStatus === "active" && user.subscriptionId ? (
                        <button
                          onClick={() => handleForceCancel(user.id, user.subscriptionId)}
                          disabled={cancellingId === user.id}
                          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 border border-red-200"
                        >
                          {cancellingId === user.id ? (
                            <span className="w-3 h-3 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <span>⚠️</span>
                          )}
                          Force Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
