"use client";

import React, { useState } from "react";

export default function ThemeEnginePage() {
  const [activeTheme, setActiveTheme] = useState("Default (Light)");

  const themes = [
    { name: "Default (Light)", type: "Standard", colors: ["#ffffff", "#2563eb", "#1f2937"] },
    { name: "Diwali Fest", type: "Seasonal Campaign", colors: ["#1e1b4b", "#f59e0b", "#ef4444"] },
    { name: "Wedding Season (Gold)", type: "Seasonal Campaign", colors: ["#fdfbf7", "#d97706", "#991b1b"] },
    { name: "Midnight Onyx", type: "Premium", colors: ["#09090b", "#c084fc", "#e2e8f0"] }
  ];

  const handleApplyTheme = (themeName: string) => {
    setActiveTheme(themeName);
    alert(`Applying ${themeName} theme across all ecosystem hubs via Next.js global state.`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Ecosystem Theme Engine</h1>
          <p className="text-gray-500 mt-2 font-medium">Instantly toggle colors, branding, and seasonal campaigns across all platforms.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
          </div>
          <div>
            <h3 className="font-black text-gray-900">Current Global Theme</h3>
            <p className="text-sm font-bold text-blue-600">{activeTheme}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Available Campaigns & Themes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme, idx) => (
            <div key={idx} className={`border-2 rounded-2xl p-6 transition-all ${activeTheme === theme.name ? 'border-blue-500 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-2 inline-block ${
                    theme.type === 'Seasonal Campaign' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    theme.type === 'Premium' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {theme.type}
                  </span>
                  <h3 className="font-black text-xl text-gray-900">{theme.name}</h3>
                </div>
                <div className="flex gap-1">
                  {theme.colors.map(color => (
                    <div key={color} className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
              </div>
              
              {activeTheme === theme.name ? (
                <button disabled className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold border border-gray-200 cursor-not-allowed">Currently Active</button>
              ) : (
                <button 
                  onClick={() => handleApplyTheme(theme.name)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-black transition-all"
                >
                  Activate Theme
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
