"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Structure for Artisan Listing
interface ArtisanListing {
  id: string;
  name: string;
  cluster: string;
  village: string;
  category: string;
  entityType: "PWCS" | "Independent" | "Unverified";
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
  };
}

// Master Artisan Database (Matching Directory) with Renowned Weavers Biodata
const MASTER_ARTISANS: ArtisanListing[] = [
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
    biodata: {
      artisanTitle: "Padmashree Awardee & Master Weaver Lineage",
      legacyEst: "Est. 1956 / Legacy of Late Kunja Bihari Meher",
      awardHighlights: ["🏆 Padmashree (1998)", "🏆 National Merit Award (1984)", "🏆 Sant Kabir Handloom Icon"],
      masterpieceMotifs: ["✨ Calligraphy Script Ikat", "✨ Matha Pasapalli Matrix", "✨ Phoda Kumbha Temple"],
      detailedBiography: "Founded upon the legendary design principles of Padmashree Kunja Bihari Meher, this premier cooperative society operates 142 active pit looms across Barpali. The master weavers here are renowned for pioneering the integration of calligraphy and intricate portraiture directly into the tie-and-dye Ikat matrix.\n\nEvery saree undergoes a rigorous 18-stage preparation process, from boiling handspun cotton yarn in natural organic mordants to aligning micro-millimeter Bandha knots on specialized graph paper. This collective remains the absolute sovereign guardian of Bargarh's textile heritage.",
    },
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
    biodata: {
      artisanTitle: "National Awardee & Vegetable Dye Pioneer",
      legacyEst: "Est. 1972 / Bhagabata Meher Family Loom",
      awardHighlights: ["🏆 National Award for Excellence (1992)", "🏆 State Handloom Champion (2004)", "🏆 UNESCO Craft Seal"],
      masterpieceMotifs: ["✨ Pomegranate Peta Motif", "✨ Madder Root Crimson Ikat", "✨ Mathematical Double Bandha"],
      detailedBiography: "Operating from the historic weaving hamlet of Bijepur, the Bhagabata Meher workshop is internationally celebrated for its uncompromising dedication to 100% natural vegetable dyes. Foraging wild madder roots, native indigo, and pomegranate rinds, the family formulates organic colors that deepen in luster over decades.\n\nTheir signature double-ikat sarees exhibit flawless mathematical symmetry, where both warp and weft are tied and dyed with absolute precision before mounting on the pit loom. Each piece is a living testament to sustainable, chemical-free luxury.",
    },
  },
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
    biodata: {
      artisanTitle: "Master of Extra-Weft Bomkai & Royal Patronage",
      legacyEst: "Est. 1948 / Subarnapur Royal Guild",
      awardHighlights: ["🏆 President's Gold Medal (1978)", "🏆 Silk Mark Championship (2015)", "🏆 Master Guild Trophy"],
      masterpieceMotifs: ["✨ Machha (Fish) Wealth Motif", "✨ Padmapakhuda (Lotus Petal)", "✨ Traditional Jala Zari Border"],
      detailedBiography: "Rooted in the royal weaving traditions of Subarnapur, this collective specializes in heavy 3-ply Mulberry silk Bomkai sarees. Using the ancient 'Jala' wooden frame attachment, master weavers manually lift individual silk threads to interlace intricate extra-weft motifs of fish, peacocks, and temple spires across the pallu.\n\nTheir creations have historically adorned royalty and temple deities, representing the highest echelon of ceremonial silk craftsmanship in India. Every saree carries an absolute guarantee of purity via Silk Mark Gold certification.",
    },
  },
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
    biodata: {
      artisanTitle: "Central District Master Weavers Syndicate",
      legacyEst: "Est. 1965 / Apex District Union",
      awardHighlights: ["🏆 State Welfare Excellence (1988)", "🏆 Fair Trade Handloom Shield", "🏆 Jan Dhan D2C Pioneer"],
      masterpieceMotifs: ["✨ Shankha (Conch) Motif", "✨ Chakra (Wheel) Matrix", "✨ Traditional Angavastram Border"],
      detailedBiography: "As the central union for Sambalpur District, this collective empowers over 110 hereditary weaving families. They focus on preserving the authentic daily-luxury drape of Sambalpuri cotton, utilizing high-twist handspun yarn that offers exceptional breathability and comfort.\n\nBy fully integrating with the Jan Dhan Direct Escrow gateway, the union has successfully eliminated exploitative middlemen, ensuring that 100% of the premium value flows directly into the artisan's household bank account.",
    },
  },
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
    biodata: {
      artisanTitle: "Pioneers of Organic Dye & Herbal Handlooms",
      legacyEst: "Est. 1980 / Boudh Herbal Loom Project",
      awardHighlights: ["🏆 National Eco-Weave Trophy (2012)", "🏆 Organic Handloom Seal", "🏆 Sant Kabir Merit Shield"],
      masterpieceMotifs: ["✨ Indigo Tribal Matrix", "✨ Harida Peta Border", "✨ Madder Red Kumbha"],
      detailedBiography: "The Boudh Collective stands at the forefront of the global sustainable fashion movement. Situated along the Mahanadi river basin, the weavers forage seasonal barks, flowers, and roots to prepare 100% chemical-free dye baths. Their sarees are renowned for being entirely hypoallergenic and soothing to the skin.\n\nTheir master graph designers plot complex Ikat patterns that reflect the pristine natural biodiversity of the Boudh forest tracts, offering an unmatched organic luxury experience.",
    },
  },
  {
    id: "ART-008",
    name: "Kalahandi Habaspuri Master Weaver Syndicate",
    cluster: "Kalahandi Cluster",
    village: "Habaspur / Bhawanipatna",
    category: "kalahandi-nuapada",
    entityType: "Independent",
    loomCount: 38,
    giTagNumber: "GI-Cert: #OD-9941-KL",
    specialtyTags: ["Habaspuri Cotton", "Kumbha Temple Border", "Traditional Chapa Work"],
    seoDescription: "Renowned syndicate preserving the legendary Habaspuri handloom technique of Kalahandi. Known for traditional Chapa extra-weft work, fish motifs, and highly breathable mercerized cotton.",
    img: "/bhulia-hero.png",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Guardians of the Ancient Habaspuri Weave",
      legacyEst: "Est. 1952 / Habaspur Heritage Guild",
      awardHighlights: ["🏆 National Habaspuri Revival Award (2008)", "🏆 State Tribal Craft Trophy", "🏆 GI-Tag Preservation Shield"],
      masterpieceMotifs: ["✨ Chapa Extra-Weft Fish", "✨ Habaspuri Temple Spire", "✨ Tribal Tortoise Matrix"],
      detailedBiography: "Originating from the historic village of Habaspur in Kalahandi, this master syndicate is dedicated to saving the critically endangered Habaspuri weaving technique. Unlike standard Ikat, Habaspuri relies on intricate 'Chapa' extra-weft patterning, where master weavers manually insert specialized cotton tufts to create raised, three-dimensional motifs of fish, flowers, and tortoises across the borders.\n\nWeaving a single Habaspuri masterpiece requires over 25 days of intense focus on the traditional pit loom. This collective ensures the survival of Kalahandi's most prized cultural treasure.",
    },
  },
  {
    id: "ART-016",
    name: "Nuapada Khariar Bandha & Ikat Collective",
    cluster: "Nuapada Cluster",
    village: "Khariar, Nuapada",
    category: "kalahandi-nuapada",
    entityType: "Unverified",
    loomCount: 24,
    giTagNumber: "GI-Pending Registry",
    specialtyTags: ["Khariar Cotton Ikat", "Tribal Geometry", "Grassroots Loom"],
    seoDescription: "Grassroots collaborative of pit loom weavers in Khariar, Nuapada. Crafting heavy-count cotton Ikat sarees featuring striking tribal geometric patterns and earthy organic tones.",
    img: "/bhulia-hero.png",
    isClaimed: false,
    claimStatus: "unverified",
    biodata: {
      artisanTitle: "Grassroots Tribal Ikat & Bandha Masters",
      legacyEst: "Est. 1985 / Khariar Pit Loom Association",
      awardHighlights: ["🏆 Regional Tribal Weave Commendation", "🏆 Grassroots Loom Shield", "🏆 D2C Empowerment Seal"],
      masterpieceMotifs: ["✨ Khariar Geometric Matrix", "✨ Earthy Red & Ochre Bandha", "✨ Heavy Count Cotton Drape"],
      detailedBiography: "Operating from the remote, scenic highlands of Khariar in Nuapada district, this grassroots collaborative represents 24 dedicated pit loom artisan families. They specialize in weaving heavy-count cotton Ikat sarees designed for exceptional durability and thermal comfort in highland climates.\n\nTheir designs draw direct inspiration from indigenous tribal geometry and local folklore, utilizing earthy ochres, deep terracottas, and forest greens. By onboarding onto Bhulia Hub, they are establishing their very first direct digital bridge to global handloom connoisseurs.",
    },
  }
];

