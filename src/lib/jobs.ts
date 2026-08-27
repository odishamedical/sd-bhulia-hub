import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { atsConfig } from "@/config/ats.config";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobStatus = "Pending" | "Active" | "Closed" | "Draft";

export interface Job {
  id?: string;
  // Page 1: Company Details
  shopId: string; // The vendor's uid or 'platform'
  shopName?: string; // Company Name
  companyLogo?: string;
  industry?: string;
  companyWebsite?: string;
  companyAddress?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;

  // Page 2: Job Information
  title: string;
  jobType: JobType;
  location: string;
  salaryRange: string;
  experience: string;
  qualification: string;
  skillsRequired: string[];
  vacancies: number;
  deadline: string; // Stored as ISO string or YYYY-MM-DD

  // Page 3: Job Description & Extras
  description: string; // Detailed Job Description
  keyResponsibilities: string;
  benefits: string[];
  workSchedule: string;
  additionalNotes?: string;

  status: JobStatus;
  isDraft: boolean;
  createdAt: Timestamp | Date;
}

export interface JobSeeker {
  uid: string;
  
  // Step 1: Personal Info
  fullName: string;
  experienceYears?: string;
  dob: string;
  gender: string;
  phone: string;
  whatsapp: string;
  email: string;
  
  // 5-Tier Address
  country: string;
  state: string;
  district: string;
  block: string;
  localAddress: string;
  pincode: string;
  
  // Step 2: Education
  education: { degree: string; institution: string; year: string; marks: string }[];
  
  // Step 3: Experience
  workHistory: { employer: string; role: string; duration: string; responsibilities: string }[];
  
  // Step 4: Skills & Preferences
  skills: string[];
  preferredJobType: string;
  expectedSalary: string;
  preferredLocation: string;
  
  // Step 5: Finalization
  profileImage: string; // Mandatory now
  declarationSigned: boolean;
  
  isLookingForJob: boolean;
  createdAt?: Timestamp | Date;
}

export interface JobApplication {
  id?: string;
  jobId: string;
  shopId: string; // Vendor who owns the job
  seekerId: string; // Reference to JobSeeker
  status: "Pending" | "Shortlisted" | "Hired" | "Rejected";
  createdAt: Timestamp | Date;
}

export interface SharedCandidate {
  id?: string;
  shopId: string;
  seekerId: string;
  sharedByAdmin: string;
  status: "Reviewing" | "Contacted" | "Hired" | "Rejected";
  createdAt: Timestamp | Date;
}

// Namespaced collections based on the ATS Config
export const jobsCollection = collection(db, `${atsConfig.dbPrefix}_jobs`);
export const jobSeekersCollection = collection(db, `${atsConfig.dbPrefix}_job_seekers`);
export const jobApplicationsCollection = collection(db, `${atsConfig.dbPrefix}_job_applications`);
export const sharedCandidatesCollection = collection(db, `${atsConfig.dbPrefix}_shared_candidates`);

