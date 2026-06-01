"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const userAvatar = user?.photoURL || null;
  const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative inline-block text-left z-50 font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 px-2 py-1.5 md:px-3 md:py-2 rounded-full bg-[#0A3A35] border border-[#C5A059]/40 hover:border-[#C5A059] transition-all shadow-[0_0_15px_rgba(197,160,89,0.15)] hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] cursor-pointer shrink-0"
      >
        {userAvatar ? (
          <img src={userAvatar} alt="Profile" className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover border border-[#C5A059]" />
        ) : (
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] flex items-center justify-center font-bold text-[10px] md:text-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden md:block text-xs font-bold text-white tracking-wider max-w-[100px] truncate">
          {userName}
        </span>
        <svg className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-[#051815]/95 backdrop-blur-xl border border-[#C5A059]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden text-left animate-fadeIn">
          <div className="bg-[#0A2520]/50 px-4 py-3 border-b border-[#2A344A]">
            <p className="text-sm font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-[#C5A059] uppercase tracking-wider mt-0.5 truncate">{user.email}</p>
          </div>

          <div className="p-2 space-y-1">
            <button onClick={() => { setIsOpen(false); router.push('/admin'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group">
              <span className="text-lg">🎛️</span>
              <div className="flex-1">
                <span className="block text-xs font-bold text-gray-200 group-hover:text-[#C5A059] transition-colors">Dashboard</span>
              </div>
            </button>

            <button onClick={() => { setIsOpen(false); router.push('/checkout'); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group">
              <div className="flex items-center gap-3">
                <span className="text-lg">🛒</span>
                <span className="text-xs font-bold text-gray-200 group-hover:text-[#C5A059] transition-colors">My Cart</span>
              </div>
            </button>

            <button onClick={() => { setIsOpen(false); router.push('/admin?tab=notifications'); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <span className="text-xs font-bold text-gray-200 group-hover:text-[#C5A059] transition-colors">Notifications</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
          </div>

          <div className="p-2 border-t border-[#2A344A]">
            <button onClick={() => { setIsOpen(false); logout(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-left group">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span className="text-xs font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
