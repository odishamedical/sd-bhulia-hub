export interface StoreListing {
  id: string;
  slug: string;
  name: string;
  cluster: string;
  village: string;
  activeWeaversCount: number;
  giTagNumber: string;
  warehouseCapacity: string;
  specialtyTags: string[];
  description: string;
  img: string;
  memberRoster: string[];
  contactDetails?: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
}

export const MASTER_STORES: StoreListing[] = [
  {
    id: "STR-001",
    slug: "maa-samaleswari-weavers",
    name: "Maa Samaleswari Weavers Cooperative Society (PWCS)",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    activeWeaversCount: 142,
    giTagNumber: "GI-Cert: #OD-7492-SB",
    warehouseCapacity: "4,500 units/month",
    specialtyTags: ["Pasapalli Ikat", "Mercerized Cotton", "Traditional Phoda Kumbha"],
    description: "Authentic GI-Tagged Sambalpuri saree collective operating 142 active pit looms in Barpali. Specializing in high-density handspun cotton Pasapalli Ikat and traditional temple borders.",
    img: "/bhulia-hero.png",
    memberRoster: ["Weaver Kishore Meher", "Weaver Trilochana Meher", "Weaver Pramod Meher", "Weaver Subodh Meher"],
    contactDetails: {
      address: "Main Handloom Depot, Barpali, Bargarh, Odisha 768028",
      phone: "+91 94370 12345",
      whatsapp: "919437012345",
      email: "samaleswari.pwcs@bhulia.com"
    }
  },
  {
    id: "STR-002",
    slug: "sonepur-royal-silk",
    name: "Sonepur Royal Silk PWCS",
    cluster: "Sonepur Cluster",
    village: "Sonepur Town",
    activeWeaversCount: 85,
    giTagNumber: "GI-Cert: #OD-9921-SP",
    warehouseCapacity: "2,200 units/month",
    specialtyTags: ["Pure Mulberry Silk", "Sonepur Bomkai", "Silk Mark Gold"],
    description: "Premier Primary Weaving Cooperative Society producing luxurious 3-ply Mulberry silk Bomkai sarees. Featuring rich extra-weft gold thread work and certified Silk Mark tags.",
    img: "/bhulia-hero.png",
    memberRoster: ["Weaver Gopinath Meher", "Weaver Janardan Meher", "Weaver Raghunath Meher"],
    contactDetails: {
      address: "Subarnapur Royal Guild, Sonepur, Odisha 767017",
      phone: "+91 94371 54321",
      whatsapp: "919437154321",
      email: "royal.silk@bhulia.com"
    }
  },
  {
    id: "STR-003",
    slug: "bhagabata-meher",
    name: "Bhagabata Meher Master Ikat Workshop",
    cluster: "Bargarh Cluster",
    village: "Bijepur, Bargarh",
    activeWeaversCount: 28,
    giTagNumber: "GI-Cert: #OD-8832-BJ",
    warehouseCapacity: "900 units/month",
    specialtyTags: ["Bijepur Cotton Ikat", "Natural Vegetable Dyes", "Custom Bandha"],
    description: "Elite independent master weaver workshop producing world-class Bijepur cotton Ikat sarees. Renowned for flawless mathematical symmetry and organic vegetable dye formulations.",
    img: "/bhulia-hero.png",
    memberRoster: ["Weaver Bhagabata Meher", "Weaver Sarat Meher", "Weaver Dibakar Meher"],
    contactDetails: {
      address: "Weaving Hamlet, Bijepur, Bargarh, Odisha 768032",
      phone: "+91 94372 98765",
      whatsapp: "919437298765",
      email: "bhagabata.workshop@bhulia.com"
    }
  }
];

export const DEFAULT_STORE: StoreListing = {
  id: "STR-999",
  slug: "odisha-handloom-cooperative",
  name: "Odisha Central Handloom Cooperative Society",
  cluster: "Central Odisha Belt",
  village: "Bhubaneswar",
  activeWeaversCount: 350,
  giTagNumber: "GI-Cert: #OD-0001-CO",
  warehouseCapacity: "10,000 units/month",
  specialtyTags: ["Traditional Ikat", "Escrow Logistics"],
  description: "Centralized warehouse coordinating logistics and payouts for grassroots primary weaving cooperative societies.",
  img: "/bhulia-hero.png",
  memberRoster: ["Master Weaver Syndicate Group"],
  contactDetails: {
    address: "Janpath Road, Bhubaneswar, Odisha 751001",
    phone: "+91 674 2540123",
    whatsapp: "916742540123",
    email: "cooperative.central@bhulia.com"
  }
};

export const STORE_CATALOG_SAREES = [
  { id: "SAR-S101", title: "Maa Samaleswari Cotton Pasapalli", category: "Cotton Classics", desc: "Cooperative woven dense checker-board cotton saree with traditional phoda border.", price: "₹ 5,299", weave: "Pasapalli Cotton", time: "Barpali Hub Stock", img: "/bhulia-hero.png" },
  { id: "SAR-S102", title: "Sonepur Royal Zari Bomkai Pata", category: "Silk Masterpieces", desc: "Gold zari extra-weft thread work on pure silk mulberry weave.", price: "₹ 18,500", weave: "Bomkai Pata", time: "Sonepur Town Stock", img: "/bhulia-hero.png" },
  { id: "SAR-S103", title: "Bijepur Natural Dye Cotton Ikat", category: "Cotton Classics", desc: "Organic madder root red and indigo dyed geometric bandha pattern.", price: "₹ 5,899", weave: "Vegetable Dye Cotton", time: "Bijepur Workshop Stock", img: "/bhulia-hero.png" },
  { id: "SAR-S104", title: "Traditional Sonepuri Pasapalli Silk", category: "Silk Masterpieces", desc: "Premium handloomed silk with contrast double ikat checks.", price: "₹ 16,800", weave: "Pasapalli Pata", time: "Sonepur Town Stock", img: "/bhulia-hero.png" },
  { id: "SAR-S105", title: "Barpali Phoda Kumbha Cotton Saree", category: "Cotton Classics", desc: "Fine cotton with red spires on border using hand-pulled kumbha style.", price: "₹ 7,500", weave: "Phoda Kumbha Cotton", time: "Barpali Hub Stock", img: "/bhulia-hero.png" }
];
