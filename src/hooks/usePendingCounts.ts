import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PendingCounts {
  kyc: number;
  products: number;
  orders: number;
  finance: number;
  logistics: number;
  support: number;
  total: number;
}

export function usePendingCounts() {
  const [counts, setCounts] = useState<PendingCounts>({
    kyc: 0,
    products: 0,
    orders: 0,
    finance: 0,
    logistics: 0,
    support: 0,
    total: 0,
  });

  useEffect(() => {
    // 1. KYC (Pending Weavers/Resellers/Shops)
    const qKyc = query(collection(db, "users"), where("status", "==", "pending"));
    const unsubKyc = onSnapshot(qKyc, (snapshot) => {
      setCounts(prev => ({ ...prev, kyc: snapshot.size }));
    });

    // 2. Products (Pending GI-Tag Verification)
    const qProducts = query(collection(db, "products"), where("status", "==", "pending_verification"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setCounts(prev => ({ ...prev, products: snapshot.size }));
    });

    // 3. Orders (Pending Returns & Exchanges)
    const qOrders = query(collection(db, "orders"), where("status", "==", "return_requested"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setCounts(prev => ({ ...prev, orders: snapshot.size }));
    });

    // 4. Finance (Pending Payouts in Escrow)
    const qFinance = query(collection(db, "escrow"), where("status", "==", "payout_pending"));
    const unsubFinance = onSnapshot(qFinance, (snapshot) => {
      setCounts(prev => ({ ...prev, finance: snapshot.size }));
    });

    // 5. Logistics (Active Dispatches)
    const qLogistics = query(collection(db, "orders"), where("status", "==", "dispatch_ready"));
    const unsubLogistics = onSnapshot(qLogistics, (snapshot) => {
      setCounts(prev => ({ ...prev, logistics: snapshot.size }));
    });

    // 6. Support (Open Tickets)
    const qSupport = query(collection(db, "support_tickets"), where("status", "==", "open"));
    const unsubSupport = onSnapshot(qSupport, (snapshot) => {
      setCounts(prev => ({ ...prev, support: snapshot.size }));
    });

    return () => {
      unsubKyc();
      unsubProducts();
      unsubOrders();
      unsubFinance();
      unsubLogistics();
      unsubSupport();
    };
  }, []);

  // Calculate total dynamically on render
  const total = counts.kyc + counts.products + counts.orders + counts.finance + counts.logistics + counts.support;
  
  return { ...counts, total };
}
