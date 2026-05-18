"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Structure for Artisan Listing
interface ArtisanListing {
  id: string;
  name: string;
  cluster: string;
  village: string;
  category: "bargarh" | "sonepur" | "sambalpur" | "boudh-balangir" | "bandha" | "graph";
  entityType: "PWCS" | "Independent" | "Unverified";
  loomCount: number;
  giTagNumber: string;
  specialtyTags: string[];
  seoDescription: string;
  img: string;
  isClaimed: boolean;
  claimStatus?: "verified" | "pending" | "unverified";
}

// Initial 16 Elite SEO-Optimized Master Listings
const INITIAL_ARTISANS: ArtisanListing[] = [
  // Bargarh Cluster (Cotton Ikat & Pasapalli)
  {
    id: "ART-001",
    name: "Maa Samaleswari Weavers Cooperative Society (PWCS)",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    category: "bargarh",
    entityType: "PWCS",
    loomCount: 142,
    giTagNumber: "GI-Cert: #OD-7492-SB",
    specialtyTags: ["Pasapalli Ikat", "Mercerized Cotton", "Traditional Phoda Kumbha"],
    seoDescription: "Authentic GI-Tagged Sambalpuri saree collective operating 142 active pit looms in Barpali. Specializing in high-density handspun cotton Pasapalli Ikat and traditional temple borders.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-002",
    name: "Bhagabata Meher Master Ikat Workshop",
    cluster: "Bargarh Cluster",
    village: "Bijepur, Bargarh",
    category: "bargarh",
    entityType: "Independent",
    loomCount: 28,
    giTagNumber: "GI-Cert: #OD-8832-BJ",
    specialtyTags: ["Bijepur Cotton Ikat", "Natural Vegetable Dyes", "Custom Bandha"],
    seoDescription: "Elite independent master weaver workshop producing world-class Bijepur cotton Ikat sarees. Renowned for flawless mathematical symmetry and organic vegetable dye formulations.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-003",
    name: "Padmashree Kunja Bihari Memorial Ikat Loom",
    cluster: "Bargarh Cluster",
    village: "Bargarh Town",
    category: "bargarh",
    entityType: "Independent",
    loomCount: 15,
    giTagNumber: "GI-Cert: #OD-1109-BG",
    specialtyTags: ["Heirloom Silk Ikat", "Exhibition Masterpieces", "Padmashree Lineage"],
    seoDescription: "Preserving the legendary design lineage of Padmashree awardees. Producing ultra-premium, museum-grade Sambalpuri silk and cotton Ikat sarees for global connoisseurs.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-004",
    name: "Barpali Bandha Kala Niketan",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    category: "bandha",
    entityType: "Independent",
    loomCount: 35,
    giTagNumber: "GI-Cert: #OD-3341-BP",
    specialtyTags: ["Bandha Tie & Dye", "Intricate Calligraphy Ikat", "Barpali Motifs"],
    seoDescription: "Master tie-and-dye (Bandha) artisan syndicate specializing in micro-ikat motifs, traditional script weaving, and complex double-ikat ceremonial dupattas.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-005",
    name: "Attabira Handloom Pit Loom Collective",
    cluster: "Bargarh Cluster",
    village: "Attabira, Bargarh",
    category: "bargarh",
    entityType: "Unverified",
    loomCount: 18,
    giTagNumber: "GI-Pending Registry",
    specialtyTags: ["Daily Wear Cotton", "Attabira Checks", "Grassroots Pit Loom"],
    seoDescription: "Grassroots weaving collective producing authentic, highly breathable daily wear cotton Sambalpuri sarees. Seeking direct D2C market linkage and GI verification.",
    img: "/bhulia-hero.png",
    isClaimed: false,
    claimStatus: "unverified",
  },

  // Sonepur Cluster (Pure Mulberry Silk & Bomkai)
  {
    id: "ART-006",
    name: "Sonepur Royal Silk PWCS",
    cluster: "Sonepur Cluster",
    village: "Sonepur Town",
    category: "sonepur",
    entityType: "PWCS",
    loomCount: 85,
    giTagNumber: "GI-Cert: #OD-9921-SP",
    specialtyTags: ["Pure Mulberry Silk", "Sonepur Bomkai", "Silk Mark Gold"],
    seoDescription: "Premier Primary Weaving Cooperative Society producing luxurious 3-ply Mulberry silk Bomkai sarees. Featuring rich extra-weft gold thread work and certified Silk Mark tags.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-007",
    name: "Subarnapur Bomkai Heritage Artisans",
    cluster: "Sonepur Cluster",
    village: "Sonepur Outskirts",
    category: "sonepur",
    entityType: "Independent",
    loomCount: 22,
    giTagNumber: "GI-Cert: #OD-6543-SN",
    specialtyTags: ["Bridal Bomkai", "Zari Border Silk", "Traditional Jala Craft"],
    seoDescription: "Dedicated master artisan workshop preserving the complex Jala weaving technique. Crafting heavy bridal Bomkai silk sarees with intricate fish, flower, and peacock motifs.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-008",
    name: "Maniabandha Khandua Master Guild",
    cluster: "Sonepur Cluster",
    village: "Maniabandha / Sonepur",
    category: "sonepur",
    entityType: "Independent",
    loomCount: 40,
    giTagNumber: "GI-Cert: #OD-8812-MB",
    specialtyTags: ["Khandua Silk", "Jagannath Temple Ikat", "Lightweight Pure Silk"],
    seoDescription: "Historic guild weaving sacred Khandua silk sarees traditionally offered at the Jagannath Temple. Known for lightweight drape, vibrant natural luster, and auspicious verse motifs.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-009",
    name: "Chikiti Silk & Tussar Weavers Group",
    cluster: "Sonepur Cluster",
    village: "Sonepur Rural",
    category: "sonepur",
    entityType: "Unverified",
    loomCount: 12,
    giTagNumber: "GI-Pending Registry",
    specialtyTags: ["Wild Tussar Silk", "Tribal Weave", "Handspun Tussar"],
    seoDescription: "Rural artisan group foraging and spinning wild Tussar silk. Crafting organic, highly textured silk sarees with indigenous tribal border aesthetics.",
    img: "/bhulia-hero.png",
    isClaimed: false,
    claimStatus: "unverified",
  },

  // Sambalpur Cluster (Traditional Daily Luxury)
  {
    id: "ART-010",
    name: "Sambalpur District Handloom Weavers Union",
    cluster: "Sambalpur Cluster",
    village: "Sambalpur City",
    category: "sambalpur",
    entityType: "PWCS",
    loomCount: 110,
    giTagNumber: "GI-Cert: #OD-2234-SM",
    specialtyTags: ["Sambalpuri Cotton", "Dhoti & Chadar", "Sovereign Escrow"],
    seoDescription: "Central district union supporting over 110 master weavers. Supplying high-grade Sambalpuri cotton sarees, traditional dhotis, and angavastrams directly to sovereign retail hubs.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-011",
    name: "Hirakud Artisan Tie & Dye Syndicate",
    cluster: "Sambalpur Cluster",
    village: "Hirakud, Sambalpur",
    category: "bandha",
    entityType: "Independent",
    loomCount: 18,
    giTagNumber: "GI-Cert: #OD-4456-HK",
    specialtyTags: ["Complex Bandha", "Modern Ikat Fusion", "Export Quality"],
    seoDescription: "Innovative Bandha workshop fusing traditional 800-year-old Ikat tying techniques with contemporary geometric patterns. Supplying premium export dress materials and sarees.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-012",
    name: "Rengali Grassroots Pit Loom Association",
    cluster: "Sambalpur Cluster",
    village: "Rengali, Sambalpur",
    category: "sambalpur",
    entityType: "Unverified",
    loomCount: 25,
    giTagNumber: "GI-Pending Registry",
    specialtyTags: ["Coarse Cotton Saree", "Budget Handloom", "Direct Artisan"],
    seoDescription: "Authentic village association weaving durable, everyday coarse cotton Sambalpuri sarees. Actively seeking Jan Dhan escrow integration to eliminate local middlemen.",
    img: "/bhulia-hero.png",
    isClaimed: false,
    claimStatus: "unverified",
  },

  // Boudh & Balangir Clusters (Organic Dyes & Tribal Motifs)
  {
    id: "ART-013",
    name: "Boudh Natural Vegetable Dye Ikat Collective",
    cluster: "Boudh & Balangir",
    village: "Boudh Town",
    category: "boudh-balangir",
    entityType: "PWCS",
    loomCount: 65,
    giTagNumber: "GI-Cert: #OD-7789-BD",
    specialtyTags: ["100% Organic Dye", "Madder & Indigo", "Boudh Silk Ikat"],
    seoDescription: "Pioneering natural dye cooperative utilizing madder roots, pomegranate peel, and native indigo. Crafting chemical-free, skin-friendly Mulberry silk and cotton Ikat sarees.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-014",
    name: "Baghambar Traditional Cotton Loom Works",
    cluster: "Boudh & Balangir",
    village: "Boudh Rural",
    category: "graph",
    entityType: "Independent",
    loomCount: 14,
    giTagNumber: "GI-Cert: #OD-5567-BR",
    specialtyTags: ["Master Graph Design", "Sachipar Border", "Heritage Preservation"],
    seoDescription: "Led by master graph designers who plot intricate Ikat matrices onto graph paper. Specializing in the legendary Sachipar check pattern with intricate phoda kumbha temples.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-015",
    name: "Balangir Tribal Weave & Extra-Weft Workshop",
    cluster: "Boudh & Balangir",
    village: "Balangir Town",
    category: "boudh-balangir",
    entityType: "Independent",
    loomCount: 32,
    giTagNumber: "GI-Cert: #OD-8890-BL",
    specialtyTags: ["Tribal Extra-Weft", "Heavy Cotton", "Balangir Special"],
    seoDescription: "Renowned for heavy-weave cotton sarees featuring prominent tribal extra-weft motifs across the pallu. Designed for lifelong durability and striking cultural elegance.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
  },
  {
    id: "ART-016",
    name: "Nuapatna Ikat Loom Collective",
    cluster: "Boudh & Balangir",
    village: "Nuapatna / Balangir",
    category: "boudh-balangir",
    entityType: "Unverified",
    loomCount: 20,
    giTagNumber: "GI-Pending Registry",
    specialtyTags: ["Khandua Cotton", "Nuapatna Tie-Dye", "Weaver Welfare"],
    seoDescription: "Collaborative of 20 independent pit loom artisans producing traditional Nuapatna Ikat sarees. Seeking official GI-Tag verification and direct digital catalog onboarding.",
    img: "/bhulia-hero.png",
    isClaimed: false,
    claimStatus: "unverified",
  }
];

