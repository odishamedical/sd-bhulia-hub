export const atsConfig = {
  // Core Identifiers
  projectName: "Bhulia Hub Job Portal",
  industryName: "Sambalpuri Handloom Industry",
  
  // Database Namespace (Prevents collisions in a shared Firebase project)
  // E.g., 'bhulia_jobs', 'bhulia_job_seekers'
  dbPrefix: "bhulia", 

  // Branding & Aesthetics
  theme: {
    primaryBg: "bg-[#051815]", // Dark Green
    primaryBorder: "border-[#C5A059]", // Gold
    primaryText: "text-[#C5A059]", // Gold
    secondaryBg: "bg-[#6B1D2F]", // Maroon
    cardBg: "bg-black/40",
    textLight: "text-[#FDF8F5]",
    textMuted: "text-[#FDF8F5]/60",
    buttonPrimary: "bg-[#6B1D2F] text-[#FDF8F5] hover:bg-[#FDF8F5] hover:text-[#6B1D2F]",
    buttonSecondary: "bg-[#C5A059] text-black hover:opacity-90"
  },

  // Dropdown Configurations (Job Posting)
  industries: [
    "Handloom Weaving",
    "Textile Design",
    "Retail / Sales",
    "Tailoring / Stitching",
    "Logistics / Delivery",
    "Management / Admin"
  ],

  // Dropdown Configurations (Job Seekers)
  skills: [
    "Master Weaver",
    "Bandha (Tie & Dye)",
    "Ikat Design",
    "Sales Executive",
    "Tailor",
    "Store Manager",
    "Quality Control",
    "Customer Support"
  ],

  // Nomenclature Overrides (To change terminology between hubs)
  terminology: {
    vendorTitle: "Master Weaver / Shop Owner",
    seekerTitle: "Artisan / Job Seeker",
    cvName: "Bhulia Hub Artisan CV",
    jobCategoryLabel: "Craftsmanship Level"
  }
};
