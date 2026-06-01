"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWeaverBySlug, useProducts } from "@/lib/db-hooks";

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
  heroImg?: string;
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
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const weaverSlug = rawSlug.toLowerCase();

  const { weaver: liveWeaver, loading: weaverLoading } = useWeaverBySlug(weaverSlug);
  const { products: liveProducts, loading: productsLoading } = useProducts();

  const foundArtisan = MASTER_ARTISANS.find((a) => a.slug === weaverSlug || a.id.toLowerCase() === weaverSlug);
  
  const artisan: ArtisanListing | null = liveWeaver ? {
    id: liveWeaver.id,
    slug: liveWeaver.slug,
    name: liveWeaver.title,
    cluster: liveWeaver.desc.includes("Sonepur") ? "Sonepur Cluster" : (liveWeaver.desc.includes("Bargarh") ? "Bargarh Cluster" : "Odisha Cluster"),
    village: liveWeaver.desc.includes("Dasrajpur") ? "Dasrajpur, Sonepur" : (liveWeaver.desc.includes("Laumunda") ? "Laumunda, Bargarh" : "Handloom Village"),
    category: "heritage",
    loomCount: 15,
    giTagNumber: foundArtisan?.giTagNumber || "GI-Cert: #OD-" + Math.floor(1000 + Math.random() * 9000),
    specialtyTags: [liveWeaver.badge, "Traditional Ikat"],
    seoDescription: liveWeaver.desc,
    img: liveWeaver.img,
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: foundArtisan?.biodata?.artisanTitle || "Master Weaver",
      legacyEst: foundArtisan?.biodata?.legacyEst || "Est. Heritage Loom",
      shortStory: foundArtisan?.biodata?.shortStory || liveWeaver.desc,
      awardHighlights: foundArtisan?.biodata?.awardHighlights || ["🏆 Handloom Excellence"],
      masterpieceMotifs: foundArtisan?.biodata?.masterpieceMotifs || ["✨ Traditional Ikat", "✨ Handwoven Silk"],
      detailedBiography: foundArtisan?.biodata?.detailedBiography || liveWeaver.desc,
    }
  } : null;

  const sidebarPosition = liveWeaver?.layoutConfig?.sidebarPosition || "Left";
  const heroEnabled = liveWeaver?.layoutConfig?.heroEnabled ?? true;
  const gridStyle = liveWeaver?.layoutConfig?.gridStyle || "3-Column";

  const weaverProducts = liveProducts.filter(p => 
    p.weaverName === artisan?.name || 
    p.weaverName === liveWeaver?.title || 
    (p.weaverName && artisan?.name && p.weaverName.toLowerCase().includes(artisan.name.toLowerCase().replace("master weaver ", "").trim()))
  );
  
  const displayProducts = weaverProducts.length > 0 ? weaverProducts : liveProducts.slice(0, 3);

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<"en" | "or">("en");

  // Domain & Branding Settings Simulation States
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(false);
  const [domainTier, setDomainTier] = useState<string>("numeric");
  const [subfolderInput, setSubfolderInput] = useState<string>("");
  const [subdomainInput, setSubdomainInput] = useState<string>("");
  const [domainSearchInput, setDomainSearchInput] = useState<string>("");
  const [domainSearchTld, setDomainSearchTld] = useState<string>(".com");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{ available: boolean; domain: string; price: number; platformFee: number } | null>(null);
  const [checkAvailabilityStatus, setCheckAvailabilityStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [activeCustomUrl, setActiveCustomUrl] = useState<string | null>(null);

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

    // Retrieve saved custom domain settings
    if (typeof window !== "undefined") {
      const savedTier = localStorage.getItem(`sd_weaver_domain_tier_${weaverSlug}`) || "numeric";
      const savedCustomUrl = localStorage.getItem(`sd_weaver_custom_url_${weaverSlug}`);
      const savedSubfolder = localStorage.getItem(`sd_weaver_subfolder_${weaverSlug}`) || "";
      const savedSubdomain = localStorage.getItem(`sd_weaver_subdomain_${weaverSlug}`) || "";

      setDomainTier(savedTier);
      setActiveCustomUrl(savedCustomUrl);
      setSubfolderInput(savedSubfolder);
      setSubdomainInput(savedSubdomain);

      // Capture referral ID if land directly here
      const p = new URLSearchParams(window.location.search);
      const ref = p.get("ref");
      if (ref) {
        localStorage.setItem("sd_referral_id", ref);
      }
    }

    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, [weaverSlug]);

  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    if (!artisan) return;
    const shareUrl = `${window.location.origin}/weaver/${artisan.slug}?ref=${userUid}`;
    const message = `Explore the master weaver profile for ${artisan.name}. Saree order checkout secured with escrow payouts. ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  const handleCheckAvailability = (type: "subfolder" | "subdomain", val: string) => {
    if (!val.trim()) return;
    setCheckAvailabilityStatus("checking");
    setTimeout(() => {
      if (val.toLowerCase() === "taken" || val.toLowerCase() === "admin" || val.toLowerCase() === "bhulia") {
        setCheckAvailabilityStatus("taken");
      } else {
        setCheckAvailabilityStatus("available");
      }
    }, 800);
  };

  const handleSearchDomain = () => {
    if (!domainSearchInput.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setTimeout(() => {
      setIsSearching(false);
      const isTaken = domainSearchInput.toLowerCase() === "google" || domainSearchInput.toLowerCase() === "bhulia";
      const domainName = `${domainSearchInput.toLowerCase().replace(/[^a-z0-9-]/g, "")}${domainSearchTld}`;
      setSearchResult({
        available: !isTaken,
        domain: domainName,
        price: domainSearchTld === ".com" ? 899 : domainSearchTld === ".in" ? 499 : 799,
        platformFee: 1499
      });
    }, 1000);
  };

  const handleSaveDomainSettings = (tier: string, value: string) => {
    let customUrl = null;
    if (tier === "subfolder") {
      customUrl = `bhulia.com/${value.toLowerCase().replace(/\s+/g, "")}`;
    } else if (tier === "subdomain") {
      customUrl = `${value.toLowerCase().replace(/\s+/g, "")}.bhulia.com`;
    } else if (tier === "custom") {
      customUrl = value.toLowerCase();
    }

    localStorage.setItem(`sd_weaver_domain_tier_${weaverSlug}`, tier);
    if (customUrl) {
      localStorage.setItem(`sd_weaver_custom_url_${weaverSlug}`, customUrl);
    } else {
      localStorage.removeItem(`sd_weaver_custom_url_${weaverSlug}`);
    }

    if (tier === "subfolder") localStorage.setItem(`sd_weaver_subfolder_${weaverSlug}`, value);
    if (tier === "subdomain") localStorage.setItem(`sd_weaver_subdomain_${weaverSlug}`, value);

    setDomainTier(tier);
    setActiveCustomUrl(customUrl);
    alert(`🎉 Branding settings updated! Your storefront URL is now: ${customUrl || `bhulia.com/weaver/${weaverSlug}`}`);
  };

  const bio = (artisan && TRANSLATIONS[artisan.slug]) || {
    en: { bio1: artisan?.biodata?.shortStory || artisan?.seoDescription || "Master weaver of authentic Sambalpuri handlooms.", bio2: artisan?.biodata?.detailedBiography.substring(0, 150) + "..." },
    or: { bio1: "ଓଡ଼ିଶାର ହସ୍ତତନ୍ତ ବୁଣାକାର ସମିତିର ଅଧୀନରେ ଥିବା ଏହି ବୁଣାକାର ନିଜର ଶାଢ଼ୀ ପାଇଁ ବହୁ ପରିଚିତ।", bio2: "ଏହି ଶାଢ଼ୀ ଅତ୍ୟନ୍ତ ପରିଶ୍ରମ ଓ ଗାଣିତିକ ସମତୁଲତା ସହ ପ୍ରସ୍ତୁତ କରାଯାଇଛି।" }
  };

  return (
    <main className="relative flex-1 w-full bg-[#051815] text-white font-sans flex flex-col min-h-screen">
      
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
            <UserMenu />

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
        
        {weaverLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-pulse">
            <div className="lg:col-span-4 h-[600px] bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl"></div>
            <div className="lg:col-span-8 h-[600px] bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl"></div>
          </div>
        ) : !artisan ? (
          <div className="space-y-12">
            <div className="text-center py-16 bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl shadow-[0_0_40px_rgba(197,160,89,0.15)] relative overflow-hidden">
              <span className="text-5xl mb-4 block">🚫</span>
              <h2 className="text-3xl font-serif font-bold text-white mb-3">Weaver Not Found</h2>
              <p className="text-gray-300 max-w-lg mx-auto font-sans leading-relaxed text-sm mb-6">
                We could not locate this verified artisan profile. They may be pending verification or the link has changed.
              </p>
              <Link href="/" className="inline-flex items-center justify-center bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg">
                View All Artisans
              </Link>
            </div>
          </div>
        ) : (
          <>
        {/* Simulator View Controller Toggle */}
        <div className="bg-[#0A3A35]/90 border border-[#C5A059]/40 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <p className="text-xs text-gray-200">
                <strong>Simulator Console:</strong> You are viewing this page as a <span className="text-[#C5A059] font-bold">{isOwnerMode ? "Store Owner (Weaver)" : "Public Visitor"}</span>.
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {isOwnerMode 
                  ? "You have access to custom domain registry, SEO analytics, and branding configuration tools below." 
                  : "Weavers can claim their profile to setup custom domains, standalone web addresses, and digital storefronts."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOwnerMode(!isOwnerMode)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all shadow cursor-pointer"
          >
            {isOwnerMode ? "Switch to Visitor View" : "Simulate Owner Login"}
          </button>
        </div>

        {/* 1. Dynamic Hero Banner */}
        {heroEnabled && artisan && (
          <div className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl mb-6 bg-[#0B2B26]">
            <Image src={artisan.heroImg || artisan.img} alt="Loom Heritage Banner" fill className="object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#010a08] via-[#051815]/90 to-transparent"></div>
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Odishan Pit Loom Master</span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mt-1 uppercase tracking-wider">{artisan.name}</h2>
              <p className="text-xs text-gray-300 font-mono mt-1.5">{artisan.giTagNumber} • {artisan.village}, {artisan.cluster}</p>
            </div>
          </div>
        )}

        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Profile Image & Loom Details */}
          <div className={`bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl ${sidebarPosition === "Hidden" ? "hidden" : "lg:col-span-4"} ${sidebarPosition === "Right" ? "lg:order-2" : "lg:order-1"}`}>
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
          <div className={`bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white ${sidebarPosition === "Hidden" ? "lg:col-span-12" : "lg:col-span-8"} ${sidebarPosition === "Right" ? "lg:order-1" : "lg:order-2"}`}>
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

        {/* Storefront Custom Domain & Branding Settings Panel (Owner View Only) */}
        {isOwnerMode && (
          <div className="bg-[#0B2B26]/90 border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn transition-all duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-[#C5A059]/20">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-[#C5A059] font-bold tracking-wider">🌐 Storefront Domain & Branding Panel</h3>
                <p className="text-xs text-gray-300 mt-1">Configure your personalized web URL to route buyers and track affiliate shares automatically.</p>
              </div>
              <div className="bg-[#0A3A35] border border-[#C5A059]/30 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs shrink-0 self-start md:self-auto">
                <span className="text-green-400">●</span>
                <span className="font-mono text-gray-200">
                  Active Domain:{" "}
                  <strong className="text-white hover:underline cursor-pointer">
                    {activeCustomUrl ? `https://${activeCustomUrl}` : typeof window !== "undefined" ? `${window.location.origin}/weaver/${artisan.slug}` : `bhulia.com/weaver/${artisan.slug}`}
                  </strong>
                </span>
              </div>
            </div>

            {/* Branding Tiers Selection cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Numeric URL (Free) */}
              <div 
                onClick={() => setDomainTier("numeric")}
                className={`bg-[#0A3A35]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "numeric" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]" : "border-[#C5A059]/20"}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Tier 1 (Free)</span>
                    {domainTier === "numeric" && <span className="text-xs">✅</span>}
                  </div>
                  <h4 className="font-serif font-bold text-[#C5A059] text-sm">Default Link</h4>
                  <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">Assigned automatically on page approval.</p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#C5A059]/10 text-xs font-semibold text-white">
                  bhulia.com/store/1024
                </div>
              </div>

              {/* Custom Subfolder (₹499/year) */}
              <div 
                onClick={() => setDomainTier("subfolder")}
                className={`bg-[#0A3A35]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "subfolder" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]" : "border-[#C5A059]/20"}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Tier 2 (₹499/yr)</span>
                    {domainTier === "subfolder" && <span className="text-xs">✅</span>}
                  </div>
                  <h4 className="font-serif font-bold text-[#C5A059] text-sm">Custom Subfolder</h4>
                  <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">Direct path on main site for clean sharing.</p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#C5A059]/10 text-xs font-semibold text-white">
                  bhulia.com/weaver-name
                </div>
              </div>

              {/* Custom Subdomain (₹999/year) */}
              <div 
                onClick={() => setDomainTier("subdomain")}
                className={`bg-[#0A3A35]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "subdomain" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]" : "border-[#C5A059]/20"}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Tier 3 (₹999/yr)</span>
                    {domainTier === "subdomain" && <span className="text-xs">✅</span>}
                  </div>
                  <h4 className="font-serif font-bold text-[#C5A059] text-sm">Subdomain Hub</h4>
                  <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">Premium subdomain for dedicated branding.</p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#C5A059]/10 text-xs font-semibold text-white">
                  weaver-name.bhulia.com
                </div>
              </div>

              {/* Standalone Domain (₹1,499/year + Registration) */}
              <div 
                onClick={() => setDomainTier("custom")}
                className={`bg-[#0A3A35]/50 border rounded-2xl p-4 cursor-pointer hover:border-[#C5A059] transition-all flex flex-col justify-between ${domainTier === "custom" ? "border-[#C5A059] ring-1 ring-[#C5A059] bg-[#0A3A35]" : "border-[#C5A059]/20"}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Tier 4 (₹1499/yr+)</span>
                    {domainTier === "custom" && <span className="text-xs">✅</span>}
                  </div>
                  <h4 className="font-serif font-bold text-[#C5A059] text-sm">Standalone Domain</h4>
                  <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">Full custom DNS integration (e.g. .com, .in).</p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#C5A059]/10 text-xs font-semibold text-white">
                  weavername.com
                </div>
              </div>

            </div>

            {/* Dynamic settings container based on the selected tier */}
            <div className="bg-[#0A3A35]/60 border border-[#C5A059]/30 rounded-2xl p-5 sm:p-6 shadow-inner">
              {domainTier === "numeric" && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tier 1: Free Default Numeric Configuration</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Your store uses the standard URL prefix mapping. Customers can access your catalog via:
                  </p>
                  <div className="bg-[#051815] border border-[#C5A059]/20 rounded-xl p-3 text-xs font-mono text-gray-200">
                    {typeof window !== "undefined" ? window.location.origin : "https://bhulia.com"}/weaver/{artisan.slug}
                  </div>
                  <button 
                    onClick={() => handleSaveDomainSettings("numeric", "")}
                    className="mt-2 bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Default Link Setup
                  </button>
                </div>
              )}

              {domainTier === "subfolder" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tier 2: Custom Subfolder Setup (₹499/year)</h4>
                  <p className="text-xs text-gray-300">Choose a clean subpath on the Bhulia marketplace domain:</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center flex-1 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 font-mono select-none">bhulia.com/</span>
                      <input 
                        type="text" 
                        placeholder="nandalal" 
                        value={subfolderInput}
                        onChange={(e) => {
                          setSubfolderInput(e.target.value);
                          setCheckAvailabilityStatus("idle");
                        }}
                        className="bg-transparent border-0 outline-none text-xs text-white flex-1 font-mono placeholder-gray-600 pl-0.5 ml-0.5"
                      />
                    </div>
                    <button 
                      onClick={() => handleCheckAvailability("subfolder", subfolderInput)}
                      disabled={checkAvailabilityStatus === "checking"}
                      className="px-5 py-2.5 rounded-xl border border-[#C5A059] text-xs font-bold text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      {checkAvailabilityStatus === "checking" ? "Checking..." : "Check Availability"}
                    </button>
                  </div>

                  {checkAvailabilityStatus === "available" && (
                    <div className="text-xs text-green-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                      <span>✅</span>
                      <span>Name 'bhulia.com/{subfolderInput}' is available! Click save below to proceed.</span>
                    </div>
                  )}

                  {checkAvailabilityStatus === "taken" && (
                    <div className="text-xs text-red-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                      <span>❌</span>
                      <span>Sorry, 'bhulia.com/{subfolderInput}' is already taken or restricted.</span>
                    </div>
                  )}

                  {checkAvailabilityStatus === "available" && (
                    <button 
                      onClick={() => handleSaveDomainSettings("subfolder", subfolderInput)}
                      className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer"
                    >
                      Buy & Configure Subfolder (₹499)
                    </button>
                  )}
                </div>
              )}

              {domainTier === "subdomain" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tier 3: Dedicated Subdomain Configuration (₹999/year)</h4>
                  <p className="text-xs text-gray-300">Set up a high-end subdomain prefix for absolute brand distinction:</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center flex-1 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
                      <input 
                        type="text" 
                        placeholder="nandalal" 
                        value={subdomainInput}
                        onChange={(e) => {
                          setSubdomainInput(e.target.value);
                          setCheckAvailabilityStatus("idle");
                        }}
                        className="bg-transparent border-0 outline-none text-xs text-white flex-1 font-mono placeholder-gray-600 text-right pr-0.5 mr-0.5"
                      />
                      <span className="text-xs text-gray-400 font-mono select-none">.bhulia.com</span>
                    </div>
                    <button 
                      onClick={() => handleCheckAvailability("subdomain", subdomainInput)}
                      disabled={checkAvailabilityStatus === "checking"}
                      className="px-5 py-2.5 rounded-xl border border-[#C5A059] text-xs font-bold text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      {checkAvailabilityStatus === "checking" ? "Checking..." : "Check Availability"}
                    </button>
                  </div>

                  {checkAvailabilityStatus === "available" && (
                    <div className="text-xs text-green-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                      <span>✅</span>
                      <span>Subdomain '{subdomainInput}.bhulia.com' is available! Click save below to proceed.</span>
                    </div>
                  )}

                  {checkAvailabilityStatus === "taken" && (
                    <div className="text-xs text-red-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                      <span>❌</span>
                      <span>Sorry, the subdomain '{subdomainInput}.bhulia.com' is already registered.</span>
                    </div>
                  )}

                  {checkAvailabilityStatus === "available" && (
                    <button 
                      onClick={() => handleSaveDomainSettings("subdomain", subdomainInput)}
                      className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer"
                    >
                      Buy & Configure Subdomain (₹999)
                    </button>
                  )}
                </div>
              )}

              {domainTier === "custom" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tier 4: Standalone Custom Domain Registration (₹1,499/year Platform + Registry Fee)</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Search and register a standalone domain name (like `.com` or `.in`) directly through the Bhulia Registrar API. We will handle dynamic SSL certificates and route traffic to your storefront page automatically.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center flex-1 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-3 py-2">
                      <input 
                        type="text" 
                        placeholder="nandalalhandloom" 
                        value={domainSearchInput}
                        onChange={(e) => {
                          setDomainSearchInput(e.target.value);
                          setSearchResult(null);
                        }}
                        className="bg-transparent border-0 outline-none text-xs text-white flex-1 font-mono placeholder-gray-600 pl-0.5 ml-0.5"
                      />
                      <select 
                        value={domainSearchTld} 
                        onChange={(e) => {
                          setDomainSearchTld(e.target.value);
                          setSearchResult(null);
                        }}
                        className="bg-[#0A3A35] border-0 text-[#C5A059] text-xs font-mono font-bold outline-none cursor-pointer rounded px-1.5 py-0.5 ml-2"
                      >
                        <option value=".com">.com</option>
                        <option value=".in">.in</option>
                        <option value=".co.in">.co.in</option>
                        <option value=".org">.org</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleSearchDomain}
                      disabled={isSearching}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] text-xs font-bold hover:brightness-110 transition-all uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      {isSearching ? "Searching API..." : "Search Domain"}
                    </button>
                  </div>

                  {isSearching && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono animate-pulse">
                      <span className="w-3 h-3 rounded-full border border-gray-400 border-t-transparent animate-spin"></span>
                      <span>Querying WHOIS global DNS database registry...</span>
                    </div>
                  )}

                  {searchResult && searchResult.available && (
                    <div className="bg-[#051815] border border-[#C5A059]/40 rounded-xl p-4 space-y-3 animate-fadeIn text-xs">
                      <div className="flex justify-between items-center text-green-400 font-semibold border-b border-[#C5A059]/20 pb-2">
                        <span>🎉 Domain "{searchResult.domain}" is AVAILABLE!</span>
                        <span className="bg-[#C5A059]/20 border border-green-500/50 px-2 py-0.5 rounded text-[10px] tracking-widest text-[#C5A059]">READY</span>
                      </div>
                      
                      <div className="space-y-1.5 text-gray-300 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span>Domain Registration Fee ({domainSearchTld}):</span>
                          <span className="text-white">₹{searchResult.price} / year</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bhulia Cloud SSL & Routing:</span>
                          <span className="text-white">₹{searchResult.platformFee} / year</span>
                        </div>
                        <div className="flex justify-between border-t border-[#C5A059]/10 pt-1.5 font-bold text-xs">
                          <span className="text-[#C5A059]">Total First Year Cost:</span>
                          <span className="text-white">₹{searchResult.price + searchResult.platformFee}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <input type="checkbox" id="auth_dns" defaultChecked className="rounded border-[#C5A059]/30 bg-[#0A3A35] accent-[#C5A059]" />
                        <label htmlFor="auth_dns" className="text-[10px] text-gray-300 cursor-pointer select-none">
                          Authorize Bhulia.com to configure automatic cloud DNS, free SSL certificates, and nameservers.
                        </label>
                      </div>

                      <button 
                        onClick={() => handleSaveDomainSettings("custom", searchResult.domain)}
                        className="w-full bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Book & Bind Domain Setup (₹{searchResult.price + searchResult.platformFee})
                      </button>
                    </div>
                  )}

                  {searchResult && !searchResult.available && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 font-medium animate-fadeIn">
                      ❌ Sorry, "{searchResult.domain}" is already registered. Try searching for a different name.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Affiliate Tracking alert note */}
            <div className="bg-[#051815]/80 border border-[#C5A059]/20 rounded-xl p-3 text-[10px] sm:text-xs text-gray-300 flex items-start gap-2.5">
              <span>💡</span>
              <p className="leading-relaxed">
                <strong>Viral Commission Note:</strong> Any shared affiliate links will automatically adapt to your chosen branding. For example, share links like <code className="text-[#C5A059] font-bold font-mono">https://{activeCustomUrl || `bhulia.com/weaver/${artisan.slug}`}?ref=USER_ID</code> will still capture tracking and calculate payouts accurately.
              </p>
            </div>
          </div>
        )}

        {/* Saree Catalog Header */}
        <div id="catalog" className="space-y-4 pt-6 border-t border-[#C5A059]/20">
          <h3 className="text-xl md:text-3xl font-serif text-[#C5A059] font-bold tracking-wider">Current Available Masterpieces</h3>
          <p className="text-[10px] md:text-xs text-gray-300 uppercase tracking-widest font-semibold">Reserve handloom pieces directly from this artisan cluster - escrow protection activated</p>

          {/* Saree Catalog Grid */}
          <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${gridStyle === "2-Column" ? "lg:grid-cols-2 xl:grid-cols-2" : "lg:grid-cols-3 xl:grid-cols-3"}`}>
            {productsLoading ? (
               [...Array(3)].map((_, i) => (
                 <div key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 rounded-2xl h-[420px] animate-pulse"></div>
               ))
            ) : displayProducts.map((saree) => (
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
                      const shareUrl = `${window.location.origin}/product/${saree.slug}?ref=${userUid}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this " + saree.title + ": " + shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📲 Share</span>
                    </button>
                    <button onClick={() => {
                      const shareUrl = `${window.location.origin}/product/${saree.slug}?ref=${userUid}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                    }} className="flex items-center justify-center gap-1 py-1.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                      <span>📘 Share</span>
                    </button>
                  </div>

                  <Link href={`/product/${saree.slug}`} className="bhulia-gold-button w-full py-2 text-[#0A1021] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all text-center block">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}

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
