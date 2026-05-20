"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Bilingual translations mapped by artisan slug
const TRANSLATIONS: Record<string, {
  en: { bio1: string; bio2: string };
  or: { bio1: string; bio2: string };
}> = {
  "nandalal-meher": {
    en: {
      bio1: "Nandalal Meher is a master of Sonepur's prestigious handloom heritage. He specializes in the complex art of single and double ikat silk weaving, turning fine threads into wearable masterpieces.",
      bio2: "Each Pata saree exhibits a rare mathematical alignment that takes months of precision dyeing and weaving to achieve, preserving a centuries-old tradition."
    },
    or: {
      bio1: "ନନ୍ଦଲାଲ ମେହେର ସୋନପୁରର ପ୍ରସିଦ୍ଧ ହସ୍ତତନ୍ତ ଐତିହ୍ୟର ଜଣେ ମୁଖ୍ୟ ବୁଣାକାର। ସେ ରେଶମ ସୂତାରେ ଏକକ ଏବଂ ଦ୍ଵିମୁଖୀ ଇକତ୍ ବୁଣାକଳାରେ ପାରଦର୍ଶିତା ଅର୍ଜନ କରିଛନ୍ତି।",
      bio2: "ତାଙ୍କର ପ୍ରତ୍ୟେକ ପାଟ ଶାଢ଼ୀରେ ଗାଣିତିକ ସମତୁଲତା ଦେଖିବାକୁ ମିଳେ, ଯାହା ପ୍ରସ୍ତୁତ କରିବାକୁ ମାସ ମାସ ସମୟ ଲାଗିଥାଏ।"
    }
  },
  "rabindra-meher": {
    en: {
      bio1: "Rabindra Meher is an innovative master weaver from Dasrajpur, Sonepur. Renowned for his creative vision, he breathes new life into Sambalpuri Pata sarees like Pasapalli, Nabakothi, and Bomkai.",
      bio2: "By tie-dyeing and weaving fine silk yarns entirely by hand, he seamlessly blends traditional layouts with contemporary styles for modern collectors."
    },
    or: {
      bio1: "ରବିନ୍ଦ୍ର ମେହେର ସୋନପୁର ଦାସରାଜପୁରର ଜଣେ ସୃଜନଶୀଳ ମୁଖ୍ୟ ବୁଣାକାର। ନିଜର ଅଭିନବ ଚିନ୍ତାଧାରା ପାଇଁ ଜଣାଶୁଣା ରବିନ୍ଦ୍ର ପାସାପାଲି, ନବକୋଠି ଏବଂ ବୋମକାଇ ଭଳି ସମ୍ବଲପୁରୀ ପାଟ ଶାଢ଼ୀକୁ ଏକ ନୂଆ ରୂପ ଦେଇଛନ୍ତି।",
      bio2: "ସେ ହାତରେ ସୂତା ରଙ୍ଗ କରି ପାରମ୍ପରିକ ଓ ଆଧୁନିକତାର ଅପୂର୍ବ ସମ୍ମିଶ୍ରଣ କରନ୍ତି।"
    }
  },
  "nagarjuna-meher": {
    en: {
      bio1: "Nagarjuna Meher is a legendary custodian of Sambalpuri Pata from Sonepur. Devoted to the pit loom since early childhood, he possesses an intuitive understanding of silk geometry.",
      bio2: "His double-ikat creations are celebrated on national runways and sought after by collectors worldwide for their flawless patterns and rich heritage."
    },
    or: {
      bio1: "ନାଗାର୍ଜୁନ ମେହେର ସୋନପୁରର ସମ୍ବଲପୁରୀ ପାଟର ଜଣେ କିମ୍ବଦନ୍ତୀ ବୁଣାକାର। ବାଲ୍ୟକାଳରୁ ଶାଳ ସହିତ ଜଡ଼ିତ ରହି ସେ ରେଶମ ଏବଂ ଜ୍ୟାମିତିକ ନକ୍ସାରେ ଅସାଧାରଣ ଦକ୍ଷତା ହାସଲ କରିଛନ୍ତି।",
      bio2: "ତାଙ୍କର ଦ୍ଵିମୁଖୀ ଇକତ୍ କଳାକୃତି ଜାତୀୟ ସ୍ତରରେ ଏବଂ ସାରା ବିଶ୍ଵର ଗ୍ରାହକଙ୍କ ମଧ୍ୟରେ ବେଶ୍ ଆଦୃତ।"
    }
  },
  "ravi-meher": {
    en: {
      bio1: "Ravi Meher, from Laumunda, Bargarh, is a visionary Master Weaver and Graph Artist. Merging mathematical precision with Bandha Kala, he hand-maps every thread matrix before weaving.",
      bio2: "Beyond his loom, he serves as a cultural guardian, training and mentoring hundreds of next-generation Bandha artists to preserve this heritage."
    },
    or: {
      bio1: "ରବି ମେହେର ବରଗଡ଼ ଜିଲ୍ଲା ଲଉମୁଣ୍ଡାର ଜଣେ ପ୍ରସିଦ୍ଧ ବୁଣାକାର ଓ ଗ୍ରାଫ୍ କଳାକାର। ଗ୍ରାଫ୍ କାଗଜରେ ପ୍ରତ୍ୟେକ ନକ୍ସା ପ୍ରସ୍ତୁତ କରି ସେ ମୂଲ୍ୟବାନ ବାନ୍ଧକଳାର ସୃଷ୍ଟି କରନ୍ତି।",
      bio2: "ଜଣେ ସାଂସ୍କୃତିକ ସଂରକ୍ଷକ ଭାବେ ସେ ଶହ ଶହ ଯୁବ ବୁଣାକାରଙ୍କୁ ପ୍ରଶିକ୍ଷଣ ଦେଇ ପରମ୍ପରାକୁ ବଞ୍ଚାଇ ରଖିଛନ୍ତି।"
    }
  }
};

