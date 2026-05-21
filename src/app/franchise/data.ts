export interface FranchiseListing {
  id: string;
  slug: string;
  name: string;
  region: string;
  city: string;
  phygitalOutletsCount: number;
  referralsTracked: number;
  totalCommissionPaid: string;
  specialtyTags: string[];
  description: string;
  img: string;
  outletsList: string[];
  contactDetails?: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
}

export const MASTER_FRANCHISES: FranchiseListing[] = [
  {
    id: "FRA-001",
    slug: "bargarh-phygital-hub",
    name: "Bargarh Phygital Hub & Logistics Center",
    region: "Western Odisha",
    city: "Bargarh Town",
    phygitalOutletsCount: 12,
    referralsTracked: 1450,
    totalCommissionPaid: "₹ 1,84,500",
    specialtyTags: ["Drop-off Center", "Phygital Showrooms", "Local Referral Tracking"],
    description: "Serving as the primary regional drop-off and pickup terminal in Western Odisha. Integrating local weavers with physical franchise outlets for direct customer inspections.",
    img: "/bhulia-hero.png",
    outletsList: ["Barpali Craft Stall", "Bargarh Main Showroom", "Attabira Weaver Point"],
    contactDetails: {
      address: "Logistics Hub Road, Bargarh, Odisha 768028",
      phone: "+91 99370 11111",
      whatsapp: "919937011111",
      email: "bargarh.franchise@bhulia.com"
    }
  },
  {
    id: "FRA-002",
    slug: "sonepur-heritage-center",
    name: "Sonepur Heritage Center & Commission Hub",
    region: "Central-West Odisha",
    city: "Sonepur Town",
    phygitalOutletsCount: 8,
    referralsTracked: 920,
    totalCommissionPaid: "₹ 1,12,000",
    specialtyTags: ["Silk Mark Verification", "Quality Testing", "Fast Disbursal"],
    description: "Bridging the gap between rural master weavers and international customers. Operating quality testing laboratories and direct Jan Dhan payout disbursements.",
    img: "/bhulia-hero.png",
    outletsList: ["Sonepur Palace Craft Wing", "Dasrajpur Weaver Collective Hub"],
    contactDetails: {
      address: "Heritage Way, Sonepur Town, Odisha 767017",
      phone: "+91 99370 22222",
      whatsapp: "919937022222",
      email: "sonepur.franchise@bhulia.com"
    }
  }
];

export const DEFAULT_FRANCHISE: FranchiseListing = {
  id: "FRA-999",
  slug: "bhubaneswar-craft-depot",
  name: "Bhubaneswar Central Craft Depot & Franchise Network",
  region: "Coastal Odisha",
  city: "Bhubaneswar",
  phygitalOutletsCount: 25,
  referralsTracked: 5200,
  totalCommissionPaid: "₹ 5,60,000",
  specialtyTags: ["Statewide Distribution", "Bulk Corporate Deals"],
  description: "Main metropolitan distribution hub and admin franchise network covering capital region physical retail locations.",
  img: "/bhulia-hero.png",
  outletsList: ["Janpath Experience Center", "Patia Craft Outlet", "Cuttack Link Depot"],
  contactDetails: {
    address: "Infocity Road, Patia, Bhubaneswar, Odisha 751024",
    phone: "+91 99370 33333",
    whatsapp: "919937033333",
    email: "central.franchise@bhulia.com"
  }
};