// Fallback Default Artisan if ID doesn't match exactly
const DEFAULT_ARTISAN: ArtisanListing = {
  id: "ART-999",
  name: "Odisha Heritage Master Weaver Syndicate",
  cluster: "Odisha Handloom Belt",
  village: "Handloom Cluster, Odisha",
  category: "heritage",
  entityType: "Independent",
  loomCount: 35,
  giTagNumber: "GI-Cert: #OD-5541-HB",
  specialtyTags: ["Traditional Ikat", "Handspun Yarn", "Jan Dhan Escrow"],
  seoDescription: "Sovereign collective of traditional pit loom weavers preserving the intricate tie-and-dye Ikat heritage of Odisha. Offering direct D2C escrow settlement.",
  img: "/bhulia-hero.png",
  isClaimed: true,
  claimStatus: "verified",
  biodata: {
    artisanTitle: "Sovereign Master Weaver Heritage Guild",
    legacyEst: "Est. 1945 / Odisha Handloom Syndicate",
    awardHighlights: ["🏆 National Handloom Heritage Trophy", "🏆 Padmashree Lineage Seal", "🏆 100% Jan Dhan Escrow Verified"],
    masterpieceMotifs: ["✨ Traditional Pasapalli Matrix", "✨ Extra-Weft Bomkai Zari", "✨ Phoda Kumbha Temple Spire"],
    detailedBiography: "This sovereign syndicate unites elite hereditary weaving families across the seven official Sambalpuri GI districts. Operating traditional pit looms passed down through generations, these artisans represent the absolute pinnacle of Indian textile graph design and mathematical tie-and-dye Ikat execution.\n\nEvery thread is spun, tied, boiled in natural mordants, and woven with uncompromising dedication to quality, ensuring that every saree is an heirloom masterpiece designed to last for generations.",
  },
};

