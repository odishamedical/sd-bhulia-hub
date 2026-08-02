"use client";

import React, { useState, useEffect } from "react";
import { atsConfig } from "@/config/ats.config";
import { Job, JobApplication, JobSeeker, jobsCollection, jobApplicationsCollection, jobSeekersCollection } from "@/lib/jobs";
import { query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { Briefcase, Users, User, CheckCircle2, XCircle, Clock, MapPin, Search, ChevronDown, ChevronUp, FileText } from "lucide-react";

export default function VendorATSManager({ shopId }: { shopId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<(JobApplication & { seekerData?: JobSeeker })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Jobs for this shop
        const qJobs = query(jobsCollection, where("shopId", "==", shopId));
        const jobsSnap = await getDocs(qJobs);
        const jobsData = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job));
        setJobs(jobsData);

        // Fetch Applications for this shop
        const qApps = query(jobApplicationsCollection, where("shopId", "==", shopId));
        const appsSnap = await getDocs(qApps);
        const appsData = appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as JobApplication));

        // Enrich applications with seeker data
        const enrichedApps = await Promise.all(appsData.map(async (app) => {
          const seekerDoc = await getDoc(doc(jobSeekersCollection, app.seekerId));
          return { ...app, seekerData: seekerDoc.exists() ? (seekerDoc.data() as JobSeeker) : undefined };
        }));

        setApplications(enrichedApps);
        
        if (jobsData.length > 0) setSelectedJob(jobsData[0].id!);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [shopId]);

  const updateStatus = async (appId: string, status: "Shortlisted" | "Rejected" | "Hired") => {
    try {
      await updateDoc(doc(jobApplicationsCollection, appId), { status });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const currentApps = applications.filter(a => a.jobId === selectedJob);

  if (loading) {
     return <div className="py-20 text-center"><div className="animate-spin h-10 w-10 border-4 border-[#C5A059] border-t-transparent mx-auto rounded-full"></div></div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 text-white min-h-[600px]">
      
      {/* Sidebar: Jobs List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <h2 className={`text-2xl font-bold ${atsConfig.theme.primaryText} mb-2`}>My Job Postings</h2>
        
        {jobs.length === 0 ? (
          <div className="bg-black/20 border border-white/5 p-6 rounded-2xl text-center">
            <p className="text-white/50">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          jobs.map(job => {
            const appCount = applications.filter(a => a.jobId === job.id).length;
            return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job.id!)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedJob === job.id ? 'bg-[#C5A059]/10 border-[#C5A059]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
              >
                <h3 className="font-bold text-lg mb-1">{job.title}</h3>
                <div className="flex justify-between text-sm">
                  <span className={`${job.status === 'Active' ? 'text-green-400' : 'text-yellow-500'}`}>{job.status}</span>
                  <span className="text-white/60 flex items-center gap-1"><Users className="w-4 h-4"/> {appCount} Apps</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Main Content: Applications Viewer */}
      <div className="w-full md:w-2/3 flex flex-col">
         {selectedJob ? (
           <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex-1 overflow-y-auto">
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
               <h2 className="text-2xl font-bold">Applicants <span className="text-[#C5A059]">({currentApps.length})</span></h2>
             </div>

             {currentApps.length === 0 ? (
               <div className="text-center py-20 text-white/50">
                 <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>No applications received for this job yet.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {currentApps.map(app => (
                   <div key={app.id} className={`border rounded-2xl overflow-hidden transition-all ${expandedApp === app.id ? 'border-[#C5A059]' : 'border-white/10 bg-white/5'}`}>
                      
                      {/* Summary Header */}
                      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id!)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center font-bold border border-white/10">
                            {app.seekerData?.fullName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold">{app.seekerData?.fullName || 'Unknown Candidate'}</h4>
                            <p className="text-sm text-white/60">{app.seekerData?.experienceYears || 0} Yrs Exp &bull; {app.seekerData?.district}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                             app.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                             app.status === 'Shortlisted' ? 'bg-blue-500/20 text-blue-400' :
                             app.status === 'Rejected' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                           }`}>{app.status}</span>
                           {expandedApp === app.id ? <ChevronUp className="w-5 h-5 text-white/40"/> : <ChevronDown className="w-5 h-5 text-white/40"/>}
                        </div>
                      </div>

                      {/* Expanded CV Viewer */}
                      {expandedApp === app.id && app.seekerData && (
                        <div className="p-6 border-t border-white/10 bg-black/60">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                 <h5 className="font-bold text-[#C5A059] mb-3 flex items-center gap-2"><User className="w-4 h-4"/> Contact Info</h5>
                                 <p className="text-sm text-white/80"><span className="opacity-50">Email:</span> {app.seekerData.email}</p>
                                 <p className="text-sm text-white/80"><span className="opacity-50">Phone:</span> {app.seekerData.phone}</p>
                                 <p className="text-sm text-white/80"><span className="opacity-50">WhatsApp:</span> {app.seekerData.whatsapp}</p>
                                 <p className="text-sm text-white/80"><span className="opacity-50">Address:</span> {app.seekerData.block}, {app.seekerData.district}, {app.seekerData.state}</p>
                              </div>
                              <div>
                                 <h5 className="font-bold text-[#C5A059] mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Skills</h5>
                                 <div className="flex flex-wrap gap-2">
                                   {app.seekerData.skills?.map(s => <span key={s} className="px-2 py-1 bg-white/10 rounded text-xs">{s}</span>)}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="mt-6">
                              <h5 className="font-bold text-[#C5A059] mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Experience</h5>
                              {app.seekerData.workHistory?.length ? app.seekerData.workHistory.map((w, i) => (
                                <div key={i} className="mb-3 pl-3 border-l-2 border-white/10">
                                  <p className="font-bold text-sm">{w.role}</p>
                                  <p className="text-xs text-white/60">{w.employer} | {w.duration}</p>
                                </div>
                              )) : <p className="text-sm text-white/50">No experience listed.</p>}
                           </div>

                           <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                              <button onClick={() => updateStatus(app.id!, 'Rejected')} className="px-4 py-2 rounded-lg font-bold text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30">Reject</button>
                              <button onClick={() => updateStatus(app.id!, 'Shortlisted')} className="px-4 py-2 rounded-lg font-bold text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Shortlist</button>
                              <button onClick={() => updateStatus(app.id!, 'Hired')} className="px-4 py-2 rounded-lg font-bold text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30">Mark Hired</button>
                           </div>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             )}
           </div>
         ) : (
           <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex items-center justify-center flex-1">
             <p className="text-white/50">Select a job from the left to view applications.</p>
           </div>
         )}
      </div>
    </div>
  );
}
