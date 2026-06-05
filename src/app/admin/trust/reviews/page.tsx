"use client";

import { Review } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ReviewModerationQueue() {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchPendingReviews() {
    setIsLoading(true);
    try {
      // Mocking fetch logic since reviews collection might not exist yet
      // const q = query(collection(db, "reviews"), where("status", "==", "pending"));
      // const snapshot = await getDocs(q);
      
      const reviews: any[] = [
        {
          id: "REV-90123",
          productId: "SAR-101",
          productName: "Royal Pasapalli Mercerized Cotton Ikat Saree",
          customerName: "Sushmita Das",
          rating: 4,
          comment: "Beautiful saree, but the packaging could have been better.",
          date: "2026-06-03T10:30:00Z"
        },
        {
          id: "REV-90124",
          productId: "SAR-N102",
          productName: "Sonepur Temple Spire Double Ikat",
          customerName: "Rahul Sharma",
          rating: 5,
          comment: "Absolutely stunning craftsmanship. Best purchase ever!",
          date: "2026-06-04T08:15:00Z"
        }
      ];
      
      setPendingReviews(reviews);
    } catch (error) {
      console.error("Failed to fetch pending reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyAccessAndFetch = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        fetchPendingReviews();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.kyc === true) {
              setHasPermission(true);
              fetchPendingReviews();
              return;
            }
          }
        } catch (error) {
          console.error("Permission check failed:", error);
        }
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccessAndFetch();
  }, []);



  const handleAction = async (reviewId: string, action: "approve" | "reject") => {
    setProcessingId(reviewId);
    try {
      // Optimistic Update
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
      
      // In production:
      // const ref = doc(db, "reviews", reviewId);
      // await updateDoc(ref, { status: action === "approve" ? "published" : "deleted" });
      
    } catch (error) {
      console.error(`Failed to ${action} review:`, error);
      alert(`Action failed.`);
      fetchPendingReviews(); 
    } finally {
      setProcessingId(null);
    }
  };

  if (hasPermission === null) {
    return <div className="py-20 text-blue-600 font-bold uppercase text-xs animate-pulse text-center">Verifying Security Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-2">Security Breach Blocked</h3>
        <p>You do not have the required `Trust & Risk` permissions to moderate reviews.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Review Moderation Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">Filter out spam or abusive reviews before they go live on the storefront.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Scanning Queue...</div>
        ) : pendingReviews.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-900">No Pending Reviews</h3>
            <p className="text-gray-500 text-sm mt-1">All customer reviews have been moderated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Rating & Comment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-gray-900">{review.customerName}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">{new Date(review.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5 align-top text-xs">
                      <p className="font-semibold text-gray-800 line-clamp-2">{review.productName}</p>
                      <p className="text-[10px] text-blue-600 font-mono mt-1">{review.productId}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-1 mb-2 text-amber-400 text-xs">
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30"}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 italic">&quot;{review.comment}&quot;</p>
                    </td>
                    <td className="px-6 py-5 align-middle text-right">
                      {processingId === review.id ? (
                        <div className="text-xs text-blue-600 font-semibold animate-pulse">Processing...</div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(review.id, "reject")}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs transition-colors"
                          >
                            Delete
                          </button>
                          <button 
                            onClick={() => handleAction(review.id, "approve")}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors"
                          >
                            Publish
                          </button>
                        </div>
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
