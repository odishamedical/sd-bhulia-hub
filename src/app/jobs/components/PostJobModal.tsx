import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CustomerProfile } from '@/types/gold-hub';
import { jobsCollection, Job } from '@/lib/jobs';
import { addDoc, serverTimestamp } from 'firebase/firestore';

interface PostJobModalProps {
  onClose: () => void;
  profile: CustomerProfile;
  onSuccess: () => void;
}

export default function PostJobModal({ onClose, profile, onSuccess }: PostJobModalProps) {
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
  const [shopId, setShopId] = useState(isAdmin ? 'platform' : profile.id);
  
  const [title, setTitle] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<'Full-time'|'Part-time'|'Contract'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [qualification, setQualification] = useState('Any');
  const [vacancies, setVacancies] = useState('1');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newJob: Omit<Job, 'id'> = {
        shopId,
        shopName,
        title,
        location,
        jobType,
        salaryRange,
        experience,
        qualification,
        vacancies: parseInt(vacancies) || 1,
        description,
        status: isAdmin ? 'Active' : 'Pending',
        createdAt: serverTimestamp() as any
      };
      await addDoc(jobsCollection, newJob);
      alert(isAdmin ? "Job posted successfully!" : "Job submitted! It will be public once approved by an Admin.");
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error posting job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#051815] border border-[#C5A059]/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#C5A059]">Post a New Job</h2>
            <p className="text-white/60 text-sm mt-1">
              {isAdmin 
                ? "Admin Mode: Your job will instantly become active."
                : "Vendor Mode: Your job will be published upon Admin approval."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin && (
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Shop ID / Assignment</label>
                <input 
                  type="text" 
                  value={shopId} 
                  onChange={e => setShopId(e.target.value)} 
                  className="w-full bg-black/40 border border-[#C5A059]/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]" 
                  placeholder="Use 'platform' for global" 
                  required
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAdmin && (
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Shop Name (Display)</label>
                  <input 
                    type="text" 
                    value={shopName} 
                    onChange={e => setShopName(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]" 
                    placeholder="e.g. Bhulia Hub Official" 
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Job Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]" 
                  placeholder="e.g. Master Weaver" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]" 
                  placeholder="e.g. Bhubaneswar, Odisha" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Job Type</label>
                <select 
                  value={jobType} 
                  onChange={e => setJobType(e.target.value as any)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Full-time" className="bg-[#051815]">Full-time</option>
                  <option value="Part-time" className="bg-[#051815]">Part-time</option>
                  <option value="Contract" className="bg-[#051815]">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Salary Range</label>
                <input 
                  type="text" 
                  value={salaryRange} 
                  onChange={e => setSalaryRange(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]" 
                  placeholder="e.g. ₹20,000 - ₹30,000" 
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Experience</label>
                <select 
                  value={experience} 
                  onChange={e => setExperience(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Fresher" className="bg-[#051815]">Fresher</option>
                  <option value="1-2 Years" className="bg-[#051815]">1-2 Years</option>
                  <option value="3-5 Years" className="bg-[#051815]">3-5 Years</option>
                  <option value="5-10 Years" className="bg-[#051815]">5-10 Years</option>
                  <option value="10+ Years" className="bg-[#051815]">10+ Years</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Qualification</label>
                <select 
                  value={qualification} 
                  onChange={e => setQualification(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Any" className="bg-[#051815]">Any</option>
                  <option value="10th Pass" className="bg-[#051815]">10th Pass</option>
                  <option value="12th Pass" className="bg-[#051815]">12th Pass</option>
                  <option value="Graduate" className="bg-[#051815]">Graduate</option>
                  <option value="Post Graduate" className="bg-[#051815]">Post Graduate</option>
                  <option value="Specialized Diploma" className="bg-[#051815]">Specialized Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Vacancies</label>
                <input 
                  type="number" 
                  value={vacancies} 
                  onChange={e => setVacancies(e.target.value)} 
                  min="1"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059]" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Job Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C5A059] h-32 resize-none" 
                placeholder="Detailed job description, responsibilities, and requirements..." 
                required
              />
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#0070F3] to-[#005bb5] text-[#ffffff] font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Post Job Listing'}
              </button>
              
              <p className="text-center text-xs text-white/40">
                You can manage your candidates from the 
                <a href={isAdmin ? "/admin" : "/vendor"} className="text-[#C5A059] hover:underline ml-1">Dashboard</a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
