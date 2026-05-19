"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Structure for Artisan Listing with Slug
interface ArtisanListing {
  id: string;
  slug: string;
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
    shortStory?: string;
  };
}

// Master Artisan Database (with Vanity Slugs & Nandalal Meher)
const MASTER_ARTISANS: ArtisanListing[] = [
  {
    id: "ART-101",
    slug: "nandalal-meher",
    name: "Master Weaver Nandalal Meher | Authentic Sonepur Ikat",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    category: "sonepur",
    entityType: "Independent",
    loomCount: 14,
    giTagNumber: "GI-Cert: #OD-4491-SP",
    specialtyTags: ["Double Ikat Pata", "Single Ikat", "Premium Silk", "Traditional Motifs"],
    seoDescription: "Exquisite, handcrafted single and double ikat silk sarees straight from the looms of Dasrajpur. Preserving the rare mathematical alignment of authentic Odishan Pata.",
    img: "/nandalal_meher.jpg",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Award-Winning Master Weaver",
      legacyEst: "Est. 1982 / Dasrajpur Ikat Heritage Loom",
      shortStory: "Every thread tells a story. Based in Sonepur, Odisha, Award-winning artisan Nandalal Meher spends months meticulously tie-dying and weaving a single Pata saree. Own a piece of living heritage.",
      awardHighlights: [
        "🏆 Award for Handloom Excellence",
        "🏆 Sant Kabir Master Craft Seal",
        "🏆 State Champion of Double Ikat Weaving"
      ],
      masterpieceMotifs: [
        "✨ Traditional Temple Spire",
        "✨ Shankha (Conch Shell) Geometry",
        "✨ Machha (Fish) Wealth Motif",
        "✨ Flawless Mathematical Double Bandha"
      ],
      detailedBiography: "Nandalal Meher is a visionary master weaver from Dasrajpur in the Sonepur district of Odisha. He stands as a true guardian of India's rich textile heritage. Sonepur is globally renowned for its intricate handloom traditions. There, Meher has dedicated his life to perfecting the complex arts of single and double ikat weaving. His exceptional skill transforms fine silk threads into breathtaking masterpieces of wearable art.\n\nThe Craftsmanship: Single and Double Ikat Pata\nMeher’s expertise lies in creating high-class silk sarees, locally known as Pata. His work showcases an extraordinary level of precision and mathematical skill:\n• Single Ikat: Threads of either the warp or the weft are dyed before weaving to create stunning patterns.\n• Double Ikat: Both warp and weft threads are meticulously tie-dyed. They must align perfectly on the loom to form sharp, seamless designs.\n• Premium Silk: He uses only the finest quality silk, ensuring a luxurious drape and a brilliant, lasting sheen.\n• Traditional Motifs: His designs beautifully incorporate classic Odisha motifs, including temples, conch shells, and fish.\n\nLegacy and Impact\nNandalal Meher is more than just an artisan; he is a cultural ambassador for Sonepur handlooms. By maintaining the rigorous standards of authentic double ikat, he preserves a rare craft that few weavers can successfully execute today. His workshop in Dasrajpur serves as a hub of excellence, keeping the legacy of Odishan silk alive for future generations.",
    },
  },
  {
    id: "ART-001",
    slug: "maa-samaleswari-weavers",
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
      shortStory: "Founded upon the legendary design principles of Padmashree Kunja Bihari Meher, this premier cooperative society operates 142 active pit looms across Barpali.",
      awardHighlights: ["🏆 Padmashree (1998)", "🏆 National Merit Award (1984)", "🏆 Sant Kabir Handloom Icon"],
      masterpieceMotifs: ["✨ Calligraphy Script Ikat", "✨ Matha Pasapalli Matrix", "✨ Phoda Kumbha Temple"],
      detailedBiography: "Founded upon the legendary design principles of Padmashree Kunja Bihari Meher, this premier cooperative society operates 142 active pit looms across Barpali. The master weavers here are renowned for pioneering the integration of calligraphy and intricate portraiture directly into the tie-and-dye Ikat matrix.\n\nEvery saree undergoes a rigorous 18-stage preparation process, from boiling handspun cotton yarn in natural organic mordants to aligning micro-millimeter Bandha knots on specialized graph paper. This collective remains the absolute sovereign guardian of Bargarh's textile heritage.",
    },
  },
  {
    id: "ART-002",
    slug: "bhagabata-meher",
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
      shortStory: "Operating from the historic weaving hamlet of Bijepur, the Bhagabata Meher workshop is internationally celebrated for its uncompromising dedication to 100% natural vegetable dyes.",
      awardHighlights: ["🏆 National Award for Excellence (1992)", "🏆 State Handloom Champion (2004)", "🏆 UNESCO Craft Seal"],
      masterpieceMotifs: ["✨ Pomegranate Peta Motif", "✨ Madder Root Crimson Ikat", "✨ Mathematical Double Bandha"],
      detailedBiography: "Operating from the historic weaving hamlet of Bijepur, the Bhagabata Meher workshop is internationally celebrated for its uncompromising dedication to 100% natural vegetable dyes. Foraging wild madder roots, native indigo, and pomegranate rinds, the family formulates organic colors that deepen in luster over decades.\n\nTheir signature double-ikat sarees exhibit flawless mathematical symmetry, where both warp and weft are tied and dyed with absolute precision before mounting on the pit loom. Each piece is a living testament to sustainable, chemical-free luxury.",
    },
  },
  {
    id: "ART-006",
    slug: "sonepur-royal-silk",
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
      shortStory: "Rooted in the royal weaving traditions of Subarnapur, this collective specializes in heavy 3-ply Mulberry silk Bomkai sarees.",
      awardHighlights: ["🏆 President's Gold Medal (1978)", "🏆 Silk Mark Championship (2015)", "🏆 Master Guild Trophy"],
      masterpieceMotifs: ["✨ Machha (Fish) Wealth Motif", "✨ Padmapakhuda (Lotus Petal)", "✨ Traditional Jala Zari Border"],
      detailedBiography: "Rooted in the royal weaving traditions of Subarnapur, this collective specializes in heavy 3-ply Mulberry silk Bomkai sarees. Using the ancient 'Jala' wooden frame attachment, master weavers manually lift individual silk threads to interlace intricate extra-weft motifs of fish, peacocks, and temple spires across the pallu.\n\nTheir creations have historically adorned royalty and temple deities, representing the highest echelon of ceremonial silk craftsmanship in India. Every saree carries an absolute guarantee of purity via Silk Mark Gold certification.",
    },
  }
];

