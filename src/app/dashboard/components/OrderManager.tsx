import React from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrderManagerProps {
  sellerOrders: any[];
}

export default function OrderManager({ sellerOrders }: OrderManagerProps) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Management</h2>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 bg-gray-50">
              <th className="py-4 px-4 font-bold rounded-tl-xl">Order ID</th>
              <th className="py-4 px-4 font-bold">Product</th>
              <th className="py-4 px-4 font-bold">Status</th>
              <th className="py-4 px-4 font-bold rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sellerOrders.length > 0 ? sellerOrders.map(order => (
              <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors group">
                <td className="py-4 px-4 text-gray-500 font-mono text-xs">{order.orderId || order.id}</td>
                <td className="py-4 px-4 text-gray-900 font-bold">
                  {order.productName || "Proxy Order"}
                  {order.referralId && (
                    <div className="mt-1">
                      <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest shadow-sm">
                        Reseller Cut
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                    {order.logisticsStatus || "Pending Sourcing"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {(!order.logisticsStatus || order.logisticsStatus === "Pending Sourcing") && (
                    <button 
                      onClick={async () => {
                        if (!confirm("Confirm dispatch? This will check Admin Routing rules and generate an AWB with the assigned partner.")) return;
                        try {
                          const res = await fetch("/api/shipping/create-order", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              orderDetails: {
                                order_id: order.id,
                                order_date: new Date().toISOString(),
                                pickup_location: "Primary",
                                billing_customer_name: order.customerInfo?.fullName || "Customer",
                                billing_last_name: "",
                                billing_address: order.customerInfo?.streetAddress || "Address",
                                billing_address_2: order.customerInfo?.cityTownVillage || "",
                                billing_city: order.customerInfo?.cityTownVillage || "City",
                                billing_pincode: order.customerInfo?.pincode || "751001",
                                billing_state: order.customerInfo?.state || "Odisha",
                                billing_country: "India",
                                billing_email: order.customerInfo?.email || "dummy@example.com",
                                billing_phone: order.customerInfo?.phone || "0000000000",
                                shipping_is_billing: true,
                                order_items: order.items?.map((i: any) => ({
                                  name: i.name || "Item",
                                  sku: i.id || "SKU",
                                  units: i.cartQuantity || 1,
                                  selling_price: parseInt((i.price || "0").replace(/[^0-9]/g, "")),
                                })) || [],
                                payment_method: "Prepaid",
                                sub_total: order.subTotal || 0,
                                length: 10,
                                breadth: 10,
                                height: 10,
                                weight: 0.5,
                              }
                            })
                          });
                          
                          const data = await res.json();
                          if (!data.success) throw new Error(data.error);

                          await updateDoc(doc(db, "orders", order.id), {
                            logisticsStatus: "Dispatched via Shiprocket",
                            assignedLogisticsPartner: "Shiprocket",
                            trackingNumber: data.awbCode || "PENDING_AWB",
                            shipmentId: data.shipmentId,
                            awbGenerated: true
                          });
                          alert(`AWB Generated Successfully! Tracking ID: ${data.awbCode || "Pending"}`);
                        } catch (e: any) {
                          alert("Failed to generate AWB: " + e.message);
                        }
                      }}
                      className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 transition-colors rounded-lg text-xs font-bold border border-green-200"
                    >
                      Generate AWB
                    </button>
                  )}
                  {(order.logisticsStatus === "Dispatched via Shiprocket" || order.logisticsStatus === "Dispatched via Hub") && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.assignedLogisticsPartner || 'Shiprocket'}</span>
                      <span className="text-xs font-mono text-gray-900 font-bold">{order.trackingNumber || 'AWB-PENDING'}</span>
                    </div>
                  )}
                  <button onClick={() => window.open(`/dashboard/print-slip?orderId=${order.id}`, '_blank')} className="mt-2 w-full px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-[10px] font-bold uppercase tracking-widest border border-gray-300 shadow-sm flex items-center justify-center gap-1">🖨️ Print Slip</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-16 text-center text-gray-500 font-medium text-sm">No active orders to dispatch.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
