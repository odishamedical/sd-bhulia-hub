"use client";

import React, { useState } from "react";

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState("Open");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  
  // Mocking dispute data
  const [disputes, setDisputes] = useState([
    {
      id: "DSP-8293",
      orderId: "ORD-10923",
      buyer: "Aarav Sharma",
      weaver: "Bargarh Weavers Coop",
      amount: 14500,
      issue: "Counterfeit GI Tag Suspected",
      buyerEvidence: "Fabric feels synthetic. Passed the burn test but color bled immediately on first wash.",
      weaverDefense: "The saree is 100% authentic Sambalpuri cotton with genuine GI tag. Color bleeding is normal for organic natural dyes in the first wash. We included care instructions in the box.",
      status: "Open",
      dateFiled: "Oct 24, 2026",
      escrowStatus: "Held"
    },
    {
      id: "DSP-8294",
      orderId: "ORD-11002",
      buyer: "Priya Patel",
      weaver: "Sonepur Silk Handlooms",
      amount: 32000,
      issue: "Item Not Received",
      buyerEvidence: "Shiprocket tracking says delivered, but I did not receive the package. Security camera shows no delivery person arrived.",
      weaverDefense: "We handed over the package to Delhivery on time. The POD (Proof of Delivery) has a signature.",
      status: "Open",
      dateFiled: "Oct 25, 2026",
      escrowStatus: "Held"
    }
  ]);

  const handleRule = (verdict: string) => {
    alert(`Dispute ${selectedDispute.id} closed. Verdict: ${verdict}. Escrow funds will be processed accordingly.`);
    setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
    setSelectedDispute(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Dispute Resolution Center</h1>
          <p className="text-gray-500 mt-2 font-medium">Arbitrate conflicts between buyers and weavers. Manage Escrow releases and refunds.</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {["Open", "Under Review", "Resolved"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            {tab} Disputes
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        {disputes.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">
            <div className="text-4xl mb-3">⚖️</div>
            No open disputes at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {disputes.map(dispute => (
              <div key={dispute.id} className="border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-300 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">High Priority</span>
                      <h3 className="font-black text-gray-900 text-lg">{dispute.issue}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">Dispute ID: {dispute.id} | Order: {dispute.orderId}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-gray-900">₹{dispute.amount.toLocaleString()}</div>
                      <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 inline-block border border-orange-100">Escrow: {dispute.escrowStatus}</div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Buyer Complaint ({dispute.buyer})</div>
                      <p className="text-sm font-medium text-gray-900">{dispute.buyerEvidence}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Weaver Defense ({dispute.weaver})</div>
                      <p className="text-sm font-medium text-blue-900">{dispute.weaverDefense}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDispute(dispute)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-black transition-all"
                >
                  Arbitrate & Rule
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Rule on {selectedDispute.id}</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">You are acting as the final arbitrator for this conflict. Your decision is final and will automatically route the Escrow funds.</p>
            
            <div className="space-y-4 mb-8">
              <button onClick={() => handleRule("Refund Buyer")} className="w-full py-4 px-6 text-left border-2 border-red-100 hover:border-red-500 rounded-2xl transition-all group flex items-center justify-between">
                <div>
                  <div className="font-black text-red-600 text-lg">Rule in Favor of Buyer</div>
                  <div className="text-sm text-gray-500 font-medium">Issue full refund of ₹{selectedDispute.amount.toLocaleString()} to {selectedDispute.buyer}</div>
                </div>
                <svg className="w-6 h-6 text-red-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              
              <button onClick={() => handleRule("Release Payout")} className="w-full py-4 px-6 text-left border-2 border-green-100 hover:border-green-500 rounded-2xl transition-all group flex items-center justify-between">
                <div>
                  <div className="font-black text-green-600 text-lg">Rule in Favor of Weaver</div>
                  <div className="text-sm text-gray-500 font-medium">Release Escrow payout of ₹{(selectedDispute.amount * 0.9).toLocaleString()} to {selectedDispute.weaver}</div>
                </div>
                <svg className="w-6 h-6 text-green-300 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelectedDispute(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
