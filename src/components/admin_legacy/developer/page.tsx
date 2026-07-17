"use client";

import { ApiKey, Webhook } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DeveloperHubPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: "key_1", name: "Shiprocket Prod", prefix: "sk_live_8f92...", created: "2026-05-15", lastUsed: "2026-06-04" },
    { id: "key_2", name: "Stripe Billing", prefix: "rk_test_51Mz...", created: "2026-05-20", lastUsed: "2026-06-03" }
  ]);
  
  const [webhooks, setWebhooks] = useState<any[]>([
    { id: "wh_1", endpoint: "https://api.bhulia.com/webhooks/stripe", event: "payment_intent.succeeded", active: true },
    { id: "wh_2", endpoint: "https://api.bhulia.com/webhooks/shiprocket", event: "awb_status_update", active: true }
  ]);

  const [newKeyData, setNewKeyData] = useState<{name: string, key: string} | null>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      const role = localStorage.getItem("sd_current_user_role");

      // STRICT: ONLY Super Admin can access API keys
      if (role === "super_admin") {
        setHasPermission(true);
        setIsLoading(false);
        return;
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccess();
  }, []);

  const handleGenerateKey = () => {
    const name = prompt("Enter a name for the new API Key (e.g. 'Razorpay Prod'):");
    if (!name) return;

    // Simulate key generation
    const randomHex = Math.random().toString(16).substr(2, 12);
    const fullKey = `sd_live_${randomHex}${Math.random().toString(16).substr(2, 12)}`;
    
    setNewKeyData({ name, key: fullKey });
    
    setApiKeys([{
      id: `key_${Date.now()}`,
      name: name,
      prefix: fullKey.substring(0, 12) + "...",
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never"
    }, ...apiKeys]);
  };

  const handleRevokeKey = (id: string) => {
    if(confirm("Are you sure you want to revoke this API key? Integrations using it will fail immediately.")) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  if (hasPermission === null || isLoading) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Super Admin Cryptographic Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-900 text-red-50 p-6 rounded-xl shadow-2xl border border-red-700">
        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><span className="text-3xl">🛑</span> Maximum Security Area</h3>
        <p>Access Denied. Developer API Keys can only be managed by the Ecosystem Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Developer Hub
            <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">Super Admin Only</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage API Keys, Webhooks, and external application integrations.</p>
        </div>
      </div>

      {newKeyData && (
        <div className="bg-amber-50 border-2 border-amber-400 p-6 rounded-xl shadow-md relative">
          <button onClick={() => setNewKeyData(null)} className="absolute top-4 right-4 text-amber-700 font-bold hover:text-amber-900">✕</button>
          <h3 className="text-amber-900 font-bold text-lg mb-2">New API Key Generated: {newKeyData.name}</h3>
          <p className="text-amber-800 text-sm mb-4">Please copy this key and store it securely. For security reasons, <strong className="underline">it will not be shown again</strong>.</p>
          <div className="bg-white border border-amber-300 p-4 rounded-lg flex items-center justify-between">
            <code className="text-gray-900 font-mono font-bold">{newKeyData.key}</code>
            <button 
              onClick={() => { navigator.clipboard.writeText(newKeyData.key); alert("Copied to clipboard!"); }}
              className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-md hover:bg-amber-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>🔑</span> Active API Keys</h2>
          <button 
            onClick={handleGenerateKey}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow-md transition-all"
          >
            + Generate New Key
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-200 text-slate-800 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-4">Key Name</th>
                <th className="px-6 py-4">Token Prefix</th>
                <th className="px-6 py-4">Created On</th>
                <th className="px-6 py-4">Last Used</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold">{key.name}</td>
                  <td className="px-6 py-4 font-mono text-xs bg-gray-50 rounded px-2">{key.prefix}</td>
                  <td className="px-6 py-4 text-gray-500">{key.created}</td>
                  <td className="px-6 py-4 text-gray-500">{key.lastUsed}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleRevokeKey(key.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>🪝</span> Webhook Endpoints</h2>
          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-lg text-xs transition-all">
            + Add Endpoint
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-200 text-slate-800 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-4">Endpoint URL</th>
                <th className="px-6 py-4">Listening Events</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {webhooks.map((wh) => (
                <tr key={wh.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{wh.endpoint}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-[10px] font-mono">
                      {wh.event}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-xs hover:underline">Ping</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
