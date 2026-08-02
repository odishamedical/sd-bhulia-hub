"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, ChevronLeft, Upload, Building2, Briefcase, FileText, Image as ImageIcon } from "lucide-react";
import { atsConfig } from "@/config/ats.config";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { jobsCollection, Job } from "@/lib/jobs";
import Image from "next/image";

interface PostJobModalProps {
  onClose: () => void;
  profile: any; // User Profile
  onSuccess: () => void;
}

export default function PostJobModal({ onClose, profile, onSuccess }: PostJobModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Page 1
    shopName: profile?.companyName || profile?.name || "",
    industry: "",
    companyWebsite: "",
    companyAddress: profile?.address || "",
    contactName: profile?.name || "",
    contactEmail: profile?.email || "",
    contactPhone: profile?.phone || "",
    contactWhatsapp: "",
    // Page 2
    title: "",
    jobType: "Full-time",
    location: "",
    salaryRange: "",
    experience: "",
    qualification: "",
    skillsRequired: [] as string[],
    vacancies: 1,
    deadline: "",
    // Page 3
    description: "",
    keyResponsibilities: "",
    benefits: [] as string[],
    workSchedule: "Day Shift",
    additionalNotes: ""
  });

  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");

  // Load Draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`${atsConfig.dbPrefix}_job_draft_${profile?.id}`);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [profile?.id]);

  const saveDraft = () => {
    localStorage.setItem(`${atsConfig.dbPrefix}_job_draft_${profile?.id}`, JSON.stringify(formData));
    alert("Draft saved locally!");
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    const current = formData.skillsRequired;
    if (current.includes(skill)) {
      updateForm('skillsRequired', current.filter(s => s !== skill));
    } else {
      updateForm('skillsRequired', [...current, skill]);
    }
  };

  const toggleBenefit = (benefit: string) => {
    const current = formData.benefits;
    if (current.includes(benefit)) {
      updateForm('benefits', current.filter(b => b !== benefit));
    } else {
      updateForm('benefits', [...current, benefit]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCompanyLogoFile(file);
      setCompanyLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step: number) => {
    setErrorMsg("");
    if (step === 1) {
      if (!companyLogoFile && !companyLogoPreview && !formData.industry) {
        // Just enforcing basics to prevent huge blocking
        if (!formData.shopName || !formData.industry || !formData.contactEmail || !formData.contactPhone || !formData.contactWhatsapp) {
           setErrorMsg("Please fill all mandatory company details including Phone and WhatsApp.");
           return false;
        }
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.location || !formData.deadline) {
         setErrorMsg("Please fill Job Title, Location, and Deadline.");
         return false;
      }
    }
    if (step === 3) {
      if (!formData.description) {
         setErrorMsg("Please provide a Job Description.");
         return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (previewMode) setPreviewMode(false);
    else setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!companyLogoFile && !companyLogoPreview) {
      setErrorMsg("Company Logo is required.");
      setPreviewMode(false);
      setCurrentStep(1);
      return;
    }
    setSubmitting(true);
    try {
      let logoUrl = companyLogoPreview;
      if (companyLogoFile) {
        const imageRef = ref(storage, `${atsConfig.dbPrefix}_logos/${profile.id}_${Date.now()}`);
        await uploadBytes(imageRef, companyLogoFile);
        logoUrl = await getDownloadURL(imageRef);
      }

      const jobData: Job = {
        shopId: profile.id,
        shopName: formData.shopName,
        companyLogo: logoUrl,
        industry: formData.industry,
        companyWebsite: formData.companyWebsite,
        companyAddress: formData.companyAddress,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactWhatsapp: formData.contactWhatsapp,
        
        title: formData.title,
        jobType: formData.jobType as any,
        location: formData.location,
        salaryRange: formData.salaryRange,
        experience: formData.experience,
        qualification: formData.qualification,
        skillsRequired: formData.skillsRequired,
        vacancies: formData.vacancies,
        deadline: formData.deadline,
        
        description: formData.description,
        keyResponsibilities: formData.keyResponsibilities,
        benefits: formData.benefits,
        workSchedule: formData.workSchedule,
        additionalNotes: formData.additionalNotes,
        
        status: "Pending", // Needs admin approval
        isDraft: false,
        createdAt: serverTimestamp()
      };

      const newDocRef = doc(jobsCollection);
      await setDoc(newDocRef, jobData);
      
      localStorage.removeItem(`${atsConfig.dbPrefix}_job_draft_${profile?.id}`);
      onSuccess();
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-4xl bg-[#111111] border border-[#DAA520]/60 rounded-[32px] overflow-hidden relative shadow-[0_0_40px_rgba(218,165,32,0.4),inset_0_2px_15px_rgba(255,255,255,0.05)] flex flex-col my-8`}>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#ffd266] to-transparent opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#ffd266] to-transparent opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 pointer-events-none"></div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DAA520]/20 sticky top-0 bg-[#111]/80 backdrop-blur-md z-20">
          <h2 className="text-[28px] font-bold text-white">
            {previewMode ? "Preview Job Post" : "Post a New Job"}
          </h2>
          <button onClick={onClose} className="p-2 bg-[#222] hover:bg-[#333] hover:text-white rounded-full transition-colors text-gray-400 border border-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 text-white flex-1 overflow-y-auto min-h-[500px]">
          
          {!previewMode && (
            <div className="mb-8 relative z-10">
              <div className="flex justify-between items-center relative max-w-md mx-auto">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -z-10 -translate-y-1/2 rounded-full"></div>
                <div className={`absolute top-1/2 left-0 h-1 ${atsConfig.theme.secondaryBg} -z-10 -translate-y-1/2 transition-all duration-300 rounded-full`} style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
                {[1,2,3].map(step => (
                  <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step ? 'bg-gradient-to-r from-yellow-500 to-[#DAA520] text-black shadow-[0_0_15px_rgba(218,165,32,0.6)] border-0' : 'bg-[#222] text-gray-400 border border-gray-600'}`}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-[#3b0b0b] border border-red-500 text-red-200 shadow-[0_0_10px_rgba(220,38,38,0.3)] px-4 py-3 rounded-xl mb-6 text-sm text-center font-bold">
              {errorMsg}
            </div>
          )}

          {/* PREVIEW MODE */}
          {previewMode ? (
            <div className="space-y-8">
              <div className="p-8 bg-black/40 rounded-2xl border border-gray-200">
                 <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative">
                      {companyLogoPreview ? <Image src={companyLogoPreview} alt="Logo" fill className="object-cover"/> : <ImageIcon className="w-8 h-8 m-auto mt-8 text-gray-300"/>}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-[#C5A059]">{formData.title}</h1>
                      <p className="text-xl text-gray-700">{formData.shopName}</p>
                      <p className="text-sm text-gray-500">{formData.location} &bull; {formData.jobType}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="opacity-50 block text-xs">Salary</span>{formData.salaryRange || 'Not disclosed'}</div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="opacity-50 block text-xs">Experience</span>{formData.experience || 'Any'}</div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="opacity-50 block text-xs">Vacancies</span>{formData.vacancies}</div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="opacity-50 block text-xs">Apply By</span>{formData.deadline}</div>
                 </div>
                 <div>
                   <h3 className="font-bold text-lg mb-2 text-white font-extrabold">Job Description</h3>
                   <p className="whitespace-pre-wrap text-gray-600">{formData.description}</p>
                 </div>
                 <div className="mt-6">
                   <h3 className="font-bold text-lg mb-2 text-white font-extrabold">Required Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {formData.skillsRequired.map(s => <span key={s} className="px-3 py-1 bg-gray-100 rounded-full text-xs">{s}</span>)}
                   </div>
                 </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-xl text-sm text-center">
                 Your contact details (Email, Phone, WhatsApp) will remain hidden from the public and are for administrative use only.
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Company Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <h2 className="text-xl font-extrabold flex items-center gap-2 text-white"><Building2 className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Company Details</h2>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <label className={`w-32 h-32 shrink-0 border-2 border-dashed border-[#DAA520]/50 rounded-2xl ${atsConfig.theme.cardBg} hover:bg-[#141414] transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden relative hover:bg-[#1a1a1a] shadow-[0_0_10px_rgba(218,165,32,0.1)]`}>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        {companyLogoPreview ? (
                          <Image src={companyLogoPreview} alt="Preview" fill className="object-cover" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-[#DAA520] drop-shadow-[0_0_8px_rgba(218,165,32,0.8)] mb-2" />
                            <span className="text-xs font-bold text-center px-2 text-white">Upload Logo</span>
                          </>
                        )}
                    </label>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Company Name *</label>
                        <input type="text" value={formData.shopName} onChange={e=>updateForm('shopName', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Job Category *</label>
                        <input list="categoriesList" placeholder="Select or type..." value={formData.industry} onChange={e=>updateForm('industry', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                          <datalist id="categoriesList">
                            {atsConfig.industries.map(i => <option key={i} value={i} />)}
                          </datalist>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Company Address</label>
                        <input type="text" value={formData.companyAddress} onChange={e=>updateForm('companyAddress', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold border-t border-[#333] pt-6 text-[#DAA520]">Private Contact Info (Hidden from Public)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Contact Person *</label>
                      <input type="text" value={formData.contactName} onChange={e=>updateForm('contactName', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Email *</label>
                      <input type="email" value={formData.contactEmail} onChange={e=>updateForm('contactEmail', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Phone *</label>
                      <input type="tel" value={formData.contactPhone} onChange={e=>updateForm('contactPhone', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">WhatsApp *</label>
                      <input type="tel" value={formData.contactWhatsapp} onChange={e=>updateForm('contactWhatsapp', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Job Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <h2 className="text-xl font-extrabold flex items-center gap-2 text-white"><Briefcase className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Job Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Job Title *</label>
                      <input type="text" placeholder="e.g. Master Weaver, Sales Executive" value={formData.title} onChange={e=>updateForm('title', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Job Type</label>
                      <select value={formData.jobType} onChange={e=>updateForm('jobType', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Location (City, State or Remote) *</label>
                      <input type="text" value={formData.location} onChange={e=>updateForm('location', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Salary Range</label>
                      <input type="text" placeholder="e.g. ₹15k - ₹20k / month" value={formData.salaryRange} onChange={e=>updateForm('salaryRange', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Application Deadline *</label>
                      <input type="date" value={formData.deadline} onChange={e=>updateForm('deadline', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3" style={{colorScheme:'dark'}} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-3">Skills Required</label>
                    <div className="flex flex-wrap gap-2">
                      {atsConfig.skills.map(skill => (
                        <button key={skill} onClick={() => toggleSkill(skill)} className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${formData.skillsRequired.includes(skill) ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]' : 'bg-black/20 border-gray-200 text-white/60'}`}>
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Job Description & Extras */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in">
                  <h2 className="text-xl font-extrabold flex items-center gap-2 text-white"><FileText className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Description & Extras</h2>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Detailed Job Description *</label>
                    <textarea value={formData.description} onChange={e=>updateForm('description', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3 min-h-[150px]"></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Key Responsibilities</label>
                    <textarea value={formData.keyResponsibilities} onChange={e=>updateForm('keyResponsibilities', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3 min-h-[100px]"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-3">Benefits Offered</label>
                      <div className="flex flex-col gap-2">
                        {["Health Insurance", "PF", "Bonus / Incentives", "Flexible Hours", "Accommodation"].map(b => (
                          <label key={b} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={formData.benefits.includes(b)} onChange={() => toggleBenefit(b)} className="w-4 h-4 accent-[#C5A059]" /> {b}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Work Schedule</label>
                      <select value={formData.workSchedule} onChange={e=>updateForm('workSchedule', e.target.value)} className="w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] px-4 py-3">
                        <option value="Day Shift">Day Shift</option>
                        <option value="Night Shift">Night Shift</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-transparent pt-4 pb-8 px-8 flex flex-wrap gap-4 items-center justify-between">
          {!previewMode ? (
            <>
              <div className="flex gap-4">
                <button onClick={prevStep} disabled={currentStep === 1} className={`px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md flex items-center gap-2'}`}>
                  <ChevronLeft className="w-5 h-5"/> Back
                </button>
                <button onClick={saveDraft} className="px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md hidden md:block">
                  Save Draft
                </button>
              </div>
              <div className="flex gap-4">
                {currentStep === 3 && (
                  <button onClick={() => { if(validateStep(3)) setPreviewMode(true); }} className="px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    Preview Mode
                  </button>
                )}
                {currentStep < 3 ? (
                  <button onClick={nextStep} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg bg-gradient-to-b from-[#ffe680] via-[#c2861c] to-[#966311] text-white font-bold shadow-[0_0_25px_rgba(251,191,36,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(251,191,36,0.8)] hover:-translate-y-0.5 transition-all border border-[#ffd266]/50 rounded-[14px]`}>
                    Next <ChevronRight className="w-5 h-5"/>
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${submitting ? 'opacity-50' : ''} bg-gradient-to-b from-[#ffe680] via-[#c2861c] to-[#966311] text-white font-bold shadow-[0_0_25px_rgba(251,191,36,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(251,191,36,0.8)] hover:-translate-y-0.5 transition-all border border-[#ffd266]/50 rounded-[14px]`}>
                    {submitting ? 'Posting...' : 'Submit Job'} <CheckCircle2 className="w-5 h-5"/>
                  </button>
                )}
              </div>
            </>
          ) : (
             <div className="flex justify-between w-full">
                <button onClick={prevStep} className="px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md flex items-center gap-2">
                  <ChevronLeft className="w-5 h-5"/> Edit Details
                </button>
                <button onClick={handleSubmit} disabled={submitting} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${submitting ? 'opacity-50' : ''} bg-gradient-to-b from-[#ffe680] via-[#c2861c] to-[#966311] text-white font-bold shadow-[0_0_25px_rgba(251,191,36,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(251,191,36,0.8)] hover:-translate-y-0.5 transition-all border border-[#ffd266]/50 rounded-[14px]`}>
                  {submitting ? 'Posting...' : 'Confirm & Submit'} <CheckCircle2 className="w-5 h-5"/>
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
