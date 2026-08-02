"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { jobSeekersCollection } from '@/lib/jobs';
import SeekerWizard from '@/components/ats/SeekerWizard';
import SeekerDashboard from '@/components/ats/SeekerDashboard';
import { atsConfig } from '@/config/ats.config';
import Header from '@/components/Header';

export default function SeekerProfilePage() {
  const { user } = useAuth();
  const loading = false;
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [seekerData, setSeekerData] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(jobSeekersCollection, user.uid)).then((docSnap) => {
        setHasProfile(docSnap.exists());
        if (docSnap.exists()) {
          setSeekerData(docSnap.data());
        }
      }).catch(err => {
        console.error(err);
        setHasProfile(false);
      });
    }
  }, [user]);

  if (loading || hasProfile === null) {
    return (
      <div className={`min-h-screen ${atsConfig.theme.primaryBg} flex items-center justify-center pt-20`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${atsConfig.theme.primaryBorder}`}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className={`min-h-screen ${atsConfig.theme.primaryBg} pt-32 pb-20 flex flex-col items-center justify-center relative`}>
        <Header />
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${atsConfig.theme.secondaryBg}/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none`} />
        </div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4 text-white">
          <User className={`w-16 h-16 ${atsConfig.theme.primaryText} mx-auto mb-6 opacity-80`} />
          <h2 className="text-3xl font-serif font-bold mb-4">Login Required</h2>
          <p className="text-white/60 mb-8">You need to be logged in to create a {atsConfig.terminology.cvName}.</p>
          <Link href="/login" className={`${atsConfig.theme.buttonSecondary} font-bold px-8 py-4 rounded-xl w-full hover:opacity-90 transition-all text-center block`}>
            Sign In to Apply
          </Link>
        </div>
      </main>
    );
  }

  // Phase 3 Dashboard
  if (hasProfile && seekerData) {
    return (
      <main className={`min-h-screen ${atsConfig.theme.primaryBg} pt-32 pb-20 relative overflow-hidden flex flex-col`}>
        <Header />
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-1/4 left-1/4 w-[800px] h-[800px] ${atsConfig.theme.secondaryBg}/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none`} />
        </div>
        <div className="relative z-10 px-4">
          <SeekerDashboard seekerData={seekerData} />
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
      <div className="relative z-10 px-4">
        <SeekerWizard 
          userUid={user.uid} 
          userEmail={user.email} 
          onSuccess={() => {
             getDoc(doc(jobSeekersCollection, user.uid)).then(d => {
               setSeekerData(d.data());
               setHasProfile(true);
             });
          }} 
        />
      </div>
    </main>
  );
}
