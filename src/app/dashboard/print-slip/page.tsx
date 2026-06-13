"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function PrintSlipContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/dashboard");
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderSnap = await getDoc(doc(db, "orders", orderId));
        if (orderSnap.exists()) {
          setOrder(orderSnap.data());
        } else {
          alert("Order not found");
        }
      } catch (e) {
        console.error("Error fetching order", e);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, router]);

  useEffect(() => {
    if (!loading && order) {
      // Trigger print dialogue automatically after a tiny delay to ensure render
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, order]);

  if (loading) {
    return <div className="p-10 font-mono">Loading slip...</div>;
  }

  if (!order) {
    return <div className="p-10 font-mono text-red-500">Failed to load order data.</div>;
  }

  return (
    <div className="bg-white text-black min-h-screen font-sans p-8 print:p-0 max-w-4xl mx-auto">
      {/* Hide header/nav during print via global CSS or Tailwind print variant */}
      
      {/* HEADER */}
      <div className="border-b-2 border-black pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Packing Slip</h1>
          <p className="text-sm text-gray-600 font-mono">Order ID: {order.orderId || orderId}</p>
          <p className="text-sm text-gray-600 font-mono">Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold font-serif">Bhulia.com</h2>
          <p className="text-xs text-gray-500">Authentic Sambalpuri Handloom</p>
        </div>
      </div>

      {/* ADDRESSES */}
      <div className="flex flex-row justify-between mb-10">
        <div className="w-1/2 pr-4 border-r border-gray-300">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ship To</h3>
          <p className="font-bold text-lg">{order.shippingAddress?.name || "Customer"}</p>
          <p className="text-sm mt-1 whitespace-pre-line">{order.shippingAddress?.address || "Address not provided"}</p>
          <p className="text-sm mt-1">Phone: {order.shippingAddress?.phone || "N/A"}</p>
        </div>
        
        <div className="w-1/2 pl-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Seller / Return Address</h3>
          <p className="font-bold text-lg">{order.sellerName || "Bhulia Store"}</p>
          <p className="text-sm mt-1">{order.sellerId}</p>
          <p className="text-sm mt-2 text-gray-500 italic">If undelivered, please return to seller.</p>
        </div>
      </div>

      {/* LOGISTICS */}
      <div className="bg-gray-100 p-4 border border-gray-300 mb-10 flex justify-between items-center print:bg-transparent print:border-black">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Carrier</p>
          <p className="font-bold">{order.assignedLogisticsPartner || "Standard Shipping"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Tracking Number</p>
          <p className="font-mono font-black text-lg">{order.trackingNumber || "Pending Dispatch"}</p>
        </div>
      </div>

      {/* ITEM DETAILS */}
      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="border-b-2 border-black text-left text-xs uppercase tracking-widest text-gray-600">
            <th className="py-3 px-2 font-bold">Qty</th>
            <th className="py-3 px-2 font-bold">Product Details</th>
            <th className="py-3 px-2 font-bold text-right">SKU</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="py-4 px-2 font-bold text-lg">1</td>
            <td className="py-4 px-2">
              <p className="font-bold text-lg">{order.productName || "Sambalpuri Saree"}</p>
              <p className="text-sm text-gray-600">{order.productCategory || "Apparel"}</p>
            </td>
            <td className="py-4 px-2 text-right font-mono text-sm text-gray-600">
              {order.productId || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER */}
      <div className="border-t border-black pt-6 text-center">
        <p className="text-lg font-bold font-serif mb-2">Thank you for your purchase!</p>
        <p className="text-xs text-gray-500">Your purchase supports authentic handloom weavers of Odisha.</p>
        <div className="mt-8">
          {/* Simple barcode placeholder via CSS */}
          <div className="h-12 w-48 bg-[repeating-linear-gradient(90deg,black_0,black_2px,transparent_2px,transparent_6px,black_6px,black_10px,transparent_10px,transparent_12px)] mx-auto opacity-80"></div>
          <p className="text-[10px] font-mono mt-1 tracking-[0.3em]">{order.orderId || orderId}</p>
        </div>
      </div>
      
      {/* Back button hidden during print */}
      <div className="mt-16 text-center print:hidden">
        <button onClick={() => window.close()} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-300">
          Close Window
        </button>
      </div>
    </div>
  );
}

export default function PrintSlipPage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono">Loading slip parameters...</div>}>
      <PrintSlipContent />
    </Suspense>
  );
}