// Sample Sarees Catalog for the Storefront
const SAREE_CATALOG = [
  { id: "SAR-101", title: "Royal Pasapalli Mercerized Cotton Ikat", price: "₹ 12,500", mrp: "₹ 18,000", weave: "Double Ikat", time: "18 Days Weaving", rating: "4.9", img: "/bhulia-hero.png", inStock: true },
  { id: "SAR-102", title: "Subarnapur Extra-Weft Mulberry Silk Bomkai", price: "₹ 24,800", mrp: "₹ 32,000", weave: "Bomkai Extra-Weft", time: "25 Days Weaving", rating: "5.0", img: "/bhulia-hero.png", inStock: true },
  { id: "SAR-103", title: "Traditional Phoda Kumbha Border Cotton Saree", price: "₹ 8,900", mrp: "₹ 12,500", weave: "Single Ikat", time: "12 Days Weaving", rating: "4.8", img: "/bhulia-hero.png", inStock: true },
  { id: "SAR-104", title: "Sachipar Heavy Check Pattern Silk Masterpiece", price: "₹ 28,500", mrp: "₹ 38,000", weave: "Complex Matrix", time: "30 Days Weaving", rating: "5.0", img: "/bhulia-hero.png", inStock: true },
  { id: "SAR-105", title: "Barpali Calligraphy Script Silk Dupatta", price: "₹ 14,200", mrp: "₹ 19,000", weave: "Script Ikat", time: "15 Days Weaving", rating: "4.9", img: "/bhulia-hero.png", inStock: true },
  { id: "SAR-106", title: "Boudh Madder Root Organic Dye Cotton Saree", price: "₹ 11,400", mrp: "₹ 16,000", weave: "Natural Dye Ikat", time: "20 Days Weaving", rating: "4.7", img: "/bhulia-hero.png", inStock: true },
];