interface ArtisanListing {
  id: string;
  slug: string;
  name: string;
  cluster: string;
  village: string;
  category: string;
  loomCount: number;
  giTagNumber: string;
  specialtyTags: string[];
  seoDescription: string;
  img: string;
  isClaimed: boolean;
  claimStatus?: "verified" | "pending" | "unverified";
  biodata?: {
    artisanTitle: string;
    legacyEst: string;
    awardHighlights: string[];
    masterpieceMotifs: string[];
    detailedBiography: string;
    shortStory?: string;
  };
  contactDetails?: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
}

const MASTER_ARTISANS: ArtisanListing[] = [
  {
    id: "ART-101",
    slug: "nandalal-meher",
    name: "Master Weaver Nandalal Meher",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    category: "sonepur",
    loomCount: 14,
    giTagNumber: "GI-Cert: #OD-4491-SP",
    specialtyTags: ["Double Ikat Pata", "Single Ikat", "Premium Silk"],
    seoDescription: "Exquisite, handcrafted single and double ikat silk sarees straight from the looms of Dasrajpur.",
    img: "/nandalal_meher.jpg",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Award-Winning Master Weaver",
      legacyEst: "Est. 1982 / Dasrajpur Ikat Heritage Loom",
      shortStory: "Every thread tells a story. Based in Sonepur, Nandalal Meher spends months tie-dying and weaving a single Pata saree.",
      awardHighlights: [
        "🏆 Award for Handloom Excellence",
        "🏆 Sant Kabir Master Craft Seal"
      ],
      masterpieceMotifs: [
        "✨ Traditional Temple Spire",
        "✨ Shankha (Conch Shell) Geometry",
        "✨ Flawless Mathematical Double Bandha"
      ],
      detailedBiography: "Nandalal Meher has dedicated his life to Sonepur handloom heritage, mastering both single and double ikat silk pata."
    },
    contactDetails: {
      address: "Dasrajpur, Sonepur, Odisha 767017",
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
      email: "nandalal.meher@bhulia.com"
    }
  },
  {
    id: "ART-102",
    slug: "rabindra-meher",
    name: "Creative Weaver Rabindra Meher",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    category: "sonepur",
    loomCount: 18,
    giTagNumber: "GI-Cert: #OD-5512-SP",
    specialtyTags: ["Sambalpuri Pata", "Pasapalli", "Bomkai"],
    seoDescription: "Creative master weaver reviving classic Sambalpuri Pata.",
    img: "/rabindra_meher.jpg",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Creative Master of Sambalpuri Pata",
      legacyEst: "Est. 1988 / Dasrajpur Silk Innovation Loom",
      shortStory: "Rabindra Meher is renowned for breathing new life into Pasapalli and Bomkai pata.",
      awardHighlights: [
        "🏆 Award for Handloom Innovation",
        "🏆 State Champion of Bandhakala Silk"
      ],
      masterpieceMotifs: [
        "✨ Pasapalli Dice Matrix",
        "✨ Nabakothi Auspicious Houses",
        "✨ Boita Bandana Maritime Theme"
      ],
      detailedBiography: "Rabindra Meher transforms raw mulberry silk into fluid, storytelling canvases using advanced resist dye layouts."
    },
    contactDetails: {
      address: "Dasrajpur, Sonepur, Odisha 767017",
      phone: "+91 98765 43211",
      whatsapp: "919876543211",
      email: "rabindra.meher@bhulia.com"
    }
  },
  {
    id: "ART-103",
    slug: "nagarjuna-meher",
    name: "Master Artisan Nagarjuna Meher",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    category: "sonepur",
    loomCount: 22,
    giTagNumber: "GI-Cert: #OD-6621-SP",
    specialtyTags: ["Premium Double Ikat", "Bichitrapuri", "Sonepuri Bomkai"],
    seoDescription: "Legendary master weaver devoted to high-class double ikat silk pata.",
    img: "/nagarjuna_meher.png",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Legendary Custodian of Sambalpuri Pata",
      legacyEst: "Est. 1976 / Dasrajpur Lifetime Excellence Loom",
      shortStory: "Nagarjuna Meher has an intuitive, lifelong understanding of silk geometry and double ikat alignment.",
      awardHighlights: [
        "🏆 Lifetime Handloom Excellence Seal",
        "🏆 Global Heritage Craft Ambassador"
      ],
      masterpieceMotifs: [
        "✨ Premium Double Ikat Alignment",
        "✨ Royal Bichitrapuri Grids",
        "✨ Sonepuri Jala Borders"
      ],
      detailedBiography: "Nagarjuna Meher's masterworks are celebrated internationally for their flawless patterns and geometric integrity."
    },
    contactDetails: {
      address: "Dasrajpur, Sonepur, Odisha 767017",
      phone: "+91 98765 43212",
      whatsapp: "919876543212",
      email: "nagarjuna.meher@bhulia.com"
    }
  },
  {
    id: "ART-104",
    slug: "ravi-meher",
    name: "Master Weaver Ravi Meher",
    cluster: "Bargarh Cluster",
    village: "Laumunda, Bargarh",
    category: "bargarh",
    loomCount: 15,
    giTagNumber: "GI-Cert: #OD-1102-BG",
    specialtyTags: ["Pasapali Cotton Classics", "Bichitrapuri", "Sachipar Designs"],
    seoDescription: "Visionary Master Weaver and Graph Artist merging mathematical precision with Bandha Kala.",
    img: "/ravi_meher_v3.png",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Master Weaver & Graph Artist",
      legacyEst: "Cultural Guardian of Lumunda",
      shortStory: "Ravi Meher hand-maps every thread matrix on graphs before mounting yarns on his pit looms.",
      awardHighlights: [
        "🏆 National Graph Artist Recognition",
        "🏆 Guardian of Bandha Kala Heritage"
      ],
      masterpieceMotifs: [
        "✨ Pasapali Mathematical Classics",
        "✨ Sachipar Checkered Matrix",
        "✨ Modern Narrative Corporate Graphs"
      ],
      detailedBiography: "Ravi Meher from Lumunda, Bargarh, maps complex patterns on graph paper before resist-dyeing cotton yarns."
    },
    contactDetails: {
      address: "Lumunda, Bargarh, Odisha, India",
      phone: "+91 98765 43213",
      whatsapp: "919876543213",
      email: "ravi.meher@bhulia.com"
    }
  }
];