// Fallback Default Artisan
const DEFAULT_ARTISAN: ArtisanListing = {
  id: "ART-999",
  slug: "odisha-master-weavers",
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
    shortStory: "This sovereign syndicate unites elite hereditary weaving families across the seven official Sambalpuri GI districts.",
    awardHighlights: ["🏆 National Handloom Heritage Trophy", "🏆 Padmashree Lineage Seal", "🏆 100% Jan Dhan Escrow Verified"],
    masterpieceMotifs: ["✨ Traditional Pasapalli Matrix", "✨ Extra-Weft Bomkai Zari", "✨ Phoda Kumbha Temple Spire"],
    detailedBiography: "This sovereign syndicate unites elite hereditary weaving families across the seven official Sambalpuri GI districts. Operating traditional pit looms passed down through generations, these artisans represent the absolute pinnacle of Indian textile graph design and mathematical tie-and-dye Ikat execution.\n\nEvery thread is spun, tied, boiled in natural mordants, and woven with uncompromising dedication to quality, ensuring that every saree is an heirloom masterpiece designed to last for generations.",
  },
};

// Nandalal Meher Saree Catalog (Grouped by Blueprint Categories)
const NANDALAL_SAREES = [
  // Category 1: The Double Ikat Masterpieces
  { 
    id: "SAR-N101", 
    title: "Dasrajpur Royal Pasapalli Double Ikat Pata", 
    category: "The Double Ikat Masterpieces",
    desc: "Flawless mathematical alignment where both warp and weft silk threads are tie-dyed before mounting on the pit loom.",
    price: "₹ 34,500", 
    mrp: "₹ 42,000", 
    weave: "Double Ikat Pata", 
    time: "Handwoven over 45 days", 
    rating: "5.0", 
    img: "/nandalal_meher.jpg", 
    inStock: true,
    lightSheen: "Brilliant Crimson & Gold Sheen in Natural Light",
    badge: "Verified By Bhulia.com"
  },
  { 
    id: "SAR-N102", 
    title: "Sonepur Temple Spire & Conch Double Ikat Silk", 
    category: "The Double Ikat Masterpieces",
    desc: "Intricate temple borders and conch shell motifs tie-dyed with absolute micro-millimeter precision across the silk matrix.",
    price: "₹ 38,000", 
    mrp: "₹ 46,000", 
    weave: "Double Ikat Pata", 
    time: "Handwoven over 52 days", 
    rating: "5.0", 
    img: "/nandalal_meher.jpg", 
    inStock: true,
    lightSheen: "Deep Purple & Royal Gold Sheen in Natural Light",
    badge: "Verified By Bhulia.com"
  },

  // Category 2: Classic Single Ikat Pata
  { 
    id: "SAR-N103", 
    title: "Traditional Machha (Fish) Motif Single Ikat Pata", 
    category: "Classic Single Ikat Pata",
    desc: "Vibrant everyday luxury silk saree featuring classic Odishan fish wealth motifs along the rich pallu.",
    price: "₹ 18,500", 
    mrp: "₹ 24,000", 
    weave: "Single Ikat Pata", 
    time: "Handwoven over 22 days", 
    rating: "4.9", 
    img: "/nandalal_meher.jpg", 
    inStock: true,
    lightSheen: "Vibrant Emerald & Copper Sheen in Natural Light",
    badge: "Verified By Bhulia.com"
  },
  { 
    id: "SAR-N104", 
    title: "Dasrajpur Phoda Kumbha Border Silk Saree", 
    category: "Classic Single Ikat Pata",
    desc: "Elegant single ikat body paired with traditional Phoda Kumbha temple borders woven using 3-ply Mulberry silk.",
    price: "₹ 16,800", 
    mrp: "₹ 22,000", 
    weave: "Single Ikat Pata", 
    time: "Handwoven over 18 days", 
    rating: "4.8", 
    img: "/nandalal_meher.jpg", 
    inStock: true,
    lightSheen: "Lustrous Ruby & Zari Sheen in Natural Light",
    badge: "Verified By Bhulia.com"
  },

  // Category 3: Contemporary Fusion
  { 
    id: "SAR-N105", 
    title: "Midnight Blue & Rose Gold Fusion Ikat Pata", 
    category: "Contemporary Fusion",
    desc: "Modern color palettes merged with ancient Sonepur tie-and-dye geometry, designed for evening galas and ceremonial elegance.",
    price: "₹ 26,400", 
    mrp: "₹ 34,000", 
    weave: "Contemporary Fusion Ikat", 
    time: "Handwoven over 30 days", 
    rating: "4.9", 
    img: "/nandalal_meher.jpg", 
    inStock: true,
    lightSheen: "Midnight Sapphire & Rose Gold Sheen in Natural Light",
    badge: "Verified By Bhulia.com"
  },
  { 
    id: "SAR-N106", 
    title: "Pastel Mint & Antique Gold Ikat Masterpiece", 
    category: "Contemporary Fusion",
    desc: "Soft pastel silk warp interlaced with antique gold zari weft, offering a breathtaking contemporary drape.",
    price: "₹ 28,900", 
    mrp: "₹ 36,000", 
    weave: "Contemporary Fusion Ikat", 
    time: "Handwoven over 35 days", 
    rating: "5.0", 
    img: "/nandalal_meher.jpg", 
    inStock: true,
    lightSheen: "Mint Pearl & Antique Gold Sheen in Natural Light",
    badge: "Verified By Bhulia.com"
  }
];

