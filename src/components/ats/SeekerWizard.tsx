"use client";

import React, { useState, useRef } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, User, GraduationCap, Briefcase, Sparkles, Image as ImageIcon, MapPin, X } from "lucide-react";
import { INDIAN_STATES, ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from "@/lib/locations";
import { atsConfig } from "@/config/ats.config";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { jobSeekersCollection } from "@/lib/jobs";
import Image from "next/image";

export default function SeekerWizard({ userUid, userEmail, onSuccess }: { userUid: string, userEmail: string, onSuccess: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // -- Form State --
  // Step 1
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pincode, setPincode] = useState("");

  // Step 2
  const [education, setEducation] = useState([{ degree: "", institution: "", year: "", marks: "" }]);

  // Step 3
  const [workHistory, setWorkHistory] = useState([{ employer: "", role: "", duration: "", responsibilities: "" }]);
  const [isFresher, setIsFresher] = useState(false);

  // Step 4
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [jobType, setJobType] = useState("Full-time");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");

  // Step 5
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [declaration, setDeclaration] = useState(false);

  // Helper functions for Dynamic Arrays
  const addEdu = () => setEducation([...education, { degree: "", institution: "", year: "", marks: "" }]);
  const updateEdu = (idx: number, field: string, val: string) => {
    const newEdu = [...education];
    newEdu[idx] = { ...newEdu[idx], [field]: val };
    setEducation(newEdu);
  };
  const removeEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));

  const addWork = () => setWorkHistory([...workHistory, { employer: "", role: "", duration: "", responsibilities: "" }]);
  const updateWork = (idx: number, field: string, val: string) => {
    const newWork = [...workHistory];
    newWork[idx] = { ...newWork[idx], [field]: val };
    setWorkHistory(newWork);
  };
  const removeWork = (idx: number) => setWorkHistory(workHistory.filter((_, i) => i !== idx));

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step: number) => {
    setErrorMsg("");
    if (step === 1) {
      if (!fullName || !dob || !phone || !whatsapp) {
        setErrorMsg("Please fill all personal details.");
        return false;
      }
      if (country === 'India' && (!state || !localAddress || !pincode)) {
        setErrorMsg("Please complete your address details.");
        return false;
      }
    }
    if (step === 2) {
      if (education.some(e => !e.degree || !e.institution || !e.year)) {
         setErrorMsg("Please fill all required education fields.");
         return false;
      }
    }
    if (step === 3 && !isFresher) {
      if (workHistory.some(w => !w.employer || !w.role || !w.duration)) {
         setErrorMsg("Please fill all required experience fields or select Fresher.");
         return false;
      }
    }
    if (step === 4) {
      if (selectedSkills.length === 0) {
        setErrorMsg("Please select at least one skill.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    if (!profileImageFile) {
      setErrorMsg("Profile photo is mandatory.");
      return;
    }
    if (!declaration) {
      setErrorMsg("You must accept the declaration.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload Image
      const imageRef = ref(storage, `${atsConfig.dbPrefix}_profiles/${userUid}_${Date.now()}`);
      await uploadBytes(imageRef, profileImageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // 2. Save Data
      const seekerData = {
        uid: userUid,
        email: userEmail,
        fullName, dob, gender, phone, whatsapp,
        country, state, district, block, localAddress, pincode,
        education,
        workHistory: isFresher ? [] : workHistory,
        skills: selectedSkills,
        preferredJobType: jobType,
        expectedSalary, preferredLocation,
        profileImage: imageUrl,
        declarationSigned: declaration,
        isLookingForJob: true,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(jobSeekersCollection, userUid), seekerData);
      onSuccess();

    } catch (e) {
      console.error(e);
      setErrorMsg("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-[32px] p-6 md:p-10 text-white bg-[#111111] border-2 border-yellow-500/80 shadow-[0_0_50px_rgba(234,179,8,0.3),0_0_20px_rgba(234,179,8,0.6),inset_0_2px_15px_rgba(255,255,255,0.05)] relative overflow-hidden`}>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#ffd266] to-transparent opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#ffd266] to-transparent opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 pointer-events-none"></div>
      <div className="mb-10 relative z-10">
        <h1 className="text-3xl font-bold text-center mb-2">Create {atsConfig.terminology.cvName}</h1>
        <div className="flex justify-between items-center mt-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-[#DAA520] -z-10 -translate-y-1/2 transition-all duration-300 rounded-full`} style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
          {[1,2,3,4,5].map(step => (
            <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step ? 'bg-gradient-to-r from-yellow-500 to-[#DAA520] text-black shadow-[0_0_15px_rgba(218,165,32,0.6)] border-0' : 'bg-[#222] text-gray-400 border border-gray-600'}`}>
              {step}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm text-center font-bold">
          {errorMsg}
        </div>
      )}

      <div className="min-h-[400px]">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${atsConfig.theme.primaryText}`}><User className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Personal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} style={{colorScheme:'dark'}}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Gender</label>
                <select value={gender} onChange={e=>setGender(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">WhatsApp Number <span className="text-red-500">*</span></label>
                <input type="tel" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Email (Read Only)</label>
                <input type="text" value={userEmail} disabled className="w-full bg-[#050505] opacity-50 border border-[#333] rounded-[14px] px-4 py-3 outline-none cursor-not-allowed text-white" />
              </div>
            </div>

            <h3 className={`text-lg font-bold mt-6 mb-4 flex items-center gap-2 ${atsConfig.theme.primaryText}`}><MapPin className="w-4 h-4 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> 5-Tier Location Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Country <span className="text-red-500">*</span></label>
                  <select value={country} onChange={e => {setCountry(e.target.value); setState(""); setDistrict(""); setBlock("");}} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`}>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
               </div>
               {country === 'India' ? (
                 <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">State <span className="text-red-500">*</span></label>
                    <select value={state} onChange={e => {setState(e.target.value); setDistrict(""); setBlock("");}} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {state === 'Odisha' ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">District <span className="text-red-500">*</span></label>
                        <select value={district} onChange={e => {setDistrict(e.target.value); setBlock("");}} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`}>
                          <option value="">Select District</option>
                          {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      {district && ODISHA_DISTRICT_BLOCKS[district as keyof typeof ODISHA_DISTRICT_BLOCKS] && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Block / City <span className="text-red-500">*</span></label>
                          <select value={block} onChange={e => setBlock(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`}>
                            <option value="">Select Block/City</option>
                            {ODISHA_DISTRICT_BLOCKS[district as keyof typeof ODISHA_DISTRICT_BLOCKS].map((b: string) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">City / District <span className="text-red-500">*</span></label>
                        <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
                    </div>
                  )}
                 </>
               ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">City / Region <span className="text-red-500">*</span></label>
                    <input type="text" value={state} onChange={e => setState(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
                  </div>
               )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Local Address (Village/Street) <span className="text-red-500">*</span></label>
                <input type="text" value={localAddress} onChange={e=>setLocalAddress(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">PIN / ZIP Code <span className="text-red-500">*</span></label>
                <input type="text" value={pincode} onChange={e=>setPincode(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
              </div>
            </div>

          </div>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <h2 className={`text-xl font-bold flex items-center gap-2 ${atsConfig.theme.primaryText}`}><GraduationCap className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Educational Background</h2>
             
             {education.map((edu, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-white/10 ${atsConfig.theme.cardBg} relative`}>
                  {idx > 0 && <button onClick={() => removeEdu(idx)} className="absolute top-2 right-2 text-white/40 hover:text-red-500"><X className="w-5 h-5"/></button>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Highest Qualification <span className="text-red-500">*</span></label>
                      <select value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none">
                        <option value="">Select Qualification</option>
                        <option value="10th Pass">10th Pass</option>
                        <option value="12th Pass">12th Pass</option>
                        <option value="Diploma / ITI">Diploma / ITI</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post-Graduate">Post-Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Institution Name <span className="text-red-500">*</span></label>
                      <input type="text" value={edu.institution} onChange={e => updateEdu(idx, 'institution', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Year of Passing <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g. 2021" value={edu.year} onChange={e => updateEdu(idx, 'year', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Marks / Grade</label>
                      <input type="text" placeholder="e.g. 85% or A+" value={edu.marks} onChange={e => updateEdu(idx, 'marks', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                    </div>
                  </div>
                </div>
             ))}
             <button onClick={addEdu} className={`text-sm font-bold ${atsConfig.theme.primaryText} hover:underline`}>+ Add Another Qualification</button>
          </div>
        )}

        {/* Step 3: Experience */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${atsConfig.theme.primaryText}`}><Briefcase className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Work Experience</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isFresher} onChange={e => setIsFresher(e.target.checked)} className="w-4 h-4 accent-[#C5A059]" />
                  I am a Fresher
                </label>
             </div>

             {!isFresher && workHistory.map((work, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-white/10 ${atsConfig.theme.cardBg} relative`}>
                  {idx > 0 && <button onClick={() => removeWork(idx)} className="absolute top-2 right-2 text-white/40 hover:text-red-500"><X className="w-5 h-5"/></button>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Company Name <span className="text-red-500">*</span></label>
                      <input type="text" value={work.employer} onChange={e => updateWork(idx, 'employer', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Role / Designation <span className="text-red-500">*</span></label>
                      <input type="text" value={work.role} onChange={e => updateWork(idx, 'role', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Duration (From - To) <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g. Jan 2020 - Present" value={work.duration} onChange={e => updateWork(idx, 'duration', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-mono uppercase opacity-70 mb-2">Responsibilities</label>
                      <textarea value={work.responsibilities} onChange={e => updateWork(idx, 'responsibilities', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none min-h-[80px]"></textarea>
                    </div>
                  </div>
                </div>
             ))}
             {!isFresher && <button onClick={addWork} className={`text-sm font-bold ${atsConfig.theme.primaryText} hover:underline`}>+ Add More Experience</button>}
          </div>
        )}

        {/* Step 4: Skills & Preferences */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <h2 className={`text-xl font-bold flex items-center gap-2 ${atsConfig.theme.primaryText}`}><Sparkles className="w-5 h-5 text-[#DAA520] drop-shadow-[0_0_5px_rgba(218,165,32,0.8)]"/> Skills & Preferences</h2>
             
             <div>
               <label className="block text-xs font-mono uppercase opacity-70 mb-3">Key Skills (Select all that apply) <span className="text-red-500">*</span></label>
               <div className="flex flex-wrap gap-2">
                 {atsConfig.skills.map(skill => (
                   <button
                     key={skill}
                     onClick={() => toggleSkill(skill)}
                     className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${selectedSkills.includes(skill) ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]' : 'bg-black/20 border-white/10 text-white/60 hover:border-white/30'}`}
                   >
                     {skill}
                   </button>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               <div>
                 <label className="block text-xs font-mono uppercase opacity-70 mb-2">Preferred Job Type</label>
                 <select value={jobType} onChange={e=>setJobType(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-mono uppercase opacity-70 mb-2">Expected Salary Range</label>
                 <input type="text" placeholder="e.g. ₹15,000 - ₹25,000" value={expectedSalary} onChange={e=>setExpectedSalary(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-xs font-mono uppercase opacity-70 mb-2">Preferred Location</label>
                 <input type="text" placeholder="e.g. Remote, Bhubaneswar, Anywhere in Odisha" value={preferredLocation} onChange={e=>setPreferredLocation(e.target.value)} className={`w-full bg-[#0f0f0f] border border-[#4a3617] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] focus:bg-[#141414] text-white focus:ring-1 focus:ring-[#DAA520] focus:border-[#DAA520] transition-all duration-300 rounded-[14px] outline-none`} />
               </div>
             </div>
          </div>
        )}

        {/* Step 5: Finalization */}
        {currentStep === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 text-center">
             <h2 className={`text-2xl font-bold flex items-center justify-center gap-2 ${atsConfig.theme.primaryText}`}><ImageIcon className="w-6 h-6"/> Finalize Profile</h2>
             
             <div className="max-w-md mx-auto">
               <label className={`block w-full aspect-square md:aspect-[3/2] border-2 border-dashed border-white/20 rounded-3xl ${atsConfig.theme.cardBg} hover:bg-black/60 transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden relative`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {profileImagePreview ? (
                    <Image src={profileImagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <>
                      <Upload className={`w-12 h-12 ${atsConfig.theme.primaryText} mb-4`} />
                      <p className="font-bold">Upload Profile Photo <span className="text-red-500">*</span></p>
                      <p className="text-xs text-white/40 mt-2">JPG, PNG up to 5MB</p>
                    </>
                  )}
               </label>
             </div>

             <div className="max-w-md mx-auto bg-black/20 p-4 rounded-xl border border-white/5 text-left">
               <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={declaration} onChange={e => setDeclaration(e.target.checked)} className="w-5 h-5 mt-1 accent-[#C5A059]" />
                  <span className="text-sm text-white/70">
                    I declare that all the information provided above is true and correct to the best of my knowledge. I understand that false information may lead to disqualification. <span className="text-red-500">*</span>
                  </span>
               </label>
             </div>

          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/10">
        <button 
          onClick={prevStep} 
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          <ChevronLeft className="w-5 h-5"/> Back
        </button>

        {currentStep < 5 ? (
          <button 
            onClick={nextStep} 
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${atsConfig.theme.buttonSecondary}`}
          >
            Next <ChevronRight className="w-5 h-5"/>
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${submitting ? 'opacity-50' : ''} ${atsConfig.theme.buttonSecondary}`}
          >
            {submitting ? 'Uploading...' : 'Submit Profile'} <CheckCircle2 className="w-5 h-5"/>
          </button>
        )}
      </div>
    </div>
  );
}
