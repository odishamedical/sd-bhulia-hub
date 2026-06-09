"use client";
import React from "react";

export default function StyleGuide() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Global Style Guide</h1>
        <p className="text-slate-500">Review the proposed text colors and button styles below.</p>
      </div>

      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-gray-100">1. Text Color Hierarchy</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-slate-900 shrink-0 border border-gray-200 flex items-center justify-center text-white text-xs font-mono">slate-900</div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Primary Heading (text-slate-900)</h1>
                <p className="text-slate-500 text-sm mt-1">Used for main page titles and primary emphasis.</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-slate-700 shrink-0 border border-gray-200 flex items-center justify-center text-white text-xs font-mono">slate-700</div>
              <div>
                <h2 className="text-xl font-bold text-slate-700">Subheading (text-slate-700)</h2>
                <p className="text-slate-500 text-sm mt-1">Used for section titles and secondary emphasis.</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-slate-500 shrink-0 border border-gray-200 flex items-center justify-center text-white text-xs font-mono">slate-500</div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Description / Helper Text / Field Labels (text-slate-500)</p>
                <p className="text-slate-500 text-xs mt-1">Used for paragraph text, instructions, and small invisible text fixes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-gray-100">2. Global Button Styles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Primary Action (Bhulia Blue)</p>
              <button className="bg-[#0074E4] hover:bg-[#0052A3] text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs shadow-md hover:shadow-[0_4px_15px_rgba(0,116,228,0.4)] backdrop-blur-sm transition-all w-full text-center">
                + Create New Template
              </button>
              <p className="text-xs text-slate-500">Used for main actions (Create, Save, Submit). Hover to see glass effect.</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Secondary Action (Ghost)</p>
              <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#0074E4] font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors w-full text-center">
                Cancel / Go Back
              </button>
              <p className="text-xs text-slate-500">Used for alternate/safe actions.</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Destructive Action</p>
              <button className="bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors w-full text-center">
                🗑️ Delete Template
              </button>
              <p className="text-xs text-slate-500">Used for deleting or dangerous actions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
