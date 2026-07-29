"use client";

import React, { useState } from 'react';

export default function DeviceSimulator() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [inputUrl, setInputUrl] = useState('/');
  const [currentUrl, setCurrentUrl] = useState('/');

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentUrl(inputUrl);
  };

  const setShortcut = (path: string) => {
    setInputUrl(path);
    setCurrentUrl(path);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-300 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-800 border-b border-slate-700 gap-4 shrink-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 shadow-inner">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-md flex items-center justify-center transition-colors ${device === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Mobile View (375px)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded-md flex items-center justify-center transition-colors ${device === 'tablet' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Tablet View (768px)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-md flex items-center justify-center transition-colors ${device === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Desktop View (Full Width)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shortcuts:</span>
            <button onClick={() => setShortcut('/')} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors">Home</button>
            <button onClick={() => setShortcut('/dashboard')} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors">User Dashboard</button>
            <button onClick={() => setShortcut('/admin')} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors">Admin Panel</button>
          </div>
        </div>

        <form onSubmit={handleNavigate} className="flex flex-1 max-w-2xl w-full">
          <div className="flex w-full bg-slate-900 rounded-full border border-slate-700 focus-within:border-blue-500 transition-colors overflow-hidden">
            <div className="flex items-center pl-4 text-slate-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. /, /dashboard, /admin"
              className="w-full bg-transparent border-none text-sm px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-0"
            />
            <button type="submit" className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors">
              Go
            </button>
          </div>
        </form>
      </div>

      {/* Simulator Area */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Device Frame */}
        <div 
          className={`relative transition-all duration-500 ease-in-out bg-white overflow-hidden shadow-2xl ${
            device === 'mobile' ? 'w-[375px] h-[812px] rounded-[3rem] border-[12px] border-slate-900 ring-4 ring-slate-800' :
            device === 'tablet' ? 'w-[768px] h-[1024px] rounded-[2rem] border-[16px] border-slate-900 ring-4 ring-slate-800' :
            'w-full h-full rounded-none border-none'
          }`}
        >
          {/* Dynamic Island / Notch for Mobile */}
          {device === 'mobile' && (
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
              <div className="w-32 h-6 bg-slate-900 rounded-b-3xl"></div>
            </div>
          )}

          <iframe
            src={currentUrl}
            className="w-full h-full border-none bg-white"
            title="Device Simulator"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
