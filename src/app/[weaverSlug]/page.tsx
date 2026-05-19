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
  galleryImages?: string[];
  contactDetails?: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
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
    galleryImages: [
      "/bhulia-hero.png",
      "https://images.unsplash.com/photo-1605513511874-569d4ceb8b6e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&auto=format&fit=crop&q=80"
    ],
    contactDetails: {
      address: "Master Weaver's Guild, Dasrajpur, Sonepur, Odisha 767017",
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
      email: "nandalal.meher@bhulia.com"
    }
  },
  {
    id: "ART-102",
    slug: "rabindra-meher",
    name: "Creative Weaver Rabindra Meher | Master of Sambalpuri Pata",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    category: "sonepur",
    entityType: "Independent",
    loomCount: 18,
    giTagNumber: "GI-Cert: #OD-5512-SP",
    specialtyTags: ["Sambalpuri Pata", "Double Ikat", "Pasapalli", "Nabakothi", "Bomkai", "Sachitra"],
    seoDescription: "Extraordinarily creative master weaver from Dasrajpur, Sonepur. Delivering high-class Sambalpuri Pata sarees including Pasapalli, Nabakothi, Bomkai, and narrative Sachitra silk masterpieces.",
    img: "/rabindra_meher.jpg",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Creative Master of Sambalpuri Pata",
      legacyEst: "Est. 1988 / Dasrajpur Silk Innovation Loom",
      shortStory: "Rabindra Meher is an extraordinarily creative weaver based in Dasrajpur, Sonepur—the heartland of Odisha's prestigious handloom heritage. Known for his innovative vision and mastery over silk, Meher breathes new life into the iconic Sambalpuri Pata saree.",
      awardHighlights: [
        "🏆 Award for Handloom Innovation",
        "🏆 State Champion of Bandhakala Silk",
        "🏆 Master Craft Seal of Sonepur"
      ],
      masterpieceMotifs: [
        "✨ Pasapalli Dice Matrix",
        "✨ Nabakothi Auspicious Houses",
        "✨ Boita Bandana Maritime Theme",
        "✨ Sachitra Narrative Folklore"
      ],
      detailedBiography: "Rabindra Meher is an extraordinarily creative weaver based in Dasrajpur, Sonepur—the heartland of Odisha's prestigious handloom heritage. Known for his innovative vision and mastery over silk, Meher breathes new life into the iconic Sambalpuri Pata saree. His work gracefully balances age-old weaving heritage with contemporary aesthetics, earning him a reputation for delivering high-class, luxury textiles.\n\nMeher specializes in both Single Ikat and highly complex Double Ikat (Bandhakala) techniques. By meticulously planning, tie-dying, and aligning fine silk yarns entirely by hand, he transforms raw mulberry silk into fluid, storytelling canvases. His premium creations are universally recognized for their deep color contrasts, sharp ikat outlines, and pristine silk luster.\n\nSignature Varieties in His Store Page\nTo build a comprehensive profile and store catalog, his collection can be categorized into these globally acclaimed varieties of Sambalpuri Pata:\n• Pasapalli Pata: Captivating sarees featuring the timeless, bold checkered board patterns inspired by the ancient game of dice (Pasa).\n• Bichitrapuri Pata: Grand heritage sarees characterized by large, striking geometric grids, decorative bands, and animal motifs woven on a rich silk canvas.\n• Nabakothi Pata: Highly artistic and spiritually significant sarees featuring nine houses (Kothi), each containing a unique auspicious motif like the Sankha (conch), Chakra (wheel), or Gaja (elephant).\n• Bomkai Pata (Sonepuri Masterpieces): High-class fusions where complex ikat patterns on the body seamlessly pair with extra-weft Jala/Jacquard borders and heavy, thread-work pallus.\n• Boita Bandana Pata: Theme-based creative masterpieces that depict the historic maritime glory and trading ships (Boita) of ancient Odisha along the borders and pallu.\n• Sachitra / Narrative Pata: Elite-tier storytelling sarees featuring intricate floral configurations, birds, deer, and scenes inspired by Nature or regional folklore.",
    },
    galleryImages: [
      "/bhulia-hero.png",
      "https://images.unsplash.com/photo-1584285408660-3162638f2191?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&auto=format&fit=crop&q=80"
    ],
    contactDetails: {
      address: "Creative Loom House, Dasrajpur, Sonepur, Odisha 767017",
      phone: "+91 98765 43211",
      whatsapp: "919876543211",
      email: "rabindra.meher@bhulia.com"
    }
  },
  {
    id: "ART-103",
    slug: "nagarjuna-meher",
    name: "Master Artisan Nagarjuna Meher | Lifetime Handloom Excellence",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    category: "sonepur",
    entityType: "Independent",
    loomCount: 22,
    giTagNumber: "GI-Cert: #OD-6621-SP",
    specialtyTags: ["Sambalpuri Pata", "Premium Double Ikat", "Pasapalli", "Bichitrapuri", "Nabakothi", "Sonepuri Bomkai", "Sachitra"],
    seoDescription: "Legendary master weaver Nagarjuna Meher from Dasrajpur, Sonepur. Devoted to handloom excellence since childhood, producing premium double ikat, Pasapalli, Nabakothi, and narrative silk masterpieces for global collectors.",
    img: "/nagarjuna_meher.png",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Legendary Custodian of Sambalpuri Pata",
      legacyEst: "Est. 1976 / Dasrajpur Lifetime Excellence Loom",
      shortStory: "Nagarjuna Meher is a legendary master weaver from Dasrajpur, Sonepur, whose life story is woven into the very fabric of Odisha’s textile history. Dedicating himself to the loom since early childhood, Meher possesses an intuitive, lifelong understanding of silk, color, and geometry.",
      awardHighlights: [
        "🏆 Lifetime Handloom Excellence Seal",
        "🏆 Global Heritage Craft Ambassador",
        "🏆 Master Craft Guardian of Sonepur"
      ],
      masterpieceMotifs: [
        "✨ Premium Double Ikat Alignment",
        "✨ Pasapalli Royal Dice Board",
        "✨ Nabakothi Nine Auspicious Houses",
        "✨ Sachitra Mythology Folklore"
      ],
      detailedBiography: "Nagarjuna Meher is a legendary master weaver from Dasrajpur, Sonepur, whose life story is woven into the very fabric of Odisha’s textile history. Dedicating himself to the loom since early childhood, Meher possesses an intuitive, lifelong understanding of silk, color, and geometry. Today, he is recognized as an original custodian of the Sambalpuri Pata saree.\n\nMeher’s high-class single and double ikat designs transcend regional borders. His masterpieces are celebrated on national runways and eagerly sought after by international textile collectors. By combining childhood precision with sophisticated artistry, his handwoven silk sarees are globally revered as true works of wearable art.\n\nGlobal Collection: Signature Sambalpuri Pata Varieties\nTo showcase the full breadth of his lifelong expertise, his profile and web store feature these globally acclaimed varieties:\n• Premium Double Ikat Masterpieces: Rare, high-investment silk sarees where both warp and weft threads are tie-dyed, creating flawlessly aligned, mirror-image geometric patterns.\n• Pasapalli Pata: The iconic, bold checkered board design inspired by the ancient royal game of dice, featuring sharp contrasting blocks and intricate borders.\n• Bichitrapuri Pata: Grand heritage sarees featuring large, striking geometric grids mixed with traditional animal, bird, and fish motifs.\n• Nabakothi Pata: Highly artistic sarees featuring nine auspicious houses (Kothi), each meticulously filled with unique motifs like the lotus, elephant, and conch shell.\n• Sonepuri Bomkai Pata: An elite fusion combining intricate body ikat with heavy, raised extra-weft thread work (Jala) on the borders and pallu.\n• Sachitra Narrative Pata: Storytelling sarees featuring breathtaking, free-hand ikat depictions of nature, folklore, and classical Indian mythology that attract international buyers.",
    },
    galleryImages: [
      "/bhulia-hero.png",
      "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605513511874-569d4ceb8b6e?w=800&auto=format&fit=crop&q=80"
    ],
    contactDetails: {
      address: "Lifetime Excellence Loom, Dasrajpur, Sonepur, Odisha 767017",
      phone: "+91 98765 43212",
      whatsapp: "919876543212",
      email: "nagarjuna.meher@bhulia.com"
    }
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
  },
  {
    id: "ART-104",
    slug: "ravi-meher",
    name: "Ravi Meher | Master Weaver Ikata & Graph Artist",
    cluster: "Bargarh Cluster",
    village: "Laumunda, Bargarh",
    category: "bargarh",
    entityType: "Independent",
    loomCount: 15,
    giTagNumber: "GI-Cert: #OD-1102-BG",
    specialtyTags: ["Pasapali Cotton Classics", "Bichitrapuri Masterpieces", "Sachipar Designs", "Modern Narrative Graphs", "Mathematical Graph Art"],
    seoDescription: "Ravi Meher, from Laumunda, Bargarh, is a visionary Master Weaver and Graph Artist redefining Indian handlooms by merging mathematical precision with Bandha Kala.",
    img: "/ravi_meher_v3.png",
    isClaimed: true,
    claimStatus: "verified",
    biodata: {
      artisanTitle: "Master Weaver Ikata & Graph Artist",
      legacyEst: "Cultural Guardian of Lumunda",
      shortStory: "Ravi Meher is a visionary Master Weaver, Ikat Designer, and Graph Artist from Lumunda, Bargarh. He merges the architectural precision of mathematical graph art with the ancient, intuitive soul of Bandha Kala.",
      awardHighlights: [
        "🏆 National Graph Artist Recognition",
        "🏆 Community Artisan Empowerment",
        "🏆 Guardian of Bandha Kala Heritage"
      ],
      masterpieceMotifs: [
        "✨ Pasapali Mathematical Classics",
        "✨ Bichitrapuri Intricate Borders",
        "✨ Sachipar & Asamantara Matrices",
        "✨ Modern Narrative Corporate Graphs"
      ],
      detailedBiography: "Ravi Meher, hailing from Lumunda, Bargarh (Odisha), is a visionary Master Weaver, Ikat Designer, and Graph Artist redefining the landscape of Indian handlooms. Merging the architectural precision of mathematical graph art with the ancient, intuitive soul of Bandha Kala (Tie & Dye), Ravi transforms raw cotton yarns into national masterpieces.\n\nBeyond his loom, he serves as a cultural guardian. He has dedicated his life to preserving Odisha’s heritage by training and mentoring hundreds of next-generation Bandha artists, ensuring that this painstaking heirloom craft thrives for decades to come.\n\nSignature Creations\nEvery piece is hand-mapped on a graph before meeting the loom. It takes months of precise calculating, resist-dyeing, and high-count cotton weaving to yield flawless symmetry. His nationally acclaimed Sambalpuri Cotton Sarees include iconic signature varieties:\n• Pasapali Cotton Classics: Striking, mathematical chess-board patterns woven with flawless geometric accuracy.\n• Bichitrapuri Masterpieces: Elaborately detailed bodies coupled with intensely intricate Ikat borders and heritage motifs.\n• Barpali & Sonepuri Weaves: Region-inspired traditional layouts featuring crisp, high-contrast cultural iconography.\n• Sachipar & Asamantara Designs: Classic checkered matrices balanced beautifully with star-studded skies across the anchal (pallu).\n• Modern Narrative Graphs: Custom, cutting-edge corporate and thematic drapes plotted on modern graphs and translated directly onto yarn.\n\nThe Craft Process\n• The Graph Matrix: Ravi hand-draws complex mathematical layouts on graph sheets, mapping out every individual thread intersection.\n• Bandha Kala (Tie & Dye): Cotton threads are bound with absolute precision and dyed repeatedly to construct multi-coloured patterns directly onto the loose warp and weft yarns.\n• The Weave: The pre-dyed yarns are carefully aligned on traditional pit looms, revealing the intricate patterns thread-by-thread during the weaving process.\n\nWhy Choose Authenticity?\n• 100% Pure Cotton: Light, fully breathable, and incredibly durable fabrics built for premium comfort.\n• National Recognition: Coveted, heirloom-grade collector pieces well accepted and celebrated across the nation.\n• Empowering Communities: Directly supports a weaver-led setup that sustains hundreds of local rural artisans.",
    },
    galleryImages: [
      "/bhulia-hero.png",
      "https://images.unsplash.com/photo-1605513511874-569d4ceb8b6e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584285408660-3162638f2191?w=800&auto=format&fit=crop&q=80"
    ],
    contactDetails: {
      address: "At/Po: Lumunda, District: Bargarh, Odisha, India",
      phone: "+91 98765 43213",
      whatsapp: "919876543213",
      email: "ravi.meher@bhulia.com"
    }
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
  const [lang, setLang] = useState<"en" | "or">("en");

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

    return () => window.removeEventListener("sd_auth_change", checkAuth);
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

      {/* Global Gold Filigree Page Borders */}
      <div className="hidden lg:block absolute inset-4 border border-[#C5A059]/30 rounded-2xl pointer-events-none z-30">
        <div className="absolute inset-1 border border-[#C5A059]/15 rounded-xl" />
        
        {/* Corner Ornaments */}
        <div className="absolute top-3 left-3 text-[#C5A059]/60 font-serif text-lg leading-none select-none">⚜</div>
        <div className="absolute top-3 right-3 text-[#C5A059]/60 font-serif text-lg leading-none select-none">⚜</div>
        <div className="absolute bottom-3 left-3 text-[#C5A059]/60 font-serif text-lg leading-none select-none">⚜</div>
        <div className="absolute bottom-3 right-3 text-[#C5A059]/60 font-serif text-lg leading-none select-none">⚜</div>
      </div>

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

          {/* Right Side: User Menu / Sign In / Register (Desktop) & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {userAvatar ? (
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-[#0A3A35] rounded-xl border border-[#C5A059]/50 shadow-inner shrink-0">
                <img src={userAvatar} alt="User Avatar" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-[#C5A059]" />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{userName}</span>
                  <span className="text-[9px] text-[#C5A059] uppercase tracking-widest mt-0.5">{userRole}</span>
                </div>
              </div>
            ) : (
              <a href="https://sd-auth-center.vercel.app" className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:brightness-110 transition-all cursor-pointer shrink-0">
                <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Sign In / Register</span>
              </a>
            )}

            {/* Cart Button */}
            <button className="hidden sm:flex items-center gap-2 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>Cart (2)</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] rounded-xl hover:bg-[#0D4B45] transition-all cursor-pointer shrink-0 shadow">
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

        {/* Mobile-Only Dedicated Sign In / Register Bar right below Bhulia.com */}
        {!userAvatar && (
          <div className="sm:hidden w-full pt-1 border-t border-[#C5A059]/20 flex justify-center">
            <a href="https://sd-auth-center.vercel.app" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:brightness-110 transition-all cursor-pointer">
              <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              <span>Sign In / Register</span>
            </a>
          </div>
        )}
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
      <div className="flex-1 container mx-auto px-4 md:px-6 py-4 md:py-6 relative z-10 space-y-6 md:space-y-8">
        
        <div>
          {/* Breadcrumb Navigation - Back to Marketplace */}
          <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Bhulia.com</Link>
            <span className="mx-2 text-[#C5A059]">&gt;</span>
            <Link href="/#weaver-boutiques" className="text-[#C5A059] hover:text-[#D4AF37] transition-colors flex items-center gap-1">
              <span>Marketplace</span>
            </Link>
            <span className="mx-2 text-[#C5A059]">&gt;</span>
            <span className="text-gray-400">{artisan.id}</span>
          </div>

          {/* Micro-Nav Sticky Bar (Mobile Only fallback) */}
          <div className="sticky top-[73px] sm:top-[89px] z-40 md:hidden bg-[#0B2B26]/95 backdrop-blur-xl border border-[#C5A059]/30 rounded-xl p-1.5 flex items-center justify-between sm:justify-start overflow-x-auto gap-2 sm:gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] scrollbar-hide">
            <a href="#about" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-[#0A1021] hover:bg-[#C5A059] transition-all whitespace-nowrap">About Master</a>
            <a href="#gallery" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-[#0A1021] hover:bg-[#C5A059] transition-all whitespace-nowrap">Masterpiece Gallery</a>
            <a href="#collection" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-[#0A1021] hover:bg-[#C5A059] transition-all whitespace-nowrap">Live Collections</a>
            <a href="#contact" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-[#0A1021] hover:bg-[#C5A059] transition-all whitespace-nowrap">Contact & Visit</a>
          </div>
        </div>

        {/* ==================== 1. BLUEPRINT HERO SECTION ==================== */}
        <div className="bg-[#0A3A35] border-2 border-[#C5A059] rounded-2xl md:rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(197,160,89,0.25)] flex flex-col">
          
          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {/* Left Side: Photo & Verification ID Badge */}
            <div className="w-full md:w-80 flex flex-col border-b md:border-b-0 md:border-r border-[#C5A059]/30 bg-[#0B2B26] shrink-0">
              <div className="relative w-full h-72 md:h-80 overflow-hidden bg-[#051815]">
                <Image src={artisan.img} alt={artisan.name} fill className="object-cover" />
                {/* Round Logo Overlay (Bottom Left) */}
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full overflow-hidden border border-[#C5A059] shadow-lg z-20">
                  <Image src="/bhulia_logo_final.jpg" alt="Bhulia Logo" fill className="object-cover" />
                </div>
              </div>
              {/* Yellow Tag Below Image */}
              <div className="bg-[#EAB308] text-[#0A1021] py-3 px-4 text-center text-[10px] sm:text-xs font-serif font-black tracking-wide uppercase border-t border-[#C5A059]/40">
                Bhulia.com Verified Weaver : {artisan.name.split('|')[0].trim()} ({artisan.id.replace('ART-', 'BW/')})
              </div>
            </div>

            {/* Right Side: Navigation & Info */}
            <div className="flex-1 flex flex-col justify-between p-5 md:p-8 bg-gradient-to-br from-[#0A3A35] to-[#0B2B26] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>

              {/* Navigation inside Hero */}
              <div className="hidden md:flex items-center justify-between border border-[#C5A059]/40 rounded-xl bg-[#051815]/85 p-1 mb-6">
                <a href="#about" className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-white hover:bg-[#C5A059]/20 rounded-lg transition-all">About Master</a>
                <a href="#gallery" className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-white hover:bg-[#C5A059]/20 rounded-lg transition-all">Masterpiece Gallery</a>
                <a href="#collection" className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-white hover:bg-[#C5A059]/20 rounded-lg transition-all">Live Collections</a>
                <a href="#contact" className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-white hover:bg-[#C5A059]/20 rounded-lg transition-all">Contact & Visit</a>
              </div>

              {/* Title & Description */}
              <div className="space-y-4 relative z-10">
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                  {artisan.name.split('|')[0].trim()} , {artisan.village.split(',')[0].trim()}, {artisan.cluster.replace('Cluster','').trim()}
                </h2>

                <div className="inline-block bg-[#EAB308] text-[#0A1021] px-5 py-2 rounded-xl font-serif font-black text-xs sm:text-sm tracking-wider shadow">
                  {artisan.biodata?.artisanTitle || "Master Weaver"}
                </div>

                <p className="text-sm md:text-base text-gray-200 leading-relaxed font-sans max-w-xl pt-2">
                  {artisan.seoDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#C5A059]/10 relative z-10">
                <div className="flex gap-2">
                  {artisan.specialtyTags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-[#0B2B26] border border-[#C5A059]/30 text-[#C5A059] text-[10px] px-2.5 py-1 rounded-lg font-sans font-medium shadow-inner">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleSocialShare("whatsapp")} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow">
                    <span>📲 WhatsApp</span>
                  </button>
                  <button onClick={() => handleSocialShare("facebook")} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#1877F2] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow">
                    <span>📘 Facebook</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Full-Width Promotes Banner */}
          <div className="w-full bg-[#EAB308] text-[#0A1021] py-2.5 px-4 text-center text-xs md:text-sm font-serif font-black uppercase tracking-wider border-t border-[#C5A059]/40 z-10 shrink-0">
            Bhulia.com Promotes Only Original Sambalpuri Sarees and Weavers
          </div>

        </div>

        {/* ==================== 2. BLUEPRINT ARTISAN'S STORY ==================== */}
        {artisan.biodata && (
          <div id="about" className="bg-[#0A3A35]/80 border-2 border-[#C5A059]/40 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl space-y-6 backdrop-blur-md animate-fadeIn scroll-mt-32">
            
            {/* Section Header with English / Odia Selector */}
            <div className="flex justify-between items-center border-b border-[#C5A059]/20 pb-4">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#C5A059] tracking-wider uppercase">
                {lang === "en" ? "About the Weaver" : "ବୁଣାକାରଙ୍କ ସମ୍ପର୍କରେ"}
              </h3>
              
              {/* Language Selector Toggle */}
              <button 
                onClick={() => setLang(lang === "en" ? "or" : "en")}
                className="relative py-1.5 px-4 rounded-full bg-[#051815] border border-[#C5A059] text-xs font-bold font-mono tracking-widest text-[#C5A059] hover:bg-[#C5A059]/10 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] flex items-center gap-2 cursor-pointer z-20"
              >
                <span className={lang === "en" ? "text-white underline decoration-amber-400 decoration-2" : "opacity-60"}>EN</span>
                <span className="text-[#C5A059]/40">|</span>
                <span className={lang === "or" ? "text-white underline decoration-amber-400 decoration-2" : "opacity-60"}>ଓଡ଼ିଆ</span>
              </button>
            </div>

            {/* 3-Column Compact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Column 1: Image Gallery (At the Loom & Work) */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#C5A059]/40 shadow-md bg-[#0B2B26]">
                  <Image 
                    src={artisan.img} 
                    alt={artisan.name} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#C5A059]/40 shadow-md bg-[#0B2B26]">
                  <Image 
                    src="/ravi_meher_v2.png" 
                    alt="Loom Workshop" 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <p className="text-[10px] text-center text-gray-400 font-mono">
                  {lang === "en" ? "Loom workshop & master portrait" : "ତନ୍ତଶାଳା ଏବଂ ମୁଖ୍ୟ ବୁଣାକାରଙ୍କ ପ୍ରତିକୃତି"}
                </p>
              </div>

              {/* Column 2: Accolades & Expertise Badges (Compact, no huge cards) */}
              <div className="md:col-span-4 flex flex-col justify-between border-y md:border-y-0 md:border-x border-[#C5A059]/20 py-4 md:py-0 md:px-6 space-y-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">
                    {lang === "en" ? "Expertise & Bhulia Awards" : "ଦକ୍ଷତା ଓ ଭୁଲିଆ ପୁରସ୍କାର"}
                  </h4>
                  
                  {/* Badge 1: Bhulia Award Winner */}
                  <div className="flex items-start gap-3 py-1">
                    <span className="text-[#C5A059] text-lg shrink-0 mt-0.5">🎖️</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{lang === "en" ? "Bhulia.com Award Winner" : "ଭୁଲିଆ.କମ୍ ପୁରସ୍କାର ବିଜେତା"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lang === "en" ? "Textile Excellence" : "ବସ୍ତ୍ରଶିଳ୍ପ ଶ୍ରେଷ୍ଠତା"}</p>
                    </div>
                  </div>

                  {/* Badge 2: Master Weaver */}
                  <div className="flex items-start gap-3 py-1">
                    <span className="text-[#C5A059] text-lg shrink-0 mt-0.5">🎖️</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{lang === "en" ? "Master Weaver" : "ମୁଖ୍ୟ ବୁଣାକାର"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lang === "en" ? `${artisan.loomCount}+ Active Looms` : `${artisan.loomCount}+ ସକ୍ରିୟ ତନ୍ତୁ`}</p>
                    </div>
                  </div>

                  {/* Badge 3: Ikat Graph Specialist */}
                  <div className="flex items-start gap-3 py-1">
                    <span className="text-[#C5A059] text-lg shrink-0 mt-0.5">🎖️</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{lang === "en" ? "Ikat Specialist" : "ଇକତ୍ ବିଶେଷଜ୍ଞ"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lang === "en" ? "Traditional Design" : "ପାରମ୍ପରିକ ନକ୍ସା"}</p>
                    </div>
                  </div>

                  {/* Badge 4: Heritage Handloom */}
                  <div className="flex items-start gap-3 py-1">
                    <span className="text-[#C5A059] text-lg shrink-0 mt-0.5">🎖️</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{lang === "en" ? "Heritage Handloom" : "ଐତିହ୍ୟ ହସ୍ତତନ୍ତ"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lang === "en" ? "Preserving Artistry" : "ବାନ୍ଧକଳାର ସଂରକ୍ଷଣ"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#C5A059]/10">
                  {artisan.biodata.masterpieceMotifs.slice(0, 3).map((motif, i) => (
                    <span key={i} className="bg-[#0B2B26] border border-[#C5A059]/30 text-white text-[9px] px-2.5 py-1 rounded-lg font-sans font-medium shadow">
                      ✦ {motif.replace('✨', '').trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Column 3: Detailed Biography (Storytelling) */}
              <div className="md:col-span-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider font-mono">
                    {lang === "en" ? "Artisan Story & Craftsmanship" : "ବୁଣାକାରଙ୍କ କାହାଣୀ ଓ କଳା"}
                  </h4>
                  
                  <div className="text-xs text-gray-200 leading-relaxed font-sans space-y-3">
                    {artisan.slug && TRANSLATIONS[artisan.slug] ? (
                      <>
                        <p>{lang === "en" ? TRANSLATIONS[artisan.slug].en.bio1 : TRANSLATIONS[artisan.slug].or.bio1}</p>
                        <p>{lang === "en" ? TRANSLATIONS[artisan.slug].en.bio2 : TRANSLATIONS[artisan.slug].or.bio2}</p>
                      </>
                    ) : (
                      <p className="whitespace-pre-line">{artisan.biodata.detailedBiography}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#C5A059]/20 flex justify-between items-center text-[9px] font-mono text-gray-400">
                  <span>{lang === "en" ? "Verified Handloom Census" : "ହସ୍ତତନ୍ତ ଜନଗଣନା ଦ୍ଵାରା ସତ୍ୟାପିତ"}</span>
                  <span className="text-green-400 font-bold">✓ D2C Escrow Ready</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 2.5 GALLERY SECTION ==================== */}
        {artisan.galleryImages && artisan.galleryImages.length > 0 && (
          <div id="gallery" className="space-y-6 scroll-mt-32 border-t border-[#C5A059]/20 pt-8">
            <div>
              <h3 className="text-2xl font-serif text-[#C5A059] font-bold tracking-wider mb-1">Masterpiece Gallery & Loom Portfolio</h3>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Visual proof of authentic handloom craftsmanship</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {artisan.galleryImages.map((img, idx) => (
                <div key={idx} className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-[#C5A059]/30 shadow-[0_10px_20px_rgba(0,0,0,0.4)] group">
                  <Image src={img} alt={`${artisan.name} Gallery Image ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2520] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#C5A059] bg-[#0B2B26]/80 px-2 py-1 rounded backdrop-blur border border-[#C5A059]/30 shadow">
                      VERIFIED ASSET
                    </span>
                  </div>
                </div>
              ))}
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
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between space-y-5 md:space-y-6">
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

      {/* ==================== 5. CONTACT & VISIT FOOTER ==================== */}
      {artisan.contactDetails && (
        <div id="contact" className="container mx-auto px-6 mb-8 mt-12 scroll-mt-32">
          <div className="bg-gradient-to-br from-[#051815] to-[#0A3A35] border border-[#C5A059]/40 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(197,160,89,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-serif text-[#C5A059] font-bold tracking-wider">Contact & Visit the Artisan</h3>
                <p className="text-sm text-gray-300 font-sans leading-relaxed max-w-md">
                  We encourage buyers to build direct relationships with our master weavers. Visit their looms, feel the silk, and witness the magic of Ikat first-hand.
                </p>
                <div className="space-y-3 pt-4 font-mono text-xs text-gray-200">
                  <div className="flex items-start gap-3 bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/20 shadow-inner">
                    <span className="text-[#C5A059] text-base mt-0.5">📍</span>
                    <span className="leading-relaxed">{artisan.contactDetails.address}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/20 shadow-inner">
                    <span className="text-[#C5A059] text-base">📞</span>
                    <span>{artisan.contactDetails.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/20 shadow-inner">
                    <span className="text-[#C5A059] text-base">✉️</span>
                    <span>{artisan.contactDetails.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-5">
                <a href={`https://wa.me/${artisan.contactDetails.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1EBE5D] to-[#25D366] text-white rounded-xl font-bold text-sm shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:brightness-110 hover:scale-105 transition-all">
                  <span className="text-xl">💬</span>
                  <span>WhatsApp the Artisan</span>
                </a>
                <div className="bg-[#0B2B26]/80 backdrop-blur-md p-4 rounded-xl border border-[#C5A059]/30 max-w-xs text-left md:text-right shadow-inner">
                  <p className="text-[10px] font-mono text-gray-400 leading-relaxed">
                    When you message them directly, please mention you found them on <span className="text-[#C5A059] font-bold">Bhulia.com</span> to ensure priority D2C Jan Dhan escrow protection and VIP service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
