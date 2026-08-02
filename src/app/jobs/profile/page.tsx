"use client";

import React, { useState, useEffect } from 'react';
import { User, Briefcase, ChevronRight, ChevronLeft, Upload, CheckCircle2, GraduationCap, MapPin } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { jobSeekersCollection, JobSeeker } from '@/lib/jobs';
import { INDIAN_STATES, ODISHA_DISTRICT_BLOCKS } from '@/lib/locations';

export default function SeekerProfilePage() {
  const profile = null;
  const loginDemo = () => {};
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: 'India',
    state: '',
    district: '',
    block: '',
    localAddress: '',
    pincode: '',
    skills: [] as string[],
    experienceYears: 0,
    expectedSalary: '',
    education: [{ degree: '', year: '', percentage: '' }],
    workHistory: [{ employer: '', years: '', position: '' }],
  });

  const SKILL_OPTIONS = ['Sales Executive', 'Goldsmith', 'Showroom Manager', 'Accountant', 'Appraiser', 'Marketing', 'Security'];

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addEducation = () => {
    if (formData.education.length < 4) {
      setFormData(prev => ({ ...prev, education: [...prev.education, { degree: '', year: '', percentage: '' }] }));
    }
  };

  const addExperience = () => {
    if (formData.workHistory.length < 4) {
      setFormData(prev => ({ ...prev, workHistory: [...prev.workHistory, { employer: '', years: '', position: '' }] }));
    }
  };

  useEffect(() => {
    if (profile && !formData.email) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || profile.whatsapp || ''
      }));
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    
    try {
      let finalProfileImageUrl = '';
      if (profileImageFile) {
        const storageRef = ref(storage, `profiles/${profile.id}/${profileImageFile.name}`);
        await uploadBytes(storageRef, profileImageFile);
        finalProfileImageUrl = await getDownloadURL(storageRef);
      }

      const seekerData: JobSeeker = {
        uid: profile.id,
        ...formData,
        profileImage: finalProfileImageUrl,
        isLookingForJob: true
      };

      await setDoc(doc(jobSeekersCollection, profile.id), seekerData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#f8fafc] pt-32 pb-20 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0070F3]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        </div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <User className="w-16 h-16 text-[#0070F3] mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-[#FDF8F5]/60 mb-8">You need to be logged in to create a Job Seeker profile.</p>
          <Link href="/login" className="bg-gradient-to-r from-[#0070F3] to-[#005bb5] text-[#f8fafc] font-bold px-8 py-4 rounded-xl w-full hover:opacity-90 transition-all shadow-[0_0_20px_rgba(227,176,97,0.3)] text-center block">
            Sign In to Apply
          </Link>
        </div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f8fafc] pt-32 pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#25D366]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
        </div>
        <div className="relative z-10 max-w-md w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-[24px] border border-[#25D366]/30 rounded-[2rem] p-10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_40px_rgba(37,211,102,0.1)]">
          <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_0_2px_10px_rgba(37,211,102,0.5)]">
            <CheckCircle2 className="w-10 h-10 text-[#25D366]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">Profile Created!</h2>
          <p className="text-[#FDF8F5]/60 mb-8">Your Custom Gold Dunia CV is now live. Shop owners in your city can now find you and contact you for opportunities.</p>
          <Link href="/jobs" className="bg-white/10 text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-all inline-block w-full">
            Back to Job Board
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0070F3]/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#005bb5]/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-serif tracking-wide font-bold text-gray-900 mb-4">Build Your Gold Dunia CV</h1>
          <p className="text-[#FDF8F5]/60">Complete your profile to let top jewelry shops find you.</p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center justify-center mb-12 max-w-lg mx-auto">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className={`flex flex-col items-center gap-2 ${step >= num ? 'text-[#0070F3]' : 'text-[#FDF8F5]/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold ${step >= num ? 'border-[#0070F3] bg-[#0070F3]/10' : 'border-[#FDF8F5]/30 bg-transparent'}`}>
                  {num}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-mono">{num === 1 ? 'Basics' : num === 2 ? 'Education' : 'Experience'}</span>
              </div>
              {num < 3 && <div className={`w-12 md:w-20 h-0.5 mx-2 md:mx-4 ${step > num ? 'bg-[#0070F3]' : 'bg-[#FDF8F5]/20'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-[24px] border border-white/20 border-b-white/5 border-r-white/5 rounded-[2rem] p-6 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <User className="w-5 h-5 text-[#0070F3]" />
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-white/20 bg-black/40 flex items-center justify-center group hover:border-[#0070F3] transition-colors cursor-pointer">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-900/40 group-hover:text-[#0070F3] transition-colors" />
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <span className="text-xs text-[#FDF8F5]/60 mt-2">Upload Profile Photo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Full Name</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" />
                </div>
                
                {/* Location Mapping */}
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Country</label>
                  <select required value={formData.country === 'India' ? 'India' : (formData.country ? 'Other' : '')} onChange={e => setFormData({...formData, country: e.target.value === 'Other' ? '' : e.target.value, state: '', district: '', block: ''})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors">
                    <option value="India" className="bg-[#0A101C] text-gray-900">India</option>
                    <option value="Other" className="bg-[#0A101C] text-gray-900">Other</option>
                  </select>
                  {formData.country !== 'India' && (
                    <input type="text" required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors mt-2" placeholder="Enter Country" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">State / Province</label>
                  {formData.country === 'India' ? (
                    <select required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: '', block: ''})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors">
                      <option value="" className="bg-[#0A101C] text-gray-900">Select State</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st} className="bg-[#0A101C] text-gray-900">{st}</option>)}
                    </select>
                  ) : (
                    <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" placeholder="Enter State" />
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">District</label>
                  {(formData.country === 'India' && formData.state === 'Odisha') ? (
                    <select required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value, block: ''})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors">
                      <option value="" className="bg-[#0A101C] text-gray-900">Select District</option>
                      {Object.keys(ODISHA_DISTRICT_BLOCKS).map(dst => <option key={dst} value={dst} className="bg-[#0A101C] text-gray-900">{dst}</option>)}
                    </select>
                  ) : (
                    <input type="text" required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" placeholder="e.g. Pune" />
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">City / Block</label>
                  {(formData.country === 'India' && formData.state === 'Odisha' && formData.district) ? (
                    <select required value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors">
                      <option value="" className="bg-[#0A101C] text-gray-900">Select Block</option>
                      {(ODISHA_DISTRICT_BLOCKS[formData.district] || []).map(b => <option key={b} value={b} className="bg-[#0A101C] text-gray-900">{b}</option>)}
                    </select>
                  ) : (
                    <input type="text" required value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" placeholder="e.g. Bhubaneswar" />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Local Address</label>
                  <textarea 
                    value={formData.localAddress} 
                    onChange={e => setFormData({...formData, localAddress: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors resize-none h-24"
                    placeholder="House No, Street, Landmark"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Pincode</label>
                  <input type="text" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" placeholder="e.g. 751001" />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="button" onClick={() => setStep(2)} disabled={!formData.fullName || !formData.phone || !formData.block || !formData.state} className="bg-gradient-to-r from-[#0070F3] to-[#005bb5] text-[#f8fafc] font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <GraduationCap className="w-5 h-5 text-[#0070F3]" />
                <h2 className="text-xl font-bold text-gray-900">Skills & Education</h2>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-4">Select Core Skills (Check all that apply)</label>
                <div className="flex flex-wrap gap-3">
                  {SKILL_OPTIONS.map(skill => (
                    <button 
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${formData.skills.includes(skill) ? 'bg-[#0070F3]/20 border-[#0070F3] text-[#0070F3]' : 'bg-white/5 border-white/10 text-[#FDF8F5]/60 hover:bg-white/10 hover:text-gray-900'}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest">Education Details</label>
                  {formData.education.length < 4 && (
                    <button type="button" onClick={addEducation} className="text-xs text-[#0070F3] font-bold hover:underline">+ Add Row</button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <input type="text" value={edu.degree} onChange={e => {
                          const newEdu = [...formData.education];
                          newEdu[idx].degree = e.target.value;
                          setFormData({...formData, education: newEdu});
                        }} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 focus:outline-none focus:border-[#0070F3]" placeholder="Degree / Certificate" required />
                      </div>
                      <div>
                        <input type="text" value={edu.year} onChange={e => {
                          const newEdu = [...formData.education];
                          newEdu[idx].year = e.target.value;
                          setFormData({...formData, education: newEdu});
                        }} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 focus:outline-none focus:border-[#0070F3]" placeholder="Passing Year" required />
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={edu.percentage} onChange={e => {
                          const newEdu = [...formData.education];
                          newEdu[idx].percentage = e.target.value;
                          setFormData({...formData, education: newEdu});
                        }} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 focus:outline-none focus:border-[#0070F3]" placeholder="Percentage / Grade" required />
                        {formData.education.length > 1 && (
                          <button type="button" onClick={() => {
                            const newEdu = formData.education.filter((_, i) => i !== idx);
                            setFormData({...formData, education: newEdu});
                          }} className="text-red-400 hover:text-red-300 px-2 font-bold">X</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} disabled={formData.skills.length === 0} className="bg-gradient-to-r from-[#0070F3] to-[#005bb5] text-[#f8fafc] font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Briefcase className="w-5 h-5 text-[#0070F3]" />
                <h2 className="text-xl font-bold text-gray-900">Experience & Submission</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Total Experience (Years)</label>
                  <input type="number" min="0" required value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest mb-2">Expected Salary (Monthly)</label>
                  <input type="text" required value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-[#0070F3] transition-colors" placeholder="e.g. ₹25,000" />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-mono text-[#FDF8F5]/60 uppercase tracking-widest">Work History (Optional)</label>
                  {formData.workHistory.length < 4 && (
                    <button type="button" onClick={addExperience} className="text-xs text-[#0070F3] font-bold hover:underline">+ Add Row</button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {formData.workHistory.map((work, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <input type="text" value={work.employer} onChange={e => {
                          const newWork = [...formData.workHistory];
                          newWork[idx].employer = e.target.value;
                          setFormData({...formData, workHistory: newWork});
                        }} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 focus:outline-none focus:border-[#0070F3]" placeholder="Employer / Shop Name" />
                      </div>
                      <div>
                        <input type="text" value={work.position} onChange={e => {
                          const newWork = [...formData.workHistory];
                          newWork[idx].position = e.target.value;
                          setFormData({...formData, workHistory: newWork});
                        }} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 focus:outline-none focus:border-[#0070F3]" placeholder="Position / Role" />
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={work.years} onChange={e => {
                          const newWork = [...formData.workHistory];
                          newWork[idx].years = e.target.value;
                          setFormData({...formData, workHistory: newWork});
                        }} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 focus:outline-none focus:border-[#0070F3]" placeholder="Duration (e.g. 2 Years)" />
                        {formData.workHistory.length > 1 && (
                          <button type="button" onClick={() => {
                            const newWork = formData.workHistory.filter((_, i) => i !== idx);
                            setFormData({...formData, workHistory: newWork});
                          }} className="text-red-400 hover:text-red-300 px-2 font-bold">X</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <button type="button" onClick={() => setStep(2)} className="text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-[#25D366] text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-[#128C7E] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50">
                  {isSubmitting ? 'Saving Profile...' : 'Save Custom CV'} <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </main>
  );
}