export default function ArtisanStorePage() {
  const params = useParams();
  const rawId = typeof params?.artisanId === "string" ? params.artisanId : "ART-001";
  const artisanId = rawId.toUpperCase();

  // Find Artisan
  const foundArtisan = MASTER_ARTISANS.find((a) => a.id === artisanId) || {
    ...DEFAULT_ARTISAN,
    id: artisanId,
    name: `Master Weaver Store (${artisanId})`,
  };

  const [artisan, setArtisan] = useState<ArtisanListing>(foundArtisan);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Checkout Modal State
  const [selectedSaree, setSelectedSaree] = useState<typeof SAREE_CATALOG[0] | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    pincode: "",
    paymentMode: "escrow",
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);

  useEffect(() => {
    const uid = localStorage.getItem("sd_current_user_uid") || "sd_super_admin_custom_uid";
    setUserUid(uid);

    // Check if claimed in localStorage
    const savedClaims = localStorage.getItem("sd_bhulia_claimed_artisans");
    if (savedClaims) {
      try {
        const claimedIds: string[] = JSON.parse(savedClaims);
        if (claimedIds.includes(artisan.id)) {
          setArtisan(prev => ({ ...prev, isClaimed: true, claimStatus: "pending", giTagNumber: "GI-Verification Pending" }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [artisan.id]);

  // Social Share Handler
  const handleSocialShare = (platform: "whatsapp" | "facebook") => {
    const shareUrl = `${window.location.origin}/artisan/${artisan.id.toLowerCase()}?ref=${userUid}`;
    const message = `Explore the sovereign handloom store for ${artisan.name}. Buy authentic GI-Tagged Sambalpuri sarees directly from the artisan's pit loom on Bhulia Hub! ${shareUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOrder(true);
    setTimeout(() => {
      setIsProcessingOrder(false);
      setCheckoutStep(2); // Success Step
    }, 2000);
  };

  const resetCheckout = () => {
    setSelectedSaree(null);
    setCheckoutStep(1);
    setCheckoutForm({ fullName: "", mobile: "", address: "", pincode: "", paymentMode: "escrow" });
  };

  return (
    <main className="relative flex-1 w-full bg-gradient-to-b from-[#0B2B26] via-[#0D3630] to-[#0A2520] text-white font-sans flex flex-col min-h-screen overflow-x-hidden">
      
      {/* Background Gold Glows */}
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

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Link href="/directory" className="px-5 py-2.5 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shadow">
            ← Back to Directory
          </Link>

          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-10 h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
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
      <div className="flex-1 container mx-auto px-6 py-8 relative z-10 space-y-12">
        
        {/* 1. Artisan Hero Storefront Banner */}
        <div className="bg-gradient-to-br from-[#0A3A35] via-[#0D3630] to-[#0B2B26] border-2 border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest font-mono">
                {artisan.id}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0B2B26] border border-[#C5A059]/30 text-gray-200 text-xs font-bold uppercase tracking-widest">
                📍 {artisan.cluster}
              </span>
              {artisan.entityType === "PWCS" && (
                <span className="bg-[#C5A059] text-[#0A1021] px-3 py-1 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.6)] flex items-center gap-1">
                  🛡️ Verified PWCS
                </span>
              )}
              {artisan.entityType === "Independent" && (
                <span className="bg-slate-200 text-slate-900 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-widest shadow flex items-center gap-1">
                  🌱 Independent Master
                </span>
              )}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              {artisan.name}
            </h2>

            <p className="text-sm md:text-base text-gray-200 leading-relaxed font-sans max-w-2xl">
              {artisan.seoDescription}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {artisan.specialtyTags.map((tag, idx) => (
                <span key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 text-[#C5A059] text-xs px-3 py-1 rounded-lg font-sans font-medium shadow-inner">
                  #{tag}
                </span>
              ))}
            </div>

            {/* GI-Tag & Escrow Status Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono border-t border-[#C5A059]/20">
              <div className="bg-[#0B2B26] px-4 py-2 rounded-xl border border-[#C5A059]/30 flex items-center gap-2 shadow">
                <span className="text-gray-400">GI Registry:</span>
                <span className="text-[#C5A059] font-bold">{artisan.giTagNumber}</span>
              </div>
              <div className="bg-[#0B2B26] px-4 py-2 rounded-xl border border-[#C5A059]/30 flex items-center gap-2 shadow">
                <span className="text-gray-400">Active Capacity:</span>
                <span className="text-white font-bold">🧵 {artisan.loomCount} Traditional Pit Looms</span>
              </div>
              <div className="bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30 flex items-center gap-2 shadow text-green-400 font-bold tracking-wider uppercase">
                <span>✅ 100% Jan Dhan Direct Escrow Active</span>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Preview / Share Box */}
          <div className="relative z-10 shrink-0 w-full md:w-80 space-y-4 bg-[#0B2B26]/80 p-6 rounded-2xl border border-[#C5A059]/40 backdrop-blur-md shadow-2xl">
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#C5A059]/30 shadow-inner bg-[#051815]">
              <Image src={artisan.img} alt={artisan.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B26] via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[10px] font-mono text-[#C5A059] bg-[#0B2B26]/90 px-3 py-1 rounded-full border border-[#C5A059]/40 font-bold block uppercase tracking-widest">
                  📍 {artisan.village}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white block text-center uppercase tracking-widest">Promote Artisan & Earn Affiliate</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow">
                  <span>📲 WhatsApp</span>
                </button>
                <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1.5 py-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#1877F2] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow">
                  <span>📘 Facebook</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center font-mono pt-1 truncate">Ref Tag: ?ref={userUid}</p>
            </div>
          </div>
        </div>

        {/* 1.5. Renowned Master Weaver Biodata & Heritage Lineage */}
        {artisan.biodata && (
          <div className="bg-[#0A3A35]/80 border border-[#C5A059]/40 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl space-y-6 backdrop-blur-md animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#C5A059]/20 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#C5A059] font-bold uppercase tracking-widest block">📜 Verified Heritage Lineage & Biodata</span>
                <h3 className="text-2xl md:text-3xl font-serif text-white font-bold">{artisan.biodata.artisanTitle}</h3>
              </div>
              <div className="bg-[#0B2B26] px-5 py-2.5 rounded-xl border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold shadow">
                🏛️ {artisan.biodata.legacyEst}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">🏆 National Awards & Accolades</h4>
                <div className="space-y-2.5">
                  {artisan.biodata.awardHighlights.map((award, i) => (
                    <div key={i} className="bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/20 flex items-center gap-3 shadow-inner text-xs font-medium text-gray-200">
                      <span className="text-[#C5A059] text-base">🎖️</span>
                      <span>{award}</span>
                    </div>
                  ))}
                </div>

                <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono pt-2">✨ Signature Masterpiece Motifs</h4>
                <div className="flex flex-wrap gap-2">
                  {artisan.biodata.masterpieceMotifs.map((motif, i) => (
                    <span key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 text-white text-xs px-3.5 py-1.5 rounded-xl font-sans font-medium shadow">
                      ✦ {motif}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-[#0B2B26]/60 p-6 rounded-2xl border border-[#C5A059]/20 flex flex-col justify-between shadow-inner">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">📖 Historical Artisan Biography</h4>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-line">
                    {artisan.biodata.detailedBiography}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#C5A059]/20 flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <span>Verified by Handloom Census</span>
                  <span className="text-green-400 font-bold">✓ 100% D2C Jan Dhan Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Sovereign Saree Catalog Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#C5A059]/20 pb-4">
            <div>
              <h3 className="text-2xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Authentic Saree Catalog & Masterpieces</h3>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Handwoven on traditional pit looms in {artisan.village}. Backed by Jan Dhan escrow settlement.</p>
            </div>
            <div className="bg-[#0A3A35] px-4 py-2 rounded-xl border border-[#C5A059]/30 text-xs font-mono text-[#C5A059] font-bold">
              📜 Silk Mark & Handloom Mark Certified
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SAREE_CATALOG.map((saree) => (
              <div key={saree.id} className="bg-[#0A3A35]/80 border border-[#C5A059]/30 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#C5A059] transition-all duration-300 shadow-xl">
                
                {/* Saree Image & Badges */}
                <div className="relative w-full h-64 overflow-hidden bg-[#0B2B26]">
                  <Image src={saree.img} alt={saree.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B26] via-[#0B2B26]/30 to-transparent"></div>
                  
                  <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
                    <span className="bg-[#C5A059] text-[#0A1021] px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.6)]">
                      {saree.weave}
                    </span>
                    <span className="bg-[#0B2B26]/90 backdrop-blur-md text-gray-200 border border-[#C5A059]/40 px-2.5 py-1 rounded-md font-bold text-[10px]">
                      ⏳ {saree.time}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-between items-end">
                    <span className="text-xs font-mono text-[#C5A059] bg-[#0B2B26]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#C5A059]/40 font-bold">
                      {saree.id}
                    </span>
                    <span className="text-xs text-amber-400 font-bold bg-[#0B2B26]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#C5A059]/20 flex items-center gap-1">
                      ★ {saree.rating} Master Weave
                    </span>
                  </div>
                </div>

                {/* Saree Details & Pricing */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-white text-lg group-hover:text-[#C5A059] transition-colors leading-tight">
                      {saree.title}
                    </h4>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      Handspun, high-density traditional weave featuring flawless mathematical symmetry and intricate extra-weft temple borders.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#C5A059]/20">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-2xl font-serif font-bold text-[#C5A059]">{saree.price}</span>
                        <span className="text-xs text-gray-400 line-through ml-2 font-mono">{saree.mrp}</span>
                      </div>
                      <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        In Stock (Direct Loom)
                      </span>
                    </div>

                    <button 
                      onClick={() => setSelectedSaree(saree)}
                      className="w-full py-3.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(197,160,89,0.4)] flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      <span>🛍️ Instant Direct Checkout (Jan Dhan Escrow)</span>
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 3. Artisan Heritage & Quality Assurance Section */}
        <div className="bg-[#0A3A35]/60 border border-[#C5A059]/40 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl space-y-8 backdrop-blur-md">
          <div className="max-w-3xl space-y-3">
            <h3 className="text-2xl font-serif text-[#C5A059] font-bold tracking-wider">Preserving an 800-Year-Old Ikat Legacy</h3>
            <p className="text-sm text-gray-200 leading-relaxed font-sans">
              Every saree listed in this sovereign store represents weeks of intensive manual labor. From foraging natural vegetable dyes (madder roots, pomegranate peel, native indigo) to plotting complex mathematical Ikat matrices onto graph paper, our master artisans uphold the absolute pinnacle of Odisha handloom heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#C5A059]/20 text-center sm:text-left">
            <div className="space-y-2">
              <span className="text-xl font-serif font-bold text-[#C5A059] block">100% Handspun Yarn</span>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">Finest mercerized cotton and 3-ply Mulberry silk ensuring lifelong durability and luxurious drape.</p>
            </div>
            <div className="space-y-2">
              <span className="text-xl font-serif font-bold text-[#C5A059] block">Zero Chemical Dyes</span>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">Traditional organic dye formulations that are completely skin-friendly and retain vibrant luster for decades.</p>
            </div>
            <div className="space-y-2">
              <span className="text-xl font-serif font-bold text-[#C5A059] block">Direct D2C Settlement</span>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">Your payment is held in a secure Jan Dhan escrow account and released directly to the weaver upon successful delivery.</p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Instant Direct Checkout Glassmorphism Modal */}
      {selectedSaree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051815]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0A3A35] via-[#0D3630] to-[#0B2B26] border-2 border-[#C5A059] rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.4)] relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#C5A059]/30 flex justify-between items-center bg-[#0B2B26]/50">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] font-bold uppercase tracking-widest block mb-1">
                  🔒 Sovereign Jan Dhan Escrow Gateway
                </span>
                <h3 className="text-xl font-serif font-bold text-white leading-tight">
                  Direct Checkout: {selectedSaree.title}
                </h3>
              </div>
              <button onClick={resetCheckout} className="w-8 h-8 rounded-full bg-[#0B2B26] border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] transition-all flex items-center justify-center font-bold cursor-pointer">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePlaceOrder} className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-[#C5A059]/40 scrollbar-track-transparent font-sans">
              
              {checkoutStep === 1 ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Order Summary Box */}
                  <div className="bg-[#0B2B26] p-4 rounded-2xl border border-[#C5A059]/30 flex items-center justify-between gap-4 shadow-inner">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400 font-mono block">Selected Masterpiece</span>
                      <h5 className="text-sm font-serif font-bold text-white">{selectedSaree.title}</h5>
                      <span className="text-[10px] text-[#C5A059] font-mono block">Weaver: {artisan.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-serif font-bold text-[#C5A059] block">{selectedSaree.price}</span>
                      <span className="text-[10px] text-green-400 font-mono block uppercase">Free Insured Shipping</span>
                    </div>
                  </div>

                  {/* Shipping Address Form */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">1. Delivery Address & Contact</h4>
                    
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs text-gray-300 font-bold mb-1">Full Name (Receiver)</label>
                        <input 
                          type="text" 
                          required
                          value={checkoutForm.fullName}
                          onChange={(e) => setCheckoutForm({...checkoutForm, fullName: e.target.value})}
                          placeholder="e.g. Priya Sharma"
                          className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-300 font-bold mb-1">Mobile Number (For Delivery Updates)</label>
                          <input 
                            type="tel" 
                            required
                            value={checkoutForm.mobile}
                            onChange={(e) => setCheckoutForm({...checkoutForm, mobile: e.target.value})}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 font-bold mb-1">Pincode (Pan-India Insured)</label>
                          <input 
                            type="text" 
                            required
                            value={checkoutForm.pincode}
                            onChange={(e) => setCheckoutForm({...checkoutForm, pincode: e.target.value})}
                            placeholder="e.g. 751001"
                            className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 font-bold mb-1">Complete Delivery Address</label>
                        <textarea 
                          rows={3}
                          required
                          value={checkoutForm.address}
                          onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                          placeholder="e.g. Flat 402, Sunshine Apartments, MG Road, near Metro Station..."
                          className="w-full px-4 py-3 bg-[#0B2B26] border border-[#C5A059]/50 focus:border-[#C5A059] rounded-xl text-white text-xs focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">2. Sovereign Settlement Mode</h4>
                    <div className="bg-[#0B2B26] p-4 rounded-xl border border-[#C5A059] flex items-start gap-3 shadow-md">
                      <input type="radio" defaultChecked name="payment" className="mt-1 accent-[#C5A059]" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">100% Jan Dhan Direct Escrow Settlement</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          Your payment is held securely in an RBI-regulated escrow vault. The funds are transferred directly into the master weaver&apos;s verified Jan Dhan bank account only after you receive and verify the authentic GI-Tagged saree.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isProcessingOrder}
                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isProcessingOrder 
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 cursor-wait"
                        : "bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] hover:brightness-110 shadow-[0_0_25px_rgba(197,160,89,0.4)]"
                    }`}
                  >
                    {isProcessingOrder ? (
                      <>
                        <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Securing Escrow Allocation & Dispatching Handshake...</span>
                      </>
                    ) : (
                      <>
                        <span>🔒 Confirm Order & Lock Escrow ({selectedSaree.price})</span>
                      </>
                    )}
                  </button>

                </div>
              ) : (
                <div className="py-12 text-center space-y-6 animate-fadeIn">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 text-green-400 flex items-center justify-center text-4xl mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce">
                    ✓
                  </div>
                  
                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-2xl font-serif font-bold text-white leading-tight">Sovereign Jan Dhan Escrow Locked Successfully!</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      Thank you for empowering grassroots handloom heritage. Your order for <strong className="text-white">{selectedSaree?.title}</strong> has been transmitted directly to <strong className="text-[#C5A059]">{artisan.name}</strong>.
                    </p>
                  </div>

                  <div className="bg-[#0B2B26] p-6 rounded-2xl border border-[#C5A059]/30 text-left space-y-3 font-mono text-xs max-w-md mx-auto shadow-inner">
                    <div className="flex justify-between border-b border-[#C5A059]/20 pb-2">
                      <span className="text-gray-400">Escrow Transaction ID:</span>
                      <span className="text-[#C5A059] font-bold">ESC-OD-{Math.floor(Math.random() * 800000 + 100000)}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#C5A059]/20 pb-2">
                      <span className="text-gray-400">GI-Tag Registry Verification:</span>
                      <span className="text-green-400 font-bold">PASSED ({artisan.giTagNumber})</span>
                    </div>
                    <div className="flex justify-between border-b border-[#C5A059]/20 pb-2">
                      <span className="text-gray-400">Armored Transit Partner:</span>
                      <span className="text-white font-bold">Sequel Secure Logistics</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-400">Estimated Delivery:</span>
                      <span className="text-[#C5A059] font-bold">4-6 Business Days</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={resetCheckout}
                    className="px-8 py-3.5 bg-[#0B2B26] border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow cursor-pointer inline-block"
                  >
                    ← Continue Browsing Artisan Store
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </main>
  );
}
