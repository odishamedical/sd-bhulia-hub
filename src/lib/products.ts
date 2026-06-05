export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  desc: string;
  longDesc: string;
  price: string;
  mrp: string;
  weave: string;
  time: string;
  cluster: string;
  village: string;
  yarnType: string;
  isBhuliaVerified: boolean;
  escrowStatus: string;
  rating: string;
  img: string;
  inStock: boolean;
  stockQuantity?: number;
  allowResellerMargin?: boolean;
  resellerMarginPercentage?: number;
  resellerPrice?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  // Handloom attributes
  sareeType?: "Cotton" | "Silk(pata)" | "Mix Pata(silk)";
  manufacturingProcess?: "Single Ikat(bandha)" | "Double Ikat(double bandha)" | "Bomkei";
  designType?: "Pasapali(saptapar)" | "Traditional Design" | "Modern Design";
  weaverName?: string;
  designerName?: string;
  creatorName?: string;
  threadType?: "80 Count" | "100 Count" | "120 Count" | string;
  colorUse?: string;
  weavingDuration?: string;
  length?: string;
  hasBlouse?: boolean;
  sellerId?: string; // Links product to a specific Weaver or Vendor
  sellerType?: "weaver" | "vendor" | "store";
  vendorName?: string;
  status?: string;
  images?: string[];
}


