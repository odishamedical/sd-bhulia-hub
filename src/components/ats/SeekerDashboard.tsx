"use client";

import React, { useState, useEffect } from "react";
import { atsConfig } from "@/config/ats.config";
import { JobSeeker, JobApplication, Job, jobApplicationsCollection, jobsCollection } from "@/lib/jobs";
import { query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Briefcase, FileText, Sparkles, MapPin, GraduationCap, Clock, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

export default function SeekerDashboard({ seekerData }: { seekerData: JobSeeker }) {
  const [activeTab, setActiveTab] = useState<"applications" | "cv" | "recommended">("applications");
  const [applications, setApplications] = useState<(JobApplication & { jobData?: Job })[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const q = query(jobApplicationsCollection, where("seekerId", "==", seekerData.uid));
        const snapshot = await getDocs(q);
        const appsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as JobApplication));
        
        // Fetch corresponding job data for each application
        const enrichedApps = await Promise.all(appsData.map(async (app) => {
          const jobDoc = await getDoc(doc(jobsCollection, app.jobId));
          return { ...app, jobData: jobDoc.exists() ? (jobDoc.data() as Job) : undefined };
        }));
        
        setApplications(enrichedApps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingApps(false);
      }
    }
    fetchApps();
  }, [seekerData.uid]);

  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case "Pending": return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/30">Pending Review</span>;
      case "Shortlisted": return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">Shortlisted</span>;
      case "Hired": return <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold border border-green-500/30"><CheckCircle2 className="w-3 h-3 inline mr-1"/> Hired</span>;
      case "Rejected": return <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-bold border border-red-500/30"><XCircle className="w-3 h-3 inline mr-1"/> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto rounded-3xl p-6 md:p-10 text-white ${atsConfig.theme.primaryBg} border ${atsConfig.theme.primaryBorder}/20 shadow-2xl`}>
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-10 border-b border-white/10">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#C5A059] relative">
          {seekerData.profileImage ? (
            <Image src={seekerData.profileImage} alt={seekerData.fullName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-black/40 flex items-center justify-center text-3xl font-bold">{seekerData.fullName.charAt(0)}</div>
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold mb-1">{seekerData.fullName}</h1>
          <p className="text-[#C5A059] font-medium mb-3">{atsConfig.terminology.seekerTitle}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {seekerData.block}, {seekerData.district}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {seekerData.experienceYears || seekerData.workHistory?.length || 0} Yrs Exp</span>
            <span className="flex items-center gap-1"><FileText className="w-4 h-4"/> {seekerData.preferredJobType}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab("applications")} className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "applications" ? atsConfig.theme.secondaryBg + " text-white" : "bg-black/20 text-white/60 hover:bg-black/40"}`}>
          My Applications
        </button>
        <button onClick={() => setActiveTab("cv")} className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "cv" ? atsConfig.theme.secondaryBg + " text-white" : "bg-black/20 text-white/60 hover:bg-black/40"}`}>
          View {atsConfig.terminology.cvName}
        </button>
        <button onClick={() => setActiveTab("recommended")} className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "recommended" ? atsConfig.theme.secondaryBg + " text-white" : "bg-black/20 text-white/60 hover:bg-black/40"}`}>
          Recommended Jobs
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        
        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-4 animate-in fade-in">
            {loadingApps ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C5A059]"></div></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/5">
                <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
                <p className="text-white/60">You haven't applied to any jobs on {atsConfig.projectName}.</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all">
                  <div>
                    <h3 className="text-xl font-bold text-[#C5A059] mb-1">{app.jobData?.title || "Unknown Role"}</h3>
                    <p className="text-white/80 font-medium">{app.jobData?.shopName || "Unknown Company"}</p>
                    <p className="text-sm text-white/50 mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3"/> Applied on {app.createdAt instanceof Date ? app.createdAt.toLocaleDateString() : new Date((app.createdAt as any)?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge status={app.status} />
                    <button className="text-xs text-white/60 hover:text-white underline">View Job Post</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CV Tab */}
        {activeTab === "cv" && (
          <div className="space-y-8 animate-in fade-in bg-black/20 p-8 rounded-3xl border border-white/5">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#C5A059] flex items-center gap-2"><Sparkles className="w-5 h-5"/> Core Skills</h3>
              <div className="flex flex-wrap gap-2">
                {seekerData.skills?.map(s => (
                  <span key={s} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-[#C5A059] flex items-center gap-2"><Briefcase className="w-5 h-5"/> Experience</h3>
              {seekerData.workHistory?.length > 0 ? (
                <div className="space-y-4">
                  {seekerData.workHistory.map((w, i) => (
                    <div key={i} className="border-l-2 border-[#C5A059] pl-4">
                      <h4 className="font-bold text-lg">{w.role}</h4>
                      <p className="text-white/70">{w.employer} &bull; {w.duration}</p>
                      <p className="text-white/50 text-sm mt-2">{w.responsibilities}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-white/50">Fresher / No experience listed.</p>}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-[#C5A059] flex items-center gap-2"><GraduationCap className="w-5 h-5"/> Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seekerData.education?.map((e, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="font-bold text-lg">{e.degree}</h4>
                    <p className="text-white/70">{e.institution}</p>
                    <div className="flex justify-between text-sm text-white/50 mt-2">
                      <span>{e.year}</span>
                      <span>{e.marks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommended Tab */}
        {activeTab === "recommended" && (
          <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/5 animate-in fade-in">
            <Sparkles className="w-12 h-12 text-[#C5A059] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Algorithm Training...</h3>
            <p className="text-white/60">Our recommendation engine is currently analyzing your profile. Check back later for curated job matches!</p>
          </div>
        )}

      </div>
    </div>
  );
}