// Standard Fallback Catalog
const STANDARD_SAREES = [
  { id: "SAR-101", title: "Royal Pasapalli Mercerized Cotton Ikat", category: "Classic Single Ikat Pata", desc: "Handspun, high-density traditional weave featuring flawless mathematical symmetry.", price: "₹ 12,500", mrp: "₹ 18,000", weave: "Double Ikat", time: "Handwoven over 18 days", rating: "4.9", img: "/bhulia-hero.png", inStock: true, lightSheen: "Rich Crimson Sheen in Natural Light", badge: "Verified By Bhulia.com" },
  { id: "SAR-102", title: "Subarnapur Extra-Weft Mulberry Silk Bomkai", category: "The Double Ikat Masterpieces", desc: "Heavy 3-ply Mulberry silk Bomkai sarees featuring rich extra-weft gold thread work.", price: "₹ 24,800", mrp: "₹ 32,000", weave: "Bomkai Extra-Weft", time: "Handwoven over 25 days", rating: "5.0", img: "/bhulia-hero.png", inStock: true, lightSheen: "Royal Gold Sheen in Natural Light", badge: "Verified By Bhulia.com" },
  { id: "SAR-103", title: "Traditional Phoda Kumbha Border Cotton Saree", category: "Classic Single Ikat Pata", desc: "High-twist handspun yarn offering exceptional breathability and comfort.", price: "₹ 8,900", mrp: "₹ 12,500", weave: "Single Ikat", time: "Handwoven over 12 days", rating: "4.8", img: "/bhulia-hero.png", inStock: true, lightSheen: "Earthy Ochre Sheen in Natural Light", badge: "Verified By Bhulia.com" },
];