const DEFAULT_ARTISAN: ArtisanListing = {
  id: "ART-999",
  slug: "odisha-master-weavers",
  name: "Odisha Heritage Master Weaver",
  cluster: "Odisha Handloom Belt",
  village: "Handloom Cluster, Odisha",
  category: "heritage",
  loomCount: 15,
  giTagNumber: "GI-Cert: #OD-5541-HB",
  specialtyTags: ["Traditional Ikat", "Handspun Yarn"],
  seoDescription: "Traditional pit loom weaver preserving Odishan tie-and-dye Ikat.",
  img: "/bhulia-hero.png",
  isClaimed: true,
  claimStatus: "verified",
  biodata: {
    artisanTitle: "Master Weaver Heritage Guild",
    legacyEst: "Est. 1945 / Handloom Syndicate",
    shortStory: "Elite weaver syndicate preserving grassroots pit loom heritage.",
    awardHighlights: ["🏆 National Handloom Heritage Trophy"],
    masterpieceMotifs: ["✨ Traditional Pasapalli Matrix", "✨ Phoda Kumbha Temple Spire"],
    detailedBiography: "Preserving ancient weaving configurations passed down through generations."
  }
};

const NANDALAL_SAREES = [
  { 
    id: "SAR-N101", 
    title: "Dasrajpur Royal Pasapalli Double Ikat Pata", 
    category: "Double Ikat Silk",
    desc: "Flawless mathematical alignment where both warp and weft silk threads are tie-dyed before mounting.",
    price: "₹ 34,500", 
    weave: "Double Ikat Pata", 
    time: "45 days", 
    img: "/bhulia-hero.png"
  },
  { 
    id: "SAR-N102", 
    title: "Sonepur Temple Spire & Conch Double Ikat Silk", 
    category: "Double Ikat Silk",
    desc: "Intricate temple borders and conch shell motifs tie-dyed with absolute micro-millimeter precision.",
    price: "₹ 38,000", 
    weave: "Double Ikat Pata", 
    time: "52 days", 
    img: "/bhulia-hero.png"
  },
  { 
    id: "SAR-N103", 
    title: "Traditional Machha (Fish) Motif Single Ikat Pata", 
    category: "Single Ikat Silk",
    desc: "Vibrant everyday luxury silk saree featuring classic Odishan fish wealth motifs along the rich pallu.",
    price: "₹ 18,500", 
    weave: "Single Ikat Pata", 
    time: "22 days", 
    img: "/bhulia-hero.png"
  }
];