export const MASTER_PRODUCTS: Product[] = [
  {
    id: "SAR-N101",
    slug: "dasrajpur-royal-pasapalli-double-ikat-pata",
    title: "Dasrajpur Royal Pasapalli Double Ikat Pata Saree",
    category: "Silk Masterpieces",
    desc: "Flawless mathematical alignment where both warp and weft silk threads are tie-dyed before mounting on the pit loom.",
    longDesc: "This masterpiece represents the absolute pinnacle of Odishan double ikat (Bandhakala) weaving. Both the warp and weft pure mulberry silk threads are bound and dyed with mathematical precision on graphs before mounting on the loom. The iconic checkered Pasapalli design reflects royalty and pristine symmetry, perfect for heirloom collection.",
    price: "₹ 34,500",
    mrp: "₹ 42,000",
    weave: "Double Ikat Pata",
    time: "45 Days Handweaving",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    yarnType: "3-Ply Mulberry Silk (Silk Mark Gold)",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "5.0 (18 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-N102",
    slug: "sonepur-temple-spire-&-conch-double-ikat-silk",
    title: "Sonepur Temple Spire & Conch Double Ikat Silk Saree",
    category: "Silk Masterpieces",
    desc: "Intricate temple borders and conch shell motifs tie-dyed with absolute micro-millimeter precision across the silk matrix.",
    longDesc: "Woven over 52 days of intensive manual craftsmanship in Sonepur, this premium silk saree exhibits the sacred Shankha (conch shell) and Phoda Kumbha (temple spire) motifs. Features an intense royal purple body with deep gold borders that shimmer elegantly in natural light.",
    price: "₹ 38,000",
    mrp: "₹ 46,000",
    weave: "Double Ikat Pata",
    time: "52 Days Handweaving",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    yarnType: "3-Ply Mulberry Silk (Silk Mark Gold)",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "5.0 (12 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-N103",
    slug: "traditional-machha-(fish)-motif-single-ikat-pata",
    title: "Traditional Machha (Fish) Motif Single Ikat Pata Saree",
    category: "Silk Masterpieces",
    desc: "Vibrant everyday luxury silk saree featuring classic Odishan fish wealth motifs along the rich pallu.",
    longDesc: "Featuring the Machha (fish) motif, which symbolizes fertility, wealth, and prosperity in Odishan folklore. This single ikat silk pata saree is lightweight, comfortable, and finished with a shimmering copper-green border.",
    price: "₹ 18,500",
    mrp: "₹ 24,000",
    weave: "Single Ikat Pata",
    time: "22 Days Handweaving",
    cluster: "Sonepur Cluster",
    village: "Dasrajpur, Sonepur",
    yarnType: "2-Ply Mulberry Silk",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.9 (24 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-101",
    slug: "royal-pasapalli-mercerized-cotton-ikat",
    title: "Royal Pasapalli Mercerized Cotton Ikat Saree",
    category: "Cotton Classics",
    desc: "Handspun, high-density traditional cotton weave featuring flawless mathematical symmetry.",
    longDesc: "Crafted using 100% pure high-density mercerized cotton for exceptional breathability and crisp fall. Features the timeless chess-board block pattern with temple design accents along the borders.",
    price: "₹ 12,500",
    mrp: "₹ 18,000",
    weave: "Cotton Double Ikat",
    time: "18 Days Handweaving",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    yarnType: "100/2s Mercerized Cotton",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.9 (32 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-102",
    slug: "subarnapur-extra-weft-mulberry-silk-bomkai",
    title: "Subarnapur Extra-Weft Mulberry Silk Bomkai Saree",
    category: "Silk Masterpieces",
    desc: "Heavy 3-ply Mulberry silk Bomkai sarees featuring rich extra-weft gold thread work.",
    longDesc: "Using the traditional Jala wooden frame attachment, the weaver manually lifts individual silk threads to interlace intricate extra-weft patterns across the pallu, producing a rich gold texture.",
    price: "₹ 24,800",
    mrp: "₹ 32,000",
    weave: "Bomkai Extra-Weft",
    time: "25 Days Handweaving",
    cluster: "Sonepur Cluster",
    village: "Sonepur Town",
    yarnType: "3-Ply Mulberry Silk (Silk Mark Gold)",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "5.0 (9 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-103",
    slug: "traditional-phoda-kumbha-border-cotton-saree",
    title: "Traditional Phoda Kumbha Border Cotton Saree",
    category: "Cotton Classics",
    desc: "High-twist handspun yarn offering exceptional breathability and comfort.",
    longDesc: "Handwoven in Barpali village using organic dyes and high-twist handspun cotton yarns. Features the iconic triangular temple border (Phoda Kumbha) requiring double shuttle interlacing.",
    price: "₹ 8,900",
    mrp: "₹ 12,500",
    weave: "Single Ikat Cotton",
    time: "12 Days Handweaving",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    yarnType: "80s Handspun Cotton",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.8 (15 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-104",
    slug: "bargarh-certified-silk-pasapalli-pata",
    title: "Bhulia Hub Certified Silk Pasapalli Pata Saree",
    category: "Silk Masterpieces",
    desc: "Double ikat pure silk pata, certified by Bhulia Hub inspection specialists.",
    longDesc: "A masterpiece of double ikat silk Pasapalli pata, pre-audited and certified at the Bargarh Phygital Hub. Shipped under double security.",
    price: "₹ 28,000",
    mrp: "₹ 34,000",
    weave: "Double Ikat Silk",
    time: "Bargarh Hub Ready",
    cluster: "Bargarh Cluster",
    village: "Barpali, Bargarh",
    yarnType: "3-Ply Silk",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.9 (8 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  },
  {
    id: "SAR-105",
    slug: "bomkai-cotton-daily-drape-saree",
    title: "Bomkai Cotton Daily Drape Saree",
    category: "Cotton Classics",
    desc: "Lightweight premium handspun cotton Bomkai with classic thread borders.",
    longDesc: "A beautiful everyday cotton drape showcasing high-contrast thread panels, ideal for daily elegance and extreme breathability.",
    price: "₹ 6,500",
    mrp: "₹ 8,000",
    weave: "Bomkai Cotton",
    time: "Sonepur Hub Ready",
    cluster: "Sonepur Cluster",
    village: "Sonepur Town",
    yarnType: "100% Handspun Cotton",
    isBhuliaVerified: true,
    escrowStatus: "100% Escrow Protected Payouts Enabled",
    rating: "4.8 (11 Reviews)",
    img: "/bhulia-hero.png",
    inStock: true
  }
];
