export interface FranchiseListing {
  id: string;
  name: string;
  slug: string;
  region: string;
  city: string;
  ownerId: string;
  img: string;
  description: string;
  subscriptionTier: string;
  phygitalOutletsCount: number;
  referralsTracked: number;
  totalCommissionPaid: string;
  specialtyTags: string[];
  outletsList: string[];
}

export const MASTER_FRANCHISES: FranchiseListing[] = [
  {
    id: "f101",
    name: "Maa Samaleswari Boutique",
    slug: "maa-samaleswari",
    region: "Odisha West",
    city: "Sambalpur",
    ownerId: "user123",
    img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1600&auto=format&fit=crop",
    description: "Verified Bhulia Hub reseller.",
    subscriptionTier: "paid_1",
    phygitalOutletsCount: 3,
    referralsTracked: 152,
    totalCommissionPaid: "₹45,000",
    specialtyTags: ["Silk Masterpieces", "Cotton Classics"],
    outletsList: ["Main St, Sambalpur"]
  }
];

export const DEFAULT_FRANCHISE = MASTER_FRANCHISES[0];
