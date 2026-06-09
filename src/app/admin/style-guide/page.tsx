"use client";
import React from "react";

export default function StyleGuide() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bhulia Hub Admin Design System</h1>
        <p className="text-slate-500 max-w-2xl">
          This is the single source of truth for UI components, colors, and layouts across the admin and dashboard panels. 
          Use these exact Tailwind classes when building new administrative interfaces to ensure global consistency.
        </p>
      </div>

      {/* 1. Color Palette System */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#0074E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Color Palette System
          </h2>
          <p className="text-slate-500 text-sm mt-1">Global brand and structural colors.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="h-20 rounded-xl bg-[#0074E4] border border-gray-200 shadow-inner flex items-end p-3">
              <span className="text-white font-mono text-xs font-bold">#0074E4</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Bhulia Blue</p>
              <p className="text-xs text-slate-500">Primary Brand Color</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-xl bg-gray-50 border border-gray-200 shadow-inner flex items-end p-3">
              <span className="text-slate-500 font-mono text-xs font-bold">bg-gray-50</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">App Background</p>
              <p className="text-xs text-slate-500">Global Admin Wrapper</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-xl bg-white border border-gray-200 shadow-inner flex items-end p-3">
              <span className="text-slate-500 font-mono text-xs font-bold">bg-white</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Card Background</p>
              <p className="text-xs text-slate-500">For isolated content blocks</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-xl bg-slate-900 border border-gray-200 shadow-inner flex items-end p-3">
              <span className="text-white font-mono text-xs font-bold">text-slate-900</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Primary Text</p>
              <p className="text-xs text-slate-500">Deep charcoal for headings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Typography Rules */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#0074E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Typography & Text Colors
          </h2>
          <p className="text-slate-500 text-sm mt-1">Strict text hierarchy mapping for dark contrast on light backgrounds.</p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-1/3">
              <h1 className="text-3xl font-bold text-slate-900">Heading 1</h1>
            </div>
            <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs text-slate-700">
              className="text-2xl md:text-3xl font-bold text-slate-900"
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-1/3">
              <h2 className="text-xl font-bold text-slate-700">Subheading 2</h2>
            </div>
            <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs text-slate-700">
              className="text-lg md:text-xl font-bold text-slate-700"
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-1/3">
              <p className="text-sm font-bold text-slate-800">Standard Body Text</p>
            </div>
            <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs text-slate-800">
              className="text-sm font-bold text-slate-800 leading-relaxed"
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-1/3">
              <p className="text-xs font-semibold text-slate-700">Small Helper / Description Text</p>
            </div>
            <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs text-slate-700">
              className="text-xs font-semibold text-slate-700"
            </div>
          </div>
        </div>
      </section>

      {/* 3. Global Button Styles */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#0074E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            Interactive Buttons
          </h2>
          <p className="text-slate-500 text-sm mt-1">Hover over buttons to observe the glass effect and transitions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <button className="w-full bg-[#0074E4] hover:bg-[#0052A3] text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs shadow-md shadow-[#0074E4]/20 hover:shadow-[0_8px_20px_rgba(0,116,228,0.4)] backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer">
              <span>Primary Action</span>
            </button>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-slate-800 mb-2">Usage: Main saving, submitting, creating actions.</p>
              <code className="text-[10px] text-slate-700 block whitespace-pre-wrap break-all">
                className="bg-[#0074E4] hover:bg-[#0052A3] text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs shadow-md shadow-[#0074E4]/20 hover:shadow-[0_8px_20px_rgba(0,116,228,0.4)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              </code>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-white border border-gray-300 text-slate-800 hover:bg-blue-50 hover:border-[#0074E4]/30 hover:text-[#0074E4] font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs shadow-sm hover:shadow-md hover:shadow-[#0074E4]/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              Secondary Action
            </button>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-slate-800 mb-2">Usage: Cancellations, back buttons, safe alternatives.</p>
              <code className="text-[10px] text-slate-700 block whitespace-pre-wrap break-all">
                className="bg-white border border-gray-300 text-slate-800 hover:bg-blue-50 hover:text-[#0074E4] font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              </code>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs shadow-sm hover:shadow-md hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex justify-center items-center gap-2">
              <span>🗑️ Destructive Action</span>
            </button>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-slate-800 mb-2">Usage: Deletions, warnings, hard resets.</p>
              <code className="text-[10px] text-slate-700 block whitespace-pre-wrap break-all">
                className="bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Form Fields & Inputs */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#0074E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            Form Fields & Inputs
          </h2>
          <p className="text-slate-500 text-sm mt-1">Consistent borders, padding, and blue focus states.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Standard Text Input</label>
              <input 
                type="text" 
                placeholder="Click to see focus state..." 
                className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all placeholder:text-slate-400"
              />
            </div>
            <code className="text-[10px] text-slate-600 block whitespace-pre-wrap break-all bg-gray-50 p-3 rounded-lg border border-gray-200">
              className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all placeholder:text-slate-400"
            </code>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dropdown Select</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all cursor-pointer">
                <option>Option 1 (Click me)</option>
                <option>Option 2</option>
              </select>
            </div>
            <code className="text-[10px] text-slate-600 block whitespace-pre-wrap break-all bg-gray-50 p-3 rounded-lg border border-gray-200">
              className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all cursor-pointer"
            </code>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Textarea Field</label>
              <textarea 
                rows={3}
                placeholder="Type your description here..." 
                className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>
            <code className="text-[10px] text-slate-600 block whitespace-pre-wrap break-all bg-gray-50 p-3 rounded-lg border border-gray-200">
              className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-[#0074E4] focus:ring-2 focus:ring-[#0074E4]/20 transition-all placeholder:text-slate-400 resize-none"
            </code>
          </div>
        </div>
      </section>

      {/* 5. Status Badges & Tickets */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#0074E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
            Status Badges & Tickets
          </h2>
          <p className="text-slate-500 text-sm mt-1">Use these soft-colored badges to display statuses across tables and cards.</p>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-3 bg-gray-50 hover:bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-[#0074E4]/5 hover:shadow-lg hover:shadow-[#0074E4]/20 hover:-translate-y-1 transition-all duration-300 min-w-[150px] cursor-pointer">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-[10px] uppercase font-bold tracking-widest border border-green-300 shadow-sm">
              ● Published
            </span>
            <code className="text-[9px] text-slate-600 text-center font-bold mt-2">bg-green-100<br/>text-green-800</code>
          </div>

          <div className="flex flex-col items-center gap-3 bg-gray-50 hover:bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-[#0074E4]/5 hover:shadow-lg hover:shadow-[#0074E4]/20 hover:-translate-y-1 transition-all duration-300 min-w-[150px] cursor-pointer">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded text-[10px] uppercase font-bold tracking-widest border border-amber-300 shadow-sm">
              ● Pending Review
            </span>
            <code className="text-[9px] text-slate-600 text-center font-bold mt-2">bg-amber-100<br/>text-amber-800</code>
          </div>

          <div className="flex flex-col items-center gap-3 bg-gray-50 hover:bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-[#0074E4]/5 hover:shadow-lg hover:shadow-[#0074E4]/20 hover:-translate-y-1 transition-all duration-300 min-w-[150px] cursor-pointer">
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-[10px] uppercase font-bold tracking-widest border border-red-300 shadow-sm">
              ● Rejected
            </span>
            <code className="text-[9px] text-slate-600 text-center font-bold mt-2">bg-red-100<br/>text-red-800</code>
          </div>

          <div className="flex flex-col items-center gap-3 bg-gray-50 hover:bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-[#0074E4]/5 hover:shadow-lg hover:shadow-[#0074E4]/20 hover:-translate-y-1 transition-all duration-300 min-w-[150px] cursor-pointer">
            <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-[10px] uppercase font-bold tracking-widest border border-gray-300 shadow-sm">
              ● Draft
            </span>
            <code className="text-[9px] text-slate-600 text-center font-bold mt-2">bg-gray-200<br/>text-gray-800</code>
          </div>
        </div>
      </section>

      {/* 6. Cards & Layout Wrappers */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#0074E4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
            Cards & Layout Wrappers
          </h2>
          <p className="text-slate-500 text-sm mt-1">The fundamental structural components for admin panels.</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-300 relative">
            <div className="absolute top-0 left-0 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-br-lg uppercase tracking-widest">
              Outer Page Wrapper
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-4">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Standard White Card</h3>
              <p className="text-slate-500 text-sm mb-4">Use this wrapper for any major segment of content on a page.</p>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-[10px] text-slate-600 whitespace-pre-wrap">
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="text-center pb-12">
        <p className="text-slate-400 text-sm italic">End of Design System Reference.</p>
      </div>
    </div>
  );
}
