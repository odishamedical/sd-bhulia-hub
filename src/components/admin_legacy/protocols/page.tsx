"use client";
import React from "react";

export default function ProtocolsGuide() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="border-b border-[#C5A059]/30 pb-6 mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Operations & Upload Protocols</h1>
        <p className="text-slate-500 max-w-3xl">
          The official source of truth for global platform rules. 
          To maintain the luxury aesthetic and logistical efficiency of Bhulia.com, 
          all admin staff and franchise operators must strictly adhere to these guidelines.
        </p>
      </div>

      {/* 1. Image Dimensions & Formats */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#C5A059] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">1</span>
            Required Image Dimensions
          </h2>
          <p className="text-slate-500 text-sm mt-1">Strict aspect ratios ensure a unified layout across mobile and desktop.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Products */}
          <div className="space-y-4">
            <div className="aspect-[9/16] max-w-[200px] bg-gray-100 rounded-xl border-2 border-dashed border-[#C5A059] flex flex-col items-center justify-center mx-auto shadow-inner">
              <span className="font-bold text-slate-800 text-lg">9:16</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Portrait</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-slate-900">Product Catalog Images</h3>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li><span className="font-bold">Resolution:</span> 1080 x 1920 pixels</li>
                <li><span className="font-bold">Format:</span> High-res JPG or WebP</li>
                <li><span className="font-bold">Rule:</span> Pure light/white background.</li>
                <li><span className="font-bold">Why 9:16?:</span> Sarees are vertical garments. A square crop cuts off exquisite border detailing. 9:16 natively fills mobile screens for a luxury experience.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            {/* Hero */}
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full bg-gray-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shadow-inner">
                <span className="font-bold text-slate-800">16:9 Landscape</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-slate-900 text-sm">Hero Promotional Banners</h3>
                <p className="text-xs text-slate-600 mt-1"><span className="font-bold">Resolution:</span> 1920 x 1080 pixels (Max 2MB)</p>
              </div>
            </div>

            {/* Logos */}
            <div className="space-y-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="font-bold text-slate-800 text-[10px]">1:1</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Store / Weaver Logos</h3>
                <p className="text-xs text-slate-600 mt-1"><span className="font-bold">Resolution:</span> 500 x 500 pixels (Square). System will auto-crop to circular.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Global Address & Shipping Rules */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#C5A059] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">2</span>
            BVC Armored Transit: Global Address Rules
          </h2>
          <p className="text-slate-500 text-sm mt-1">To prevent logistical delays with high-value silk shipments, addresses must be perfectly formatted.</p>
        </div>
        
        <div className="bg-[#051815] rounded-xl p-6 border border-[#C5A059]/40 text-white shadow-lg">
          <h3 className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4">Mandatory Shipping Format</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✖</span>
                <span className="text-gray-400">Near Temple, Bargarh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✔</span>
                <span>
                  <strong>House/Plot:</strong> Plot 45<br/>
                  <strong>Street:</strong> Weaver Colony, Ward 3<br/>
                  <strong>Landmark:</strong> Near Samaleswari Temple<br/>
                  <strong>City/District:</strong> Bargarh, Odisha<br/>
                  <strong>PIN:</strong> 768028
                </span>
              </li>
            </ul>

            <div className="bg-[#0A2520] p-4 rounded-lg border border-[#C5A059]/20">
              <h4 className="font-bold text-white mb-2">Strict Enforcements:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                <li>PIN codes must be exactly 6 digits (India).</li>
                <li>Phone numbers must include +91 country code.</li>
                <li>P.O. Boxes are STRICTLY PROHIBITED for BVC luxury transit.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Verification Protocols */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-[#C5A059] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">3</span>
            Bhulia.com Approval Checklists
          </h2>
          <p className="text-slate-500 text-sm mt-1">Admin staff must complete these checks before hitting "Approve".</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-bold text-slate-900 border-b border-gray-200 pb-2 mb-3">Weaver Onboarding Checklist</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><input type="checkbox" readOnly checked className="accent-[#C5A059]" /> Aadhar / Gov ID Verified</li>
              <li className="flex items-center gap-2"><input type="checkbox" readOnly checked className="accent-[#C5A059]" /> Bank Account Matches Legal Name</li>
              <li className="flex items-center gap-2"><input type="checkbox" readOnly checked className="accent-[#C5A059]" /> Artisan / Weaver Cooperative ID Uploaded</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-bold text-slate-900 border-b border-gray-200 pb-2 mb-3">Product Approval Checklist</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><input type="checkbox" readOnly checked className="accent-[#C5A059]" /> 9:16 Portrait Image Verified</li>
              <li className="flex items-center gap-2"><input type="checkbox" readOnly checked className="accent-[#C5A059]" /> GI Tag / Silk Mark Authenticated</li>
              <li className="flex items-center gap-2"><input type="checkbox" readOnly checked className="accent-[#C5A059]" /> Weight & Dimensions Documented</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}
