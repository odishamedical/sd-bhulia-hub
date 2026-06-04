"use client";

import React, { useState } from "react";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Shiprocket Auto-Fulfill", url: "https://api.shiprocket.in/v1/external/orders/create/adhoc", events: ["order.placed", "order.approved"], status: "Active", lastDelivery: "Success" },
    { id: 2, name: "Razorpay Escrow Trigger", url: "https://api.razorpay.com/v1/transfers", events: ["order.delivered"], status: "Active", lastDelivery: "Success" },
    { id: 3, name: "Franchise Sync (SAP)", url: "https://sap.bhulia.local/inventory/sync", events: ["inventory.updated"], status: "Failing", lastDelivery: "Timeout (504)" }
  ]);

  const [showModal, setShowModal] = useState(false);

  const handleTest = (id: number) => {
    alert(`Firing test payload to webhook ID: ${id}`);
  };

  const handleToggle = (id: number) => {
    setWebhooks(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === "Active" ? "Paused" : "Active" };
      }
      return w;
    }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Developer Webhooks</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage event-driven HTTP callbacks to external systems (Shiprocket, Razorpay, ERP).</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-black transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Add Endpoint
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="py-4 px-4 font-bold rounded-tl-xl">Integration Name</th>
                <th className="py-4 px-4 font-bold">Endpoint URL</th>
                <th className="py-4 px-4 font-bold">Subscribed Events</th>
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-4 font-bold">Last Delivery</th>
                <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {webhooks.map(hook => (
                <tr key={hook.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">{hook.name}</td>
                  <td className="py-4 px-4 font-mono text-xs text-gray-500 truncate max-w-[200px]">{hook.url}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {hook.events.map(ev => <span key={ev} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{ev}</span>)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button onClick={() => handleToggle(hook.id)} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      hook.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                      hook.status === 'Failing' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {hook.status}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono font-medium text-gray-600">{hook.lastDelivery}</td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => handleTest(hook.id)} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all">Ping Test</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Register New Webhook</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Integration Name</label>
                <input type="text" placeholder="e.g. ERP Inventory Sync" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Payload URL</label>
                <input type="url" placeholder="https://" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Secret (For HMAC Signature)</label>
                <input type="password" placeholder="Leave blank to generate automatically" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-blue-500 outline-none font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={() => { alert("Webhook Registered!"); setShowModal(false); }} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm">Save Endpoint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
