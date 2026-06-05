"use client";

import { Order } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ShipmentsTrackerPage() {
  const [shipments, setShipments] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [trackingModal, setTrackingModal] = useState<any | null>(null);

  async function fetchShipments() {
    setIsLoading(true);
    try {
      // In production, query orders where status is 'shipped' or 'in_transit'
      const q = query(collection(db, "orders"), where("status", "in", ["shipped", "processing"]));
      const snapshot = await getDocs(q);
      
      let fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (fetched.length === 0 && process.env.NODE_ENV === "development") {
        fetched = [
          {
            id: "ORD-99122",
            awb: "DELHI-9876543210",
            courier: "Delhivery",
            status: "in_transit",
            customerName: "Anita Sharma",
            destination: "Mumbai, MH",
            lastUpdate: "Arrived at Bhiwandi Hub"
          },
          {
            id: "ORD-99123",
            awb: "BLD-1234567890",
            courier: "BlueDart",
            status: "out_for_delivery",
            customerName: "Rohan Das",
            destination: "Bengaluru, KA",
            lastUpdate: "Out for delivery by agent Mahesh"
          }
        ];
      }

      setShipments(fetched);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
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
        fetchShipments();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            if (adminData.permissions?.orders === true) {
              setHasPermission(true);
              fetchShipments();
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



  const handleTrackAwb = (shipment: any) => {
    // Simulated Shiprocket API Response
    setTrackingModal({
      ...shipment,
      timeline: [
        { time: "2026-06-02 10:00 AM", status: "Manifest Generated", location: "Bargarh Warehouse" },
        { time: "2026-06-02 04:30 PM", status: "Picked Up", location: "Bargarh Hub" },
        { time: "2026-06-03 08:15 AM", status: "In Transit", location: "Bhubaneswar Sorting Center" },
        { time: "2026-06-04 07:00 AM", status: shipment.lastUpdate, location: shipment.destination },
      ]
    });
  };

  if (hasPermission === null) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Security Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-2">Access Denied</h3>
        <p>You do not have `Commerce & Orders` permissions to view logistics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipments Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Live tracking integration with logistics partners (Shiprocket, Delhivery).</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
          Active Dispatches: <span className="text-blue-600">{shipments.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Syncing with Logistics APIs...</div>
        ) : shipments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-gray-900">No Active Shipments</h3>
            <p className="text-gray-500 text-sm mt-1">All orders have been delivered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Order / Destination</th>
                  <th className="px-6 py-4">AWB & Courier</th>
                  <th className="px-6 py-4">Live Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <p className="font-bold text-gray-900">{shipment.id}</p>
                      <p className="text-xs text-gray-500 mt-1">{shipment.customerName}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">To: {shipment.destination}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase rounded border border-gray-200 mb-1">
                        {shipment.courier}
                      </span>
                      <p className="font-bold text-gray-800 font-mono text-xs">{shipment.awb}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        shipment.status === 'out_for_delivery' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {shipment.status.replace("_", " ")}
                      </span>
                      <p className="text-xs text-gray-600 mt-2 truncate w-48 italic">{shipment.lastUpdate}</p>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <button 
                        onClick={() => handleTrackAwb(shipment)}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow-md transition-colors"
                      >
                        Track AWB 📍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative">
            
            <button 
              onClick={() => setTrackingModal(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              ✕
            </button>
            
            <div className="mb-6 pr-8">
              <h2 className="text-xl font-bold text-gray-900">Shiprocket Sync</h2>
              <p className="text-xs text-gray-500 font-mono mt-1">AWB: {trackingModal.awb} ({trackingModal.courier})</p>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              
              {trackingModal.timeline.map((event: any, index: number) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] z-10 font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900 text-sm">{event.status}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{event.time}</div>
                    <div className="text-xs text-gray-500 mt-1">📍 {event.location}</div>
                  </div>
                </div>
              ))}

            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setTrackingModal(null)} 
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
              >
                Close Tracker
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
