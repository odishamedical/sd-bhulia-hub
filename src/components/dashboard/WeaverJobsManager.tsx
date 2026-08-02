import React, { useState, useEffect } from 'react';
import { jobsCollection, jobApplicationsCollection, jobSeekersCollection, Job, JobApplication, JobSeeker } from '@/lib/jobs';
import { getDocs, query, where, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Plus, Briefcase, Users, FileText, Clock, MessageCircle } from 'lucide-react';

export default function WeaverJobsManager({ shopId }: { shopId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<(JobApplication & { seeker?: JobSeeker, jobTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<'Full-time'|'Part-time'|'Contract'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [qualification, setQualification] = useState('Any');
  const [vacancies, setVacancies] = useState('1');
  const [description, setDescription] = useState('');

  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (shopId) {
      fetchJobsAndApps();
    }
  }, [shopId]);

  const fetchJobsAndApps = async () => {
    setLoading(true);
    try {
      // Fetch Jobs
      const qJobs = query(jobsCollection, where("shopId", "==", shopId));
      const jobsSnap = await getDocs(qJobs);
      const jobsData = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job));
      setJobs(jobsData);

      // Fetch Applications
      const qApps = query(jobApplicationsCollection, where("shopId", "==", shopId));
      const appsSnap = await getDocs(qApps);
      const appsData = appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as JobApplication));
      
      // Enrich applications with seeker data
      const enrichedApps = [];
      for (const app of appsData) {
        const qSeeker = query(jobSeekersCollection, where("uid", "==", app.seekerId));
        const seekerSnap = await getDocs(qSeeker);
        const seeker = seekerSnap.empty ? undefined : (seekerSnap.docs[0].data() as JobSeeker);
        const jobTitle = jobsData.find(j => j.id === app.jobId)?.title || 'Unknown Job';
        enrichedApps.push({ ...app, seeker, jobTitle });
      }
      setApplications(enrichedApps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newJob: Omit<Job, 'id'> = {
        shopId,
        title,
        location,
        jobType,
        salaryRange,
        experience,
        qualification,
        vacancies: parseInt(vacancies) || 1,
        description,
        status: "Pending", // Always pending for admin approval
        createdAt: serverTimestamp() as any
      };
      await addDoc(jobsCollection, newJob);
      setShowForm(false);
      setTitle('');
      setLocation('');
      setSalaryRange('');
      setExperience('Fresher');
      setQualification('Any');
      setVacancies('1');
      setDescription('');
      fetchJobsAndApps();
      alert("Job posting submitted for Admin approval!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit job posting.");
    }
  };

  const updateAppStatus = async (appId: string, status: "Pending" | "Shortlisted" | "Rejected") => {
    try {
      await updateDoc(doc(jobApplicationsCollection, appId), { status });
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status } : a));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Job Data...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-[#0070F3] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Briefcase className="w-5 h-5" /> My Postings
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'applications' ? 'bg-[#0070F3] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users className="w-5 h-5" /> Candidates ({applications.length})
          </button>
        </div>
        {activeTab === 'jobs' && !showForm && (
          <button onClick={() => setShowForm(true)} className="bg-[#0070F3] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#005bb5]">
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Post a New Job</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. Sales Executive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. Bhubaneswar, Odisha" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select value={jobType} onChange={e => setJobType(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
                <input type="text" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. ₹15,000 - ₹25,000/month" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                  <option value="Fresher">Fresher</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5-10 Years">5-10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <select value={qualification} onChange={e => setQualification(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                  <option value="Any">Any</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Specialized Diploma">Specialized Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vacancies</label>
                <input required type="number" min="1" value={vacancies} onChange={e => setVacancies(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. 2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32" placeholder="Detailed job description, responsibilities, and requirements..."></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[#0070F3] text-white font-bold rounded-lg hover:bg-[#005bb5]">Submit for Approval</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'jobs' && !showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>You have not posted any jobs yet.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-lg ${job.status === 'Active' ? 'bg-green-500' : job.status === 'Pending' ? 'bg-amber-500' : 'bg-gray-500'}`}>
                  {job.status}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><Clock className="w-3 h-3"/> {job.jobType} • {job.location}</p>
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 line-clamp-3 mb-4">
                  {job.description}
                </div>
                <div className="flex justify-between items-center mt-auto border-t pt-3">
                  <span className="text-xs font-bold text-gray-400">Apps: {applications.filter(a => a.jobId === job.id).length}</span>
                  <button onClick={() => { setActiveTab('applications'); setSelectedJobId(job.id!); }} className="text-[#0070F3] text-sm font-bold hover:underline">View Candidates</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {selectedJobId && (
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600">Showing applicants for: {jobs.find(j => j.id === selectedJobId)?.title}</span>
              <button onClick={() => setSelectedJobId(null)} className="text-blue-600 text-xs font-bold hover:underline">Clear Filter</button>
            </div>
          )}
          <div className="divide-y divide-gray-100">
            {applications.filter(a => selectedJobId ? a.jobId === selectedJobId : true).length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No applications received yet.</p>
              </div>
            ) : (
              applications.filter(a => selectedJobId ? a.jobId === selectedJobId : true).map(app => (
                <div key={app.id} className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                    {app.seeker?.profileImage ? <img src={app.seeker.profileImage} className="w-full h-full rounded-full object-cover" /> : <Users className="w-8 h-8" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{app.seeker?.fullName || 'Unknown Candidate'}</h3>
                    <p className="text-sm text-[#0070F3] font-medium mb-2">Applied for: {app.jobTitle}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                      <span>📞 {app.seeker?.phone}</span>
                      <span>📍 {app.seeker?.block}, {app.seeker?.district}</span>
                      <span>⭐ {app.seeker?.experienceYears} years exp</span>
                    </div>
                    {app.seeker?.skills && (
                      <div className="flex flex-wrap gap-1">
                        {app.seeker.skills.slice(0, 5).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">{s}</span>
                        ))}
                        {app.seeker.skills.length > 5 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded border border-gray-200">+{app.seeker.skills.length - 5}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0 w-full lg:w-48">
                    <select 
                      value={app.status} 
                      onChange={(e) => updateAppStatus(app.id!, e.target.value as any)}
                      className={`w-full border rounded-lg px-3 py-2 text-sm font-bold ${app.status === 'Shortlisted' ? 'border-green-200 bg-green-50 text-green-700' : app.status === 'Rejected' ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-300'}`}
                    >
                      <option value="Pending">Pending Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    
                    <button 
                      onClick={() => window.open(`https://wa.me/91${app.seeker?.phone?.replace(/\D/g, '')}?text=Hi ${app.seeker?.fullName}, we saw your job application on Bhulia Hub.`, '_blank')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4"/> WhatsApp
                    </button>
                    <button className="w-full bg-[#0070F3] hover:bg-[#005bb5] text-white font-bold py-2 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4"/> Full Resume
                    </button>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
