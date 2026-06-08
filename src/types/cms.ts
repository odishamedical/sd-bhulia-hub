export type PageType = "homepage" | "store" | "weaver" | "product" | "custom";
export type PageStatus = "draft" | "published" | "premium_template";
export type AspectRatio = "square" | "widescreen" | "portrait";

export interface GlobalTheme {
  backgroundColor?: string;
  headingColor?: string;
  textColor?: string;
  ticketColor?: string;
}

export interface CMSColumn {
  id: string;
  type: "ad" | "products";
  
  // Ad Specific
  bannerImage?: string;
  bannerText?: string;
  bannerLink?: string;
  
  // Product Specific
  category?: string;
  productMaterial?: string;
  productDesign?: string;
  vendorId?: string;
  productLimit?: number;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  discountOnly?: boolean;
}

export interface CMSRow {
  id: string;
  type: "hero" | "multi_banner" | "split_banner_products" | "image_grid" | "products" | "adsense" | "banner" | "testimonials";
  
  // Local Theme Override
  themeOverride?: GlobalTheme;

  // Generic Fields
  title?: string;
  hideTitle?: boolean;
  
  // Hero Fields
  heroLayout?: "full" | "split_75_25";
  heroRightContentType?: "ad" | "products"; // Determines what shows in the 25%
  heroImages?: string[]; // Multiple images for slider
  heroRightImage?: string; // 25% ad image
  heroRightLink?: string; // 25% ad link
  heroHeadline?: string;
  heroSubheadline?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  aspectRatio?: AspectRatio;
  
  // Multi Banner Fields
  bannerColumns?: 1 | 2 | 3;
  banners?: Array<{ image: string; link: string; text?: string }>;
  
  // Split Banner & Products Fields (Legacy)
  bannerPosition?: "left" | "right";
  bannerImage?: string;
  bannerText?: string;
  bannerLink?: string;

  // Split Banner & Products Fields (Modular Grid)
  splitColumnsCount?: 2 | 3 | 4;
  splitColumns?: CMSColumn[];
  productLimit?: number;

  // Image Grid Fields
  images?: Array<{ image: string; link?: string; caption?: string }>;

  // Product Grid Fields (Advanced Filters)
  category?: string;
  productMaterial?: string;
  productDesign?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  discountOnly?: boolean;
  flashSaleEndTime?: string; // ISO string

  // AdSense
  htmlCode?: string;

  // Testimonials
  testimonials?: Array<{ id: string; text: string; authorName: string; rating: number; avatar?: string }>;
}

export interface PlatformPage {
  id?: string;
  title: string;
  type: PageType;
  status: PageStatus;
  theme: GlobalTheme;
  rows: CMSRow[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ActiveRoutes {
  activeHomepageId?: string;
  defaultStoreTemplateId?: string;
  defaultWeaverTemplateId?: string;
  defaultProductTemplateId?: string;
}

export interface AdCampaign {
  id?: string;
  title: string;
  type: "image" | "adsense";
  content: string; // Image URL or HTML Code
  linkUrl?: string; // Where the image clicks to
  placement: "homepage_top" | "homepage_middle" | "sidebar" | "content_top" | "content_bottom";
  
  // Advanced Targeting
  targetAudience: "global" | "weavers" | "shops" | "products";
  targetSpecificIds: string[]; // Array of IDs. e.g., ["all"], ["silk-masterpieces"], ["bargarh-weavers"], ["prod-123", "prod-456"]
  targetCategory?: string;
  targetMaterial?: string;
  targetDesign?: string;
  
  status: "active" | "paused";
  impressions: number;
  clicks: number;
  createdAt?: any;
  updatedAt?: any;
}
