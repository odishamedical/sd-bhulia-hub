"use client";

import React, { useState, useEffect } from "react";

export default function AdminFraud() {
  const [flaggedOrders, setFlaggedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking fraud detection engine results
    setTimeout(() => {
      setFlaggedOrders([
        {
          id: "ORD-9912",
          customerName: "Unknown User",
          amount: 45000,
          paymentMethod: "COD",
          riskScore: 92,
          flags: ["High value COD", "New account created 5 mins ago", "IP address mismatch with shipping city"],
          date: new Date().toISOString()
        },
        {
          id: "ORD-8821",
          customerName: "Jane Doe",
          amount: 12000,
          paymentMethod: "Credit Card",
          riskScore: 75,
          flags: ["Billing and Shipping address mismatch", "Multiple failed payment attempts prior to success"],
          date: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleAction = (id: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this order?`)) return;
    setFlaggedOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Fraud Analysis</h2>
          <p className="text-gray-500 text-sm">Automated security engine flagging high-risk transactions.</p>
        </div>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800 font-bold">
              Action Required: <span className="font-normal">There are {flaggedOrders.length} high-risk orders awaiting manual review. Do not dispatch until verified.</span>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {flaggedOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm text-gray-500 font-bold">
              No flagged orders. The platform is secure.
            </div>
          ) : (
            flaggedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 md:w-1/4 bg-gray-50 border-r border-gray-100 flex flex-col justify-center items-center text-center">
                  <div className={`text-4xl font-black mb-1 ${order.riskScore > 85 ? 'text-red-600' : 'text-orange-500'}`}>
                    {order.riskScore}
                  </div>
                  <div className="text-xs uppercase font-bold tracking-widest text-gray-500">Risk Score</div>
                  <div className="mt-4 text-sm font-bold text-gray-900">{order.id}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(order.date).toLocaleString()}</div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{order.customerName}</h4>
                        <p className="text-sm text-gray-500 font-mono">₹{order.amount.toLocaleString()} • {order.paymentMethod}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Detection Flags:</p>
                      {order.flags.map((flag: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleAction(order.id, "Cancel & Block IP")}
                      className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                      Cancel & Block IP
                    </button>
                    <button 
                      onClick={() => handleAction(order.id, "Request KYC")}
                      className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                      Request Identity Verification
                    </button>
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => handleAction(order.id, "Approve (Mark Safe)")}
                      className="px-6 py-2 bg-[#051815] text-[#C5A059] rounded-lg text-sm font-bold hover:bg-[#0a201c] transition-colors"
                    >
                      Approve Order
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
