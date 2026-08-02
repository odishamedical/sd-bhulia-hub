"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { atsConfig } from '@/config/ats.config';
import VendorATSManager from '@/components/ats/VendorATSManager';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ATSPage() {
  const { user, userData } = useAuth();
  const loading = false;

  if (loading) {
    return (
      <div className={`min-h-screen ${atsConfig.theme.primaryBg} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${atsConfig.theme.primaryBorder}`}></div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <main className={`min-h-screen ${atsConfig.theme.primaryBg} pt-32 pb-20 flex flex-col items-center justify-center`}>
        <Header />
        <div className="text-center text-white">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
          <p className="text-white/60 mb-8">You need to be logged in as a Vendor to manage applications.</p>
          <Link href="/login" className={`${atsConfig.theme.buttonSecondary} font-bold px-8 py-4 rounded-xl`}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const allowedRoles = ['store', 'weaver', 'wholesaler', 'admin', 'super_admin'];
  if (!allowedRoles.includes(userData.role?.toLowerCase() || '')) {
     return (
      <main className={`min-h-screen ${atsConfig.theme.primaryBg} pt-32 pb-20 flex flex-col items-center justify-center`}>
        <Header />
        <div className="text-center text-white">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Vendor Access Required</h2>
          <p className="text-white/60 mb-8">Only shop owners can access the ATS Manager.</p>
          <Link href="/jobs" className={`${atsConfig.theme.buttonSecondary} font-bold px-8 py-4 rounded-xl`}>
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${atsConfig.theme.primaryBg} pt-24 pb-20 relative overflow-hidden`}>
      <Header />
      <div className="absolute inset-0 z-0">
         <div className={`absolute top-0 right-0 w-[800px] h-[800px] ${atsConfig.theme.secondaryBg}/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none`} />
      </div>
      <div className="relative z-10 px-4 max-w-7xl mx-auto">
         <VendorATSManager shopId={user.uid} />
      </div>
    </main>
  );
}
