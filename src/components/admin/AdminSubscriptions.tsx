import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminSubscriptions() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Fetch from weavers and stores
      const [weaversSnap, storesSnap] = await Promise.all([
        getDocs(collection(db, "weavers")),
        getDocs(collection(db, "stores"))
      ]);
      
      const allShops = [
        ...weaversSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'weaver' })),
        ...storesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'store' }))
      ];

      // Filter shops that have a premium subscription tier or active status
      const premiumShops = allShops.filter(shop => {
        const tier = shop.subscriptionTier || shop.subscription?.tier;
        const status = shop.subscriptionStatus || shop.subscription?.status;
        return (tier && tier !== 'free' && tier !== 'free_trial') || (status && status !== 'free' && status !== 'free_trial');
      });

      setUsers(premiumShops);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
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
            Premium Subscriptions
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Monitor active subscriptions (Pro/Advance) across Weavers and Stores.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {users.length} Premium Subs
        </div>
      </div>

      <div className="p-8">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No premium subscriptions found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Shop Name / ID</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Subscription Tier</th>
                  <th className="px-6 py-4">Expires At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{shop.name || shop.title || 'Unknown Shop'}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">UID: {shop.id} | {shop.role.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700">{shop.email || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{shop.phone || shop.phoneNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider ${(shop.subscriptionTier || shop.subscription?.tier) === 'advance' ? 'bg-indigo-100 text-indigo-700' : 'bg-[#C5A059]/10 text-[#C5A059]'}`}>
                        {shop.subscriptionTier || shop.subscription?.tier || shop.subscriptionStatus || shop.subscription?.status || 'Pro'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {shop.subscription?.expiresAt ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          {new Date(shop.subscription.expiresAt.seconds * 1000 || shop.subscription.expiresAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic font-medium">No Expiration Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(`Congratulations! Your Bhulia Hub shop (${shop.name || shop.title || 'Unnamed'}) has been successfully upgraded to ${(shop.subscriptionTier || shop.subscription?.tier || shop.subscriptionStatus || shop.subscription?.status || 'PRO').toUpperCase()} Tier. Your premium subscription is active until ${shop.subscription?.expiresAt ? new Date(shop.subscription.expiresAt.seconds * 1000 || shop.subscription.expiresAt).toLocaleDateString() : 'Lifetime'}. Thank you for partnering with us!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-green-200"
                        title="Send Confirmation via WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Notify
                      </a>
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
