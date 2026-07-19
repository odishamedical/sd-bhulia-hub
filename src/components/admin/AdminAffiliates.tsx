"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AffiliateUser {
  id: string;
  name: string;
  email: string;
  role: string;
  totalClicks: number;
  totalSignups: number;
  createdAt: string;
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const fetchAffiliates = async () => {
      setLoading(true);
      try {
        const usersQ = query(collection(db, "users"));
        const snapshot = await getDocs(usersQ);
        const data: AffiliateUser[] = [];
        
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.totalClicks > 0 || d.totalSignups > 0 || d.role === "reseller") {
            data.push({
              id: doc.id,
              name: d.name || "Unknown User",
              email: d.email || "No email",
              role: d.role || "customer",
              totalClicks: d.totalClicks || 0,
              totalSignups: d.totalSignups || 0,
              createdAt: d.createdAt || new Date().toISOString()
            });
          }
        });

        // Sort by total clicks descending
        data.sort((a, b) => b.totalClicks - a.totalClicks);
        setAffiliates(data);
      } catch (error) {
        console.error("Error fetching affiliates:", error);
      }
      setLoading(false);
    };

    fetchAffiliates();
  }, []);

  const filteredAffiliates = filterRole === "all" ? affiliates : affiliates.filter(a => a.role === filterRole);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Global Affiliates Tracker...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Global Affiliate Leaderboard</h2>
          <p className="text-sm text-gray-500">Track organic sharing performance across all user types.</p>
        </div>
        
        <select 
          value={filterRole} 
          onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 text-gray-700 font-bold outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Roles</option>
          <option value="reseller">Resellers Only</option>
          <option value="customer">Customers Only</option>
          <option value="weaver">Weavers Only</option>
          <option value="shop">Shops Only</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-purple-50 text-purple-800 uppercase tracking-wider text-[10px] font-bold border-b border-purple-100">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Total Link Clicks</th>
              <th className="px-6 py-4 text-center">Registrations Driven</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAffiliates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                  No tracking data found for this filter.
                </td>
              </tr>
            ) : filteredAffiliates.map((user, idx) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-black text-gray-400">#{idx + 1}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    user.role === 'reseller' ? 'bg-amber-100 text-amber-700' :
                    user.role === 'customer' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-black text-purple-600">{user.totalClicks}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-black text-indigo-600">{user.totalSignups}</span>
                </td>
                <td className="px-6 py-4">
                  {user.role === "customer" && user.totalClicks > 10 ? (
                    <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-purple-700 transition-colors">
                      Invite to Reseller
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No Action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
