"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export default function GlobalAffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refId = searchParams.get("ref");
    if (refId) {
      // Step 1: Save in localStorage for 30 days logic (or just indefinitely for now)
      localStorage.setItem("sd_affiliate_ref", refId);
      
      // Step 2: Log a Click asynchronously, ensuring we don't log duplicate clicks in a short session
      const lastClickKey = `sd_click_logged_${refId}`;
      const lastLoggedStr = localStorage.getItem(lastClickKey);
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;

      if (!lastLoggedStr || (now - parseInt(lastLoggedStr, 10)) > tenMinutes) {
        localStorage.setItem(lastClickKey, now.toString());
        
        // Background DB ping to increment clicks
        // First check 'users' collection (for Weavers, Shops, Customers)
        // Note: The referring ID might be a raw UID or a "SDA-XXXXXX" custom referral ID.
        // Let's assume the referral ID passed in `?ref=` is the user's UID (which we set in ShareWidget if no custom referral ID exists).
        
        const logClick = async () => {
          try {
            // Because users can be in different collections (or just 'users'), 
            // if we are doing global tracking, we should increment on their main 'users' document.
            // Or if they are a reseller, on their 'resellers' doc.
            
            // For now, let's just increment totalClicks on the "users" doc since all roles have a "users" doc.
            const userRef = doc(db, "users", refId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              await updateDoc(userRef, {
                totalClicks: increment(1)
              });
            } else {
              // Try resellers collection if not found in users (for legacy compatibility)
              const resellerRef = doc(db, "resellers", refId);
              const resellerDoc = await getDoc(resellerRef);
              if (resellerDoc.exists()) {
                await updateDoc(resellerRef, {
                  totalClicks: increment(1)
                });
              }
            }
          } catch (error) {
            console.error("Affiliate tracking ping failed:", error);
          }
        };

        logClick();
      }
    }
  }, [searchParams]);

  return null;
}