const STANDARD_SAREES = [
  { id: "SAR-101", title: "Royal Pasapalli Mercerized Cotton Ikat", category: "Cotton Classics", desc: "Handspun, high-density traditional cotton weave featuring flawless mathematical symmetry.", price: "₹ 12,500", weave: "Double Ikat", time: "18 days", img: "/bhulia-hero.png" },
  { id: "SAR-102", title: "Subarnapur Extra-Weft Mulberry Silk Bomkai", category: "Silk Masterpieces", desc: "Heavy 3-ply Mulberry silk Bomkai sarees featuring rich extra-weft gold thread work.", price: "₹ 24,800", weave: "Bomkai Extra-Weft", time: "25 days", img: "/bhulia-hero.png" },
  { id: "SAR-103", title: "Traditional Phoda Kumbha Border Cotton Saree", category: "Cotton Classics", desc: "High-twist handspun yarn offering exceptional breathability and comfort.", price: "₹ 8,900", weave: "Single Ikat", time: "12 days", img: "/bhulia-hero.png" }
];

export default function WeaverStorePage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "nandalal-meher";
  const weaverSlug = rawSlug.toLowerCase();

  const foundArtisan = MASTER_ARTISANS.find((a) => a.slug === weaverSlug || a.id.toLowerCase() === weaverSlug) || {
    ...DEFAULT_ARTISAN,
    id: weaverSlug.toUpperCase(),
    slug: weaverSlug,
    name: `Master Weaver Store (${weaverSlug.replace(/-/g, " ")})`,
  };

  const [artisan, setArtisan] = useState<ArtisanListing>(foundArtisan);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<"en" | "or">("en");

  const isNandalal = artisan.slug === "nandalal-meher";
  const currentCatalog = isNandalal ? NANDALAL_SAREES : STANDARD_SAREES;

  useEffect(() => {
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
        setUserUid("sd_super_admin_custom_uid");
      }
    };

    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);

    // Capture referral ID if land directly here
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const ref = p.get("ref");
      if (ref) {
        localStorage.setItem("sd_referral_id", ref);
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    const shareUrl = `${window.location.origin}/weaver/${artisan.slug}?ref=${userUid}`;
    const message = `Explore the master weaver profile for ${artisan.name}. Saree order checkout secured with escrow payouts. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  const bio = TRANSLATIONS[artisan.slug] || {
    en: { bio1: artisan.biodata?.shortStory || artisan.seoDescription, bio2: artisan.biodata?.detailedBiography.substring(0, 150) + "..." },
    or: { bio1: "ଓଡ଼ିଶାର ହସ୍ତତନ୍ତ ବୁଣାକାର ସମିତିର ଅଧୀନରେ ଥିବା ଏହି ବୁଣାକାର ନିଜର ଶାଢ଼ୀ ପାଇଁ ବହୁ ପରିଚିତ।", bio2: "ଏହି ଶାଢ଼ୀ ଅତ୍ୟନ୍ତ ପରିଶ୍ରମ ଓ ଗାଣିତିକ ସମତୁଲତା ସହ ପ୍ରସ୍ତୁତ କରାଯାଇଛି।" }
  };

  return (
    <main className="relative flex-1 w-full bg-[#FDFBF7] text-[#0D1917] font-sans flex flex-col min-h-screen">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity">BHULIA.COM</h1>
              </Link>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri Saree Collective</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <a href="#looms" className="hover:text-[#C5A059] transition-colors pb-1">Loom Capacity</a>
            <a href="#catalog" className="hover:text-[#C5A059] transition-colors pb-1">Saree Catalog</a>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Contact Guild</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {userAvatar ? (
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner">
                <img src={userAvatar} alt="User Avatar" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-[#C5A059]" />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{userName}</span>
                  <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
                </div>
              </div>
            ) : (
              <a href="https://sd-auth-center.vercel.app" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow">
                <span>Sign In / Register</span>
              </a>
            )}

            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[57px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <a href="#looms" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Loom Capacity</a>
            <a href="#catalog" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Saree Catalog</a>
            {!userAvatar && (
              <a href="https://sd-auth-center.vercel.app" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider">
                <span>Sign In / Register</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Weaver Profile Main Content */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Profile Image & Loom Details */}
          <div className="lg:col-span-4 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-lg bg-[#051815]">
                <Image src={artisan.img} alt={artisan.name} fill className="object-cover" />
                <div className="absolute bottom-4 left-4 bg-[#0B2B26]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold">
                  {artisan.giTagNumber}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">Weaving Cluster Location</span>
                <p className="text-sm font-semibold text-white font-serif">{artisan.village}, {artisan.cluster}</p>
              </div>

              <div id="looms" className="grid grid-cols-2 gap-4 border-t border-[#C5A059]/20 pt-4">
                <div className="bg-[#0A3A35] rounded-xl p-3 border border-[#C5A059]/20">
                  <span className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Active Pit Looms</span>
                  <p className="text-xl font-black text-[#C5A059]">{artisan.loomCount}</p>
                </div>
                <div className="bg-[#0A3A35] rounded-xl p-3 border border-[#C5A059]/20">
                  <span className="text-[9px] uppercase tracking-widest text-gray-300 block mb-1">Verification Status</span>
                  <p className="text-xs font-black text-green-400 uppercase tracking-widest mt-1">✓ Claimed</p>
                </div>
              </div>
            </div>

            {/* Social Sharing buttons for this weaver page */}
            <div className="mt-6 border-t border-[#C5A059]/20 pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold block">Share Weaver Storefront</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
                  <span>📲 Share WA</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
                  <span>📘 Share FB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Block: Biography & Award Showcase */}
          <div className="lg:col-span-8 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white">
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-3">
                    <span>{artisan.biodata?.artisanTitle}</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#C5A059] leading-tight">{artisan.name}</h2>
                  <p className="text-xs text-gray-300 font-mono tracking-wide mt-1.5">{artisan.biodata?.legacyEst}</p>
                </div>

                {/* Bilingual Language Selector */}
                <div className="flex bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-1 shrink-0">
                  <button onClick={() => setLang("en")} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${lang === "en" ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:text-white"}`}>EN</button>
                  <button onClick={() => setLang("or")} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${lang === "or" ? "bg-[#C5A059] text-[#0A1021]" : "text-gray-300 hover:text-white"}`}>ଓଡ଼</button>
                </div>
              </div>

              {/* Biography Section */}
              <div className="space-y-4 leading-relaxed text-sm font-sans text-gray-200">
                <p className="border-l-2 border-[#C5A059] pl-3 py-1 font-serif text-base italic text-gray-100">
                  "{bio[lang].bio1}"
                </p>
                <p className="text-xs sm:text-sm text-gray-300">
                  {bio[lang].bio2}
                </p>
              </div>

              {/* Legacy Motifs */}
              {artisan.biodata?.masterpieceMotifs && (
                <div className="border-t border-[#C5A059]/20 pt-6">
                  <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Masterpiece Motif Blueprints</h3>
                  <div className="flex flex-wrap gap-2">
                    {artisan.biodata.masterpieceMotifs.map((motif, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#0A3A35] border border-[#C5A059]/30 text-white rounded-lg text-[10px] sm:text-xs font-semibold">{motif}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Awards Highlight list */}
            {artisan.biodata?.awardHighlights && (
              <div className="border-t border-[#C5A059]/20 pt-6 mt-6">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-3">Government Seal & Award Registry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {artisan.biodata.awardHighlights.map((award, idx) => (
                    <div key={idx} className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-xs font-semibold leading-snug">{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Saree Catalog Header */}
        <div id="catalog" className="space-y-4 pt-6 border-t border-[#C5A059]/20">
          <h3 className="text-xl md:text-3xl font-serif text-[#0B2B26] font-bold tracking-wider">Available Pit Loom Catalog</h3>
          <p className="text-[10px] md:text-xs text-neutral-600 uppercase tracking-widest font-semibold">Reserve handloom pieces directly from this artisan - escrow protection activated</p>

          {/* Saree Catalog Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {currentCatalog.map((saree) => (
              <div key={saree.id} className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl p-0.5 text-white">
                <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-[#0B2B26] rounded-t-xl">
                  <Image src={saree.img} alt={saree.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#C5A059] text-[#0A1021] text-[9px] font-bold uppercase tracking-widest rounded shadow">{saree.weave}</span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#C5A059] transition-colors mb-1 line-clamp-1">{saree.title}</h4>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans line-clamp-2">{saree.desc}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#C5A059]/20 pt-2.5">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Direct Price</span>
                      <span className="text-base font-serif font-bold text-[#C5A059]">{saree.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Weaving Time</span>
                      <span className="text-[10px] font-mono text-gray-200 font-bold">{saree.time}</span>
                    </div>
                  </div>

                  {/* Share buttons on cards */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#C5A059]/10">
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + saree.title + ": " + shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}?ref=${userUid}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>

                  <Link href={`/product/${encodeURIComponent(saree.title.toLowerCase().replace(/\s+/g, "-"))}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-center block">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Global Footer */}
      <footer className="w-full bg-[#051815] border-t border-[#C5A059]/40 text-white py-8 px-6 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-serif font-bold tracking-widest text-[#C5A059] uppercase mb-1">Shyam Dash Global Network</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sovereign Artisan Ecosystem</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">© 2026 Bhulia.com. All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}