export default function DirectoryPage() {
  const [artisans, setArtisans] = useState<ArtisanListing[]>(INITIAL_ARTISANS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Auth State
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");

  // Modal State for "Claim This Listing"
  const [selectedArtisanForClaim, setSelectedArtisanForClaim] = useState<ArtisanListing | null>(null);
  const [claimStep, setClaimStep] = useState<number>(1);
  const [claimForm, setClaimForm] = useState({
    applicantName: "",
    mobileNumber: "",
    otp: "",
    giCertificate: "",
    bankAccount: "",
    ifscCode: "",
  });
  const [isSubmittingClaim, setIsSubmittingClaim] = useState<boolean>(false);

  useEffect(() => {
    // Check Auth
    const checkAuth = () => {
      const email = localStorage.getItem("sd_current_user_email");
      const name = localStorage.getItem("sd_current_user_name");
      const avatar = localStorage.getItem("sd_current_user_avatar");
      const role = localStorage.getItem("sd_current_user_role");
      const uid = localStorage.getItem("sd_current_user_uid") || "sd_super_admin_custom_uid";

      if (email) {
        setUserName(name || email.split("@")[0]);
        setUserAvatar(avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
        setUserRole(role || "user");
        setUserUid(uid);
      } else {
        setUserName(null);
        setUserAvatar(null);
        setUserRole(null);
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);

    // Load any existing claims from localStorage
    const savedClaims = localStorage.getItem("sd_bhulia_claimed_artisans");
    if (savedClaims) {
      try {
        const claimedIds: string[] = JSON.parse(savedClaims);
        setArtisans((prev) =>
          prev.map((art) =>
            claimedIds.includes(art.id)
              ? { ...art, isClaimed: true, claimStatus: "pending", giTagNumber: "GI-Verification Pending" }
              : art
          )
        );
      } catch (e) {
        console.error("Failed to parse saved claims", e);
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  // Filter & Search Logic
  const filteredArtisans = artisans.filter((art) => {
    const matchesCategory = selectedCategory === "all" || art.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.specialtyTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.seoDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Dynamic Social Share Handler with Affiliate Tracking ID
  const handleSocialShare = (platform: "whatsapp" | "facebook", artisanId?: string, artisanName?: string) => {
    const baseUrl = `${window.location.origin}/directory`;
    const shareUrl = artisanId ? `${baseUrl}?artisan=${artisanId}&ref=${userUid}` : `${baseUrl}?ref=${userUid}`;
    const message = artisanId 
      ? `Explore verified GI-Tagged Sambalpuri handlooms directly from ${artisanName} on Bhulia Hub! ${shareUrl}`
      : `Explore the sovereign directory of authentic GI-Tagged Sambalpuri saree weavers on Bhulia Hub! ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  // Handle Claim Submission Workflow
  const handleClaimNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimStep < 3) {
      setClaimStep(claimStep + 1);
    } else {
      // Final Submit
      setIsSubmittingClaim(true);
      setTimeout(() => {
        if (selectedArtisanForClaim) {
          const updatedArtisans = artisans.map((art) =>
            art.id === selectedArtisanForClaim.id
              ? { ...art, isClaimed: true, claimStatus: "pending" as const, giTagNumber: claimForm.giCertificate || "GI-Verification Pending" }
              : art
          );
          setArtisans(updatedArtisans);

          // Save to localStorage
          const existingClaims = JSON.parse(localStorage.getItem("sd_bhulia_claimed_artisans") || "[]");
          localStorage.setItem("sd_bhulia_claimed_artisans", JSON.stringify([...existingClaims, selectedArtisanForClaim.id]));

          setIsSubmittingClaim(false);
          setClaimStep(4); // Success Step
        }
      }, 1500);
    }
  };

  const resetClaimModal = () => {
    setSelectedArtisanForClaim(null);
    setClaimStep(1);
    setClaimForm({
      applicantName: "",
      mobileNumber: "",
      otp: "",
      giCertificate: "",
      bankAccount: "",
      ifscCode: "",
    });
  };

  return (
    <main className="relative flex-1 w-full bg-gradient-to-b from-[#0B2B26] via-[#0D3630] to-[#0A2520] text-white font-sans flex flex-col min-h-screen">
      
      {/* Background Gold Glows & Ikat Texture */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#C5A059]/15 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#D4AF37]/15 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26]/95 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-4 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="relative w-10 sm:w-14 h-10 sm:h-14 rounded-full overflow-hidden border-2 border-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0 block">
            <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
          </Link>
          <div>
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">Bhulia.com</h1>
            </Link>
            <p className="text-[9px] sm:text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate max-w-[160px] sm:max-w-none">Sambalpuri saree, Direct from Weavers</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
          <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
          <Link href="/#cotton-sambalpuri" className="hover:text-[#C5A059] transition-colors pb-1">Products</Link>
          <Link href="/directory" className="text-[#C5A059] border-b-2 border-[#C5A059] pb-1">Weaver Directory</Link>
          <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">About Us</Link>
          <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Contact Us</Link>
        </nav>

        {/* Right Side User Menu & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4">
          {userAvatar ? (
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner">
              <img src={userAvatar} alt="User Avatar" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-[#C5A059]" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none">{userName}</span>
                <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
              </div>
            </div>
          ) : (
            <a href="https://sd-auth-center.vercel.app" className="flex items-center gap-1.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:brightness-110 transition-all cursor-pointer shrink-0">
              <svg className="w-3.5 h-3.5 hidden sm:inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              <span>Sign In / Register</span>
            </a>
          )}

          {/* Cart Button */}
          <button className="hidden sm:flex items-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span>Cart (2)</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-9 sm:w-10 h-9 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[73px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/#cotton-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Products</Link>
            <Link href="/directory" onClick={() => setMobileNavOpen(false)} className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Weaver Directory</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">About Us</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] pb-1 block">Contact Us</Link>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 container mx-auto px-6 py-8 relative z-10 space-y-10">
        
        {/* 1. Directory Hero Section & Live Stats */}
        <div className="bg-gradient-to-br from-[#0A3A35] via-[#0D3630] to-[#0B2B26] border-2 border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.25)] flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span>Odisha Handloom Sovereign Registry</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              The Sovereign Directory of <br />
              <span className="text-[#C5A059]">Odisha Master Weavers.</span>
            </h2>

            <p className="text-sm md:text-base text-gray-200 leading-relaxed font-sans max-w-2xl">
              Direct access to verified Primary Weaving Cooperative Societies (PWCS), independent master workshops, and grassroots pit loom artisans across Bargarh, Sonepur, Sambalpur, Boudh, and Balangir.
            </p>
          </div>

          {/* Live Trust Metrics Bar */}
          <div className="relative z-10 pt-8 mt-8 border-t border-[#C5A059]/30 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="bg-[#0B2B26]/80 p-4 rounded-2xl border border-[#C5A059]/20 shadow-inner">
              <span className="block text-2xl md:text-3xl font-serif font-bold text-[#C5A059]">42 Clusters</span>
              <span className="text-[11px] text-gray-300 uppercase tracking-widest mt-1 block">Active Weaving Hubs</span>
            </div>
            <div className="bg-[#0B2B26]/80 p-4 rounded-2xl border border-[#C5A059]/20 shadow-inner">
              <span className="block text-2xl md:text-3xl font-serif font-bold text-[#C5A059]">1,840+ Looms</span>
              <span className="text-[11px] text-gray-300 uppercase tracking-widest mt-1 block">Registered Pit Looms</span>
            </div>
            <div className="bg-[#0B2B26]/80 p-4 rounded-2xl border border-[#C5A059]/20 shadow-inner">
              <span className="block text-2xl md:text-3xl font-serif font-bold text-[#C5A059]">100% Escrow</span>
              <span className="text-[11px] text-gray-300 uppercase tracking-widest mt-1 block">GI-Tag Jan Dhan Payouts</span>
            </div>
          </div>

          {/* Global Directory Social Share Bar */}
          <div className="relative z-10 pt-6 mt-6 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B2B26]/60 p-4 rounded-2xl backdrop-blur-md border border-[#C5A059]/30">
            <div>
              <span className="text-xs font-bold text-white block">Promote & Earn Affiliate Commission</span>
              <span className="text-[11px] text-gray-300">Share your unique tracking link: <code className="text-[#C5A059] font-mono bg-[#051815] px-2 py-0.5 rounded">?ref={userUid}</code></span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button onClick={() => handleSocialShare("whatsapp")} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow">
                <span>📲 Share WhatsApp</span>
              </button>
              <button onClick={() => handleSocialShare("facebook")} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#1877F2] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow">
                <span>📘 Share Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Global Search & Cluster Filter Bar */}
        <div className="space-y-6">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C5A059]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artisan name (e.g. Meher), village (e.g. Barpali), or weave motif (e.g. Pasapalli)..."
              className="w-full pl-12 pr-4 py-4 bg-[#0A3A35]/90 border-2 border-[#C5A059]/50 focus:border-[#C5A059] rounded-2xl text-white placeholder-gray-300 text-sm focus:outline-none shadow-xl transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white cursor-pointer">
                ✕ Clear
              </button>
            )}
          </div>

          {/* Cluster & Craft Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#C5A059]/40 scrollbar-track-transparent">
            {[
              { id: "all", label: "🌟 All Artisans" },
              { id: "bargarh", label: "📍 Bargarh Cluster" },
              { id: "sonepur", label: "📍 Sonepur Cluster" },
              { id: "sambalpur", label: "📍 Sambalpur" },
              { id: "boudh-balangir", label: "📍 Boudh & Balangir" },
              { id: "bandha", label: "🎨 Bandha Artists" },
              { id: "graph", label: "📐 Graph Designers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 shadow ${
                  selectedCategory === tab.id
                    ? "bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] shadow-[0_0_20px_rgba(197,160,89,0.4)]"
                    : "bg-[#0A3A35] border border-[#C5A059]/30 text-gray-200 hover:border-[#C5A059] hover:bg-[#0D4B45]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center border-b border-[#C5A059]/20 pb-4">
          <p className="text-xs text-gray-300 uppercase tracking-widest font-mono">
            Showing <span className="text-[#C5A059] font-bold">{filteredArtisans.length}</span> verified master listings
          </p>
          <span className="text-[11px] text-gray-400 font-sans">Updated Real-Time via BIS & GI Registry</span>
        </div>

        {/* 3. The Artisan Listing Grid (16 Elite Master Listings) */}
        {filteredArtisans.length === 0 ? (
          <div className="bg-[#0A3A35]/50 border border-[#C5A059]/30 rounded-3xl p-12 text-center space-y-4">
            <p className="text-lg font-serif text-[#C5A059]">No master artisans found matching your criteria.</p>
            <p className="text-xs text-gray-300">Try adjusting your search query or selecting a different regional cluster tab.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="mt-4 px-6 py-2.5 bg-[#0B2B26] border border-[#C5A059] text-[#C5A059] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] hover:text-[#0A1021] transition-all cursor-pointer">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtisans.map((art) => (
              <div key={art.id} className="bg-[#0A3A35]/80 border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl">
                
                {/* Card Header (Visuals & Trust Badge) */}
                <div className="relative w-full h-48 overflow-hidden bg-[#0B2B26]">
                  <Image src={art.img} alt={art.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B26] via-[#0B2B26]/40 to-transparent"></div>
                  
                  {/* Top Right Entity Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    {art.entityType === "PWCS" && (
                      <span className="bg-[#C5A059] text-[#0A1021] px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.6)] flex items-center gap-1">
                        🛡️ Verified PWCS
                      </span>
                    )}
                    {art.entityType === "Independent" && (
                      <span className="bg-slate-200 text-slate-900 px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-widest shadow flex items-center gap-1">
                        🌱 Independent
                      </span>
                    )}
                    {art.entityType === "Unverified" && (
                      <span className="bg-amber-500/90 text-white px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-widest shadow flex items-center gap-1">
                        ⚠️ Unverified
                      </span>
                    )}
                  </div>

                  {/* Bottom Header Info */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-between items-end">
                    <span className="text-[10px] font-mono text-[#C5A059] bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/40 font-bold">
                      {art.id}
                    </span>
                    <span className="text-[10px] text-gray-200 font-bold bg-[#0B2B26]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#C5A059]/20">
                      🧵 {art.loomCount} Looms
                    </span>
                  </div>
                </div>

                {/* Card Body (Identity & SEO Description) */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-white text-base group-hover:text-[#C5A059] transition-colors leading-tight">
                      {art.name}
                    </h3>
                    <p className="text-xs text-[#C5A059] font-mono font-medium">
                      📍 {art.village}
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans line-clamp-3">
                      {art.seoDescription}
                    </p>
                  </div>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#C5A059]/20">
                    {art.specialtyTags.map((tag, idx) => (
                      <span key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 text-gray-300 text-[10px] px-2 py-0.5 rounded-md font-sans">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* GI Registry Status */}
                  <div className="bg-[#0B2B26] p-2 rounded-lg border border-[#C5A059]/20 text-[10px] font-mono flex items-center justify-between">
                    <span className="text-gray-400">GI Registry:</span>
                    <span className={`font-bold ${art.giTagNumber.includes("Pending") ? "text-amber-400" : "text-[#C5A059]"}`}>
                      {art.giTagNumber}
                    </span>
                  </div>

                  {/* Card Footer Action Engine & Social Share */}
                  <div className="pt-2 space-y-2">
                    {/* Social Share Affiliate Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#C5A059]/20">
                      <button onClick={() => handleSocialShare("whatsapp", art.id, art.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                        <span>📲 WhatsApp</span>
                      </button>
                      <button onClick={() => handleSocialShare("facebook", art.id, art.name)} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                        <span>📘 Facebook</span>
                      </button>
                    </div>

                    {art.isClaimed ? (
                      art.claimStatus === "pending" ? (
                        <button disabled className="w-full py-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-not-allowed flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                          <span>⏳ Claim Pending Verification</span>
                        </button>
                      ) : (
                        <Link href={`/artisan/${art.id.toLowerCase()}`} className="w-full py-2.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] flex items-center justify-center gap-1 cursor-pointer block text-center">
                          <span>🛍️ View Artisan Store & Sarees</span>
                        </Link>
                      )
                    ) : (
                      <button onClick={() => setSelectedArtisanForClaim(art)} className="w-full py-2.5 bg-[#0B2B26] border-2 border-amber-500/80 hover:bg-amber-500 hover:text-[#0A1021] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-1 cursor-pointer">
                        <span>🛡️ Claim This Listing / Verify GI-Tag</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

        {/* 4. Interspersed Promotion Banner */}
        <div className="bg-gradient-to-r from-[#0A3A35] via-[#0D3630] to-[#0A3A35] border-2 border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.3)] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/15 via-transparent to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span>Are You an Odisha Master Weaver?</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
              List Your Traditional Pit Looms & <br />
              <span className="text-[#C5A059]">Receive Direct D2C Escrow Payouts.</span>
            </h3>

            <p className="text-sm text-gray-200 font-sans leading-relaxed">
              Join the sovereign Bhulia.com collective today. We provide free cataloging, AI-assisted description generation, and secure Jan Dhan account linkage to protect your weaving legacy.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <button onClick={() => setSelectedArtisanForClaim(INITIAL_ARTISANS[4])} className="px-8 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(197,160,89,0.4)] cursor-pointer">
              🛡️ Claim / Register Loom Now
            </button>
          </div>
        </div>

      </div>

      {/* 5. The "Claim This Listing" Glassmorphism Modal Overlay */}
      {selectedArtisanForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051815]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0A3A35] via-[#0D3630] to-[#0B2B26] border-2 border-[#C5A059] rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.4)] relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#C5A059]/30 flex justify-between items-center bg-[#0B2B26]/50">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] font-bold uppercase tracking-widest block mb-1">
                  🛡️ Sovereign Artisan Onboarding Engine
                </span>
                <h3 className="text-xl font-serif font-bold text-white leading-tight">
                  Claim Listing: {selectedArtisanForClaim.name}
                </h3>
              </div>
              <button onClick={resetClaimModal} className="w-8 h-8 rounded-full bg-[#0B2B26] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] transition-all flex items-center justify-center font-bold cursor-pointer">
                ✕
              </button>
            </div>

            {/* Modal Body / Steps */}
            <form onSubmit={handleClaimNextStep} className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-[#C5A059]/40 scrollbar-track-transparent">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
                {[
                  { step: 1, label: "Identity" },
                  { step: 2, label: "Verification" },
                  { step: 3, label: "Escrow Payout" },
                  { step: 4, label: "Confirmation" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      claimStep >= item.step
                        ? "bg-[#C5A059] text-[#0A1021] shadow-[0_0_10px_rgba(197,160,89,0.6)]"
                        : "bg-[#0B2B26] border border-[#C5A059]/40 text-gray-400"
                    }`}>
                      {item.step}
                    </div>
                    <span className={`text-xs hidden sm:inline-block font-bold ${claimStep >= item.step ? "text-white" : "text-gray-400"}`}>
                      {item.label}
                    </span>
                    {item.step < 4 && <span className="text-gray-600 mx-1">―</span>}
                  </div>
                ))}
              </div>

              {/* Step 1: Identity Capture */}
              {claimStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-bold text-[#C5A059] uppercase tracking-wider">Step 1: Artisan / Representative Identity</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Please provide your official legal name and contact details to initiate the sovereign verification process for <span className="text-white font-bold">{selectedArtisanForClaim.village}</span>.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs text-gray-300 font-bold mb-1">Full Legal Name (Applicant)</label>
                      <input
                        type="text"
                        required
                        value={claimForm.applicantName}
                        onChange={(e) => setClaimForm({ ...claimForm, applicantName: e.target.value })}
                        placeholder="e.g. Ramesh Kumar Meher"
                        className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-300 font-bold mb-1">Mobile Number (For WhatsApp / SMS Verification)</label>
                      <input
                        type="tel"
                        required
                        value={claimForm.mobileNumber}
                        onChange={(e) => setClaimForm({ ...claimForm, mobileNumber: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">We will send a secure verification code to this number.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Verification (OTP & GI Certificate) */}
              {claimStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-bold text-[#C5A059] uppercase tracking-wider">Step 2: GI-Tag & Mobile Verification</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    A secure verification code has been sent to <span className="text-white font-bold">{claimForm.mobileNumber}</span>. Please enter it below along with your GI-Tag registration.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs text-gray-300 font-bold mb-1">Enter 6-Digit Mobile OTP</label>
                      <input
                        type="text"
                        required
                        value={claimForm.otp}
                        onChange={(e) => setClaimForm({ ...claimForm, otp: e.target.value })}
                        placeholder="e.g. 749 201"
                        className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none font-mono tracking-widest"
                      />
                      <span className="text-[10px] text-[#C5A059] mt-1 block font-bold cursor-pointer hover:underline">Resend Verification OTP</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-300 font-bold mb-1">GI-Tag Certificate Number / Society Registration ID</label>
                      <input
                        type="text"
                        required
                        value={claimForm.giCertificate}
                        onChange={(e) => setClaimForm({ ...claimForm, giCertificate: e.target.value })}
                        placeholder="e.g. GI-Cert: #OD-7492-SB"
                        className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Used to cross-check with the official BIS & Textile Ministry portal.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Escrow Payout (Bank/UPI Details) */}
              {claimStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-bold text-[#C5A059] uppercase tracking-wider">Step 3: Direct D2C Escrow Payout Linkage</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Bhulia.com operates a 100% transparent Jan Dhan escrow settlement system. Enter your bank details to receive direct payouts for all saree orders.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs text-gray-300 font-bold mb-1">Bank Account Number / UPI ID (Jan Dhan / Commercial)</label>
                      <input
                        type="text"
                        required
                        value={claimForm.bankAccount}
                        onChange={(e) => setClaimForm({ ...claimForm, bankAccount: e.target.value })}
                        placeholder="e.g. 334129874563"
                        className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-300 font-bold mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={claimForm.ifscCode}
                        onChange={(e) => setClaimForm({ ...claimForm, ifscCode: e.target.value })}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div className="p-3 bg-[#0B2B26] border border-[#C5A059]/30 rounded-xl flex items-start gap-3">
                      <span className="text-lg">🛡️</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        By submitting, you authorize Shyam Dash Creation to verify your GI-Tag credentials with the primary weaving society and list your pit loom capacity on the public registry.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Success Confirmation */}
              {claimStep === 4 && (
                <div className="space-y-6 animate-fadeIn text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#C5A059] text-[#0A1021] mx-auto flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(197,160,89,0.6)] animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-serif font-bold text-white">Listing Claim Successfully Submitted!</h4>
                    <p className="text-xs text-[#C5A059] font-mono">Verification Tracking ID: #TRK-{Math.floor(Math.random() * 899999 + 100000)}</p>
                    <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto pt-2">
                      Thank you, <span className="text-white font-bold">{claimForm.applicantName}</span>. Your claim for <span className="text-white font-bold">{selectedArtisanForClaim.name}</span> has been securely transmitted to the Sovereign Verification Board.
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                      Your listing status has been updated to <span className="text-amber-400 font-bold">⏳ Claim Pending Verification</span> on the live directory. You will receive a WhatsApp confirmation once approved.
                    </p>
                  </div>

                  <button type="button" onClick={resetClaimModal} className="px-8 py-3.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.4)] cursor-pointer">
                    Return to Directory Grid
                  </button>
                </div>
              )}

              {/* Modal Footer Buttons (Steps 1-3) */}
              {claimStep < 4 && (
                <div className="pt-4 border-t border-[#C5A059]/20 flex justify-between items-center">
                  {claimStep > 1 ? (
                    <button type="button" onClick={() => setClaimStep(claimStep - 1)} className="px-5 py-2.5 bg-[#0B2B26] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                      ← Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button type="submit" disabled={isSubmittingClaim} className="px-8 py-2.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.4)] flex items-center gap-2 cursor-pointer">
                    {isSubmittingClaim ? (
                      <>
                        <span className="w-3 h-3 rounded-full bg-[#0A1021] animate-ping"></span>
                        <span>Verifying Escrow...</span>
                      </>
                    ) : (
                      <span>{claimStep === 3 ? "Submit Verification Claim ✓" : "Continue Next Step →"}</span>
                    )}
                  </button>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

      {/* 6. Global Ecosystem Continuous Footer Bar */}
      <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-12 px-6 z-50 relative shadow-[0_-4_30px_rgba(0,0,0,0.6)] mt-auto font-sans">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#C5A059]/20 pb-10">
            <div>
              <h3 className="text-lg font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Continuous Global Ecosystem Menu • Trust • Heritage • Innovation • Future</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-300">Ecosystem Status:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                All 4 Hub Nodes Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-[#C5A059]/20 pb-12">
            {/* Hub 1: Gold Hub */}
            <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-6 flex flex-col justify-between hover:border-[#C5A059] transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/20 px-2.5 py-1 rounded border border-[#C5A059]/30">HUB 01</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">shyamdash.com</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our flagship Productive Luxury Gold Jewelry Marketplace. Featuring live MCX tickers & Sequel Armored transit.</p>
              </div>
              <a href="https://sd-gold-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors">
                Explore Gold Hub →
              </a>
            </div>

            {/* Hub 2: Bhulia Hub (Active) */}
            <div className="bg-[#0D4B45] border-2 border-[#C5A059] rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(197,160,89,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/20 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/30 px-2.5 py-1 rounded border border-[#C5A059]">ACTIVE HUB</span>
                  <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#C5A059] mb-2">bhulia.com</h4>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">Our sovereign Sambalpuri Saree & Handloom Collective. Direct artisan empowerment & GI-Tag verification.</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-300">
                Currently Exploring
              </div>
            </div>

            {/* Hub 3: Dehapa Hub */}
            <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400 transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded border border-cyan-500/30">HUB 03</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">dehapa.com</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our Medplum-powered Healthcare Operating System. Providing world-class telemedicine & secure patient portals.</p>
              </div>
              <a href="https://sd-dehapa-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 hover:text-white transition-colors">
                Explore Health Hub →
              </a>
            </div>

            {/* Hub 4: IT Hub */}
            <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-400 transition-all group shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/30">HUB 04</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <h4 className="text-base font-serif font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">SD IT Hub</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">Our Enterprise SaaS & Technology Infrastructure Division. Automated Stripe billing & Support OS ticketing.</p>
              </div>
              <a href="https://sd-it-hub.vercel.app" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">
                Explore IT Hub →
              </a>
            </div>
          </div>

          {/* Bottom Section: Corporate Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4 pb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C5A059] shrink-0">
                  <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-serif font-bold text-[#C5A059] leading-none">Shyam Dash</h4>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">India's Verified Handloom Marketplace.</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                The premier luxury marketplace for authenticated, GI-Tagged Sambalpuri handlooms. Partnering exclusively with master weavers and primary cooperative societies across India.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><Link href="/directory" className="hover:text-[#C5A059] transition-colors">Our Weaver Network</Link></li>
                <li><Link href="/directory" className="hover:text-[#C5A059] transition-colors">Verify GI-Tag Certificate</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">Live Silk & Yarn Rates</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">SD Digital Services</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Customer Care</h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">Artisan Escrow Guide</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">Secure BVC Armored Transit</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">Platform Return Policy</Link></li>
                <li><Link href="/" className="hover:text-[#C5A059] transition-colors">24/7 Concierge Support</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Stay Updated</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Subscribe for daily live silk rates, artisan drop announcements, and exclusive GI collection releases.
              </p>
              <div className="flex items-center gap-2 bg-[#0B2B26] border border-[#C5A059]/40 rounded-xl p-1.5 shadow-inner">
                <input type="email" placeholder="Email Address" className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none" />
                <button className="bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] shrink-0 cursor-pointer">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#C5A059]/20 text-xs text-gray-400 font-mono">
            <p>© 2026 Shyam Dash Creation. All sovereign rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
              <Link href="/" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
              <Link href="/" className="hover:text-[#C5A059] transition-colors">GI Registry Clearance</Link>
            </div>
          </div>

        </div>
      </footer>

    </main>
  );
}
