"use client";

import React, { useState } from "react";

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("All Users");

  const handleSend = () => {
    if (!title || !body) return alert("Please provide a title and body.");
    alert(`Firing Firebase Push Notification: "${title}" to ${target}`);
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Push Notifications</h1>
          <p className="text-gray-800 mt-2 font-semibold">Broadcast mobile and desktop push notifications via Firebase Cloud Messaging.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Compose Message</h2>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Target Audience</label>
              <select value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none">
                <option value="All Users">All Ecosystem Users (Customers, Weavers, Stores)</option>
                <option value="Customers Only">Customers Only</option>
                <option value="Weavers Only">Weavers Only</option>
                <option value="B2B Stores Only">B2B Franchise Stores Only</option>
                <option value="Abandoned Carts">Users with Abandoned Carts</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Notification Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Flash Sale Live Now! 🚀" className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Notification Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="e.g. Get 20% off all authentic Sambalpuri Silk sarees for the next 24 hours." className="w-full bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none resize-none" />
            </div>
            <button onClick={handleSend} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all">
              Broadcast Notification
            </button>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-gray-100 rounded-3xl p-6 border-4 border-gray-300 h-full max-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-6 bg-gray-300 rounded-t-2xl flex justify-center items-center">
              <div className="w-16 h-1.5 bg-gray-400 rounded-full"></div>
            </div>
            
            <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-200 mt-10 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-[10px] text-white font-black">SD</span>
                </div>
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Shyam Dash Hub</span>
              </div>
              <h4 className="font-black text-sm text-gray-900 leading-tight">{title || "Your Title Here"}</h4>
              <p className="text-xs text-gray-600 mt-1 leading-snug">{body || "Your message body will appear here on the user's mobile lockscreen."}</p>
            </div>
            
            <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">iOS / Android Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