export default function WeaverStorePage() {
  const params = useParams();
  const rawSlug = typeof params?.weaverSlug === "string" ? params.weaverSlug : "nandalal-meher";
  const weaverSlug = rawSlug.toLowerCase();

  // Find Artisan by Slug or ID
  const foundArtisan = MASTER_ARTISANS.find((a) => a.slug === weaverSlug || a.id.toLowerCase() === weaverSlug) || {
    ...DEFAULT_ARTISAN,
    id: weaverSlug.toUpperCase(),
    slug: weaverSlug,
    name: `Master Weaver Store (${weaverSlug.replace(/-/g, " ")})`,
  };

  const [artisan, setArtisan] = useState<ArtisanListing>(foundArtisan);
  const [userUid, setUserUid] = useState<string>("sd_super_admin_custom_uid");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");

  // Determine Catalog
  const isNandalal = artisan.slug === "nandalal-meher";
  const currentCatalog = isNandalal ? NANDALAL_SAREES : STANDARD_SAREES;

  // Filtered Catalog
  const filteredCatalog = activeCategoryTab === "All" 
    ? currentCatalog 
    : currentCatalog.filter(s => s.category === activeCategoryTab);

  // Checkout Modal State
  const [selectedSaree, setSelectedSaree] = useState<typeof NANDALAL_SAREES[0] | null>(null);
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
    const shareUrl = `${window.location.origin}/${artisan.slug || artisan.id.toLowerCase()}?ref=${userUid}`;
    const message = `Explore the sovereign handloom flagship store for ${artisan.name}. Buy authentic GI-Tagged Sambalpuri sarees directly from the artisan's pit loom on Bhulia Hub! ${shareUrl}`;

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
      <header className="sticky top-0 w-full z-50 bg-[#0B2B26]/95 backdrop-blur-md border-b border-[#C5A059]/40 px-4 sm:px-6 py-3 sm:py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2 w-full">
          {/* Left Side: Gold Logo, Bhulia.com & Slogan */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-full overflow-hidden border border-[#C5A059] sm:border-2 shadow-[0_0_20px_rgba(197,160,89,0.6)] shrink-0">
              <Image src="/bhulia_logo_final.jpg" alt="Bhulia Gold Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-[#C5A059] leading-none hover:opacity-80 transition-opacity truncate">Bhulia.com</h1>
              </Link>
              <p className="hidden sm:block text-[11px] text-gray-300 font-medium tracking-wide mt-1 truncate">Sambalpuri saree, Direct from Weavers</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Home</Link>
            <Link href="/#cotton-sambalpuri" className="hover:text-[#C5A059] transition-colors pb-1">Products</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">About Us</Link>
            <Link href="/" className="hover:text-[#C5A059] transition-colors pb-1">Contact Us</Link>
          </nav>

          {/* Right Side Actions & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/#weaver-boutiques" className="hidden sm:flex px-5 py-2.5 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shadow shrink-0">
              ← Back to Marketplace
            </Link>

            {/* Mobile Hamburger Button */}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile-Only Dedicated Back Bar */}
        <div className="sm:hidden w-full pt-1 border-t border-[#C5A059]/20 flex justify-center">
          <Link href="/#weaver-boutiques" className="w-full flex items-center justify-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow">
            ← Back to Marketplace
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden sticky top-[73px] z-40 bg-[#0B2B26]/98 backdrop-blur-md border-b border-[#C5A059]/40 px-6 py-6 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3 text-xs font-bold uppercase tracking-widest text-gray-200">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Home</Link>
            <Link href="/#cotton-sambalpuri" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">Products</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] border-b border-[#C5A059]/20 pb-2 block">About Us</Link>
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="hover:text-[#C5A059] pb-1 block">Contact Us</Link>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 container mx-auto px-6 py-8 relative z-10 space-y-12">
        
        {/* ==================== 1. BLUEPRINT HERO SECTION ==================== */}
        <div className="bg-gradient-to-br from-[#0A3A35] via-[#0D3630] to-[#0B2B26] border-2 border-[#C5A059] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>
          
          <div className="space-y-6 max-w-2xl relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-widest font-mono">
                {artisan.id}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0B2B26] border border-[#C5A059]/30 text-gray-200 text-xs font-bold uppercase tracking-widest">
                📍 {artisan.cluster}
              </span>
              <div className="relative inline-flex items-center justify-center">
                {/* Outer Expanding Water Wave Ripple Layers */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF2B2] to-[#D4AF37] opacity-60 animate-ping pointer-events-none blur-sm" style={{ animationDuration: '2.5s' }} />
                <div className="absolute -inset-1 rounded-2xl bg-[#C5A059] opacity-30 animate-pulse pointer-events-none blur-md" />

                {/* Real 3D Metallic Gold Plaque Button */}
                <div className="relative z-10 py-2 px-5 rounded-2xl bg-gradient-to-b from-[#FFF5C0] via-[#D4AF37] via-[#C5A059] to-[#8A5A00] border-2 border-[#FFF0A5] shadow-[0_12px_30px_rgba(0,0,0,0.85),inset_0_3px_4px_rgba(255,255,255,0.9),inset_0_-4px_6px_rgba(120,75,0,0.9)] flex flex-col items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
                  <span className="text-[10px] sm:text-[11px] font-serif font-black tracking-widest text-[#0A1021] uppercase leading-none mb-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
                    Bhulia Verified
                  </span>
                  <span className="text-[11px] sm:text-xs font-serif font-black tracking-wider text-[#0A1021] uppercase leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] text-center">
                    Sambalpuri Master Weaver
                  </span>
                </div>
              </div>
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

            {/* Action Button: Explore the Collection */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a 
                href="#collection" 
                className="px-8 py-4 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(197,160,89,0.5)] flex items-center gap-2 cursor-pointer"
              >
                <span>🛍️ Explore the Collection</span>
                <span>↓</span>
              </a>

              <div className="bg-[#0B2B26] px-4 py-3 rounded-xl border border-[#C5A059]/30 flex items-center gap-2 shadow">
                <span className="text-gray-400 text-xs font-mono">GI Registry:</span>
                <span className="text-[#C5A059] text-xs font-mono font-bold">{artisan.giTagNumber}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Portrait / Share Box */}
          <div className="relative z-10 shrink-0 w-full md:w-80 space-y-4 bg-[#0B2B26]/80 p-6 rounded-2xl border border-[#C5A059]/40 backdrop-blur-md shadow-2xl">
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-[#C5A059]/30 shadow-inner bg-[#051815]">
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

        {/* ==================== 2. BLUEPRINT ARTISAN'S STORY ==================== */}
        {artisan.biodata && (
          <div className="bg-[#0A3A35]/80 border border-[#C5A059]/40 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl space-y-6 backdrop-blur-md animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#C5A059]/20 pb-6">
              <div className="space-y-1 max-w-3xl">
                <span className="text-xs font-mono text-[#C5A059] font-bold uppercase tracking-widest block">📜 The Artisan&apos;s Story (Building Trust)</span>
                <h3 className="text-xl md:text-2xl font-serif text-white font-bold italic leading-relaxed">
                  &ldquo;{artisan.biodata.shortStory || artisan.biodata.artisanTitle}&rdquo;
                </h3>
              </div>
              <div className="bg-[#0B2B26] px-5 py-2.5 rounded-xl border border-[#C5A059]/40 text-xs font-mono text-[#C5A059] font-bold shadow shrink-0">
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
                  <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">📖 Historical Artisan Biography & Craftsmanship</h4>
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

        {/* ==================== 3. BLUEPRINT PRODUCT CATEGORIES & CATALOG ==================== */}
        <div id="collection" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#C5A059]/20 pb-4">
            <div>
              <h3 className="text-2xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Authentic Saree Collection & Masterpieces</h3>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Handwoven on traditional pit looms in {artisan.village}. Backed by Jan Dhan escrow settlement.</p>
            </div>
            
            {/* Scannable Category Tabs */}
            <div className="flex flex-wrap gap-2 bg-[#0B2B26] p-1.5 rounded-2xl border border-[#C5A059]/30 shadow-inner">
              {["All", "The Double Ikat Masterpieces", "Classic Single Ikat Pata", "Contemporary Fusion"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCategoryTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategoryTab === tab 
                      ? "bg-[#C5A059] text-[#0A1021] shadow-[0_0_15px_rgba(197,160,89,0.5)]" 
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ==================== 4. BLUEPRINT PRODUCT PAGE ESSENTIALS ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCatalog.map((saree) => (
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
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-white text-lg group-hover:text-[#C5A059] transition-colors leading-tight">
                      {saree.title}
                    </h4>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      {saree.desc}
                    </p>

                    {/* Blueprint Video Snippets Simulation Box */}
                    <div className="bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/30 space-y-1.5 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
                      <span className="text-[10px] font-mono text-[#C5A059] font-bold uppercase tracking-wider block">
                        ✨ Live Silk Sheen Simulation (Natural Light)
                      </span>
                      <p className="text-[11px] text-gray-200 font-sans italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>{saree.lightSheen}</span>
                      </p>
                    </div>

                    {/* Blueprint Authenticity Badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                        🛡️ {saree.badge}
                      </span>
                    </div>

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

        {/* Preserving Heritage Footer Box */}
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

      {/* Instant Direct Checkout Glassmorphism Modal */}
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
                  <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-50 text-green-400 flex items-center justify-center text-4xl mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce">
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
