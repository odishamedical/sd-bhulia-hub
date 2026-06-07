export type PageType = "homepage" | "store" | "weaver" | "product" | "custom";
export type PageStatus = "draft" | "published" | "premium_template";
export type AspectRatio = "square" | "widescreen" | "portrait";

export interface GlobalTheme {
  backgroundColor?: string;
  headingColor?: string;
  textColor?: string;
  ticketColor?: string;
}

export interface CMSRow {
  id: string;
  type: "hero" | "multi_banner" | "split_banner_products" | "image_grid" | "products" | "adsense" | "banner";
  
  // Local Theme Override
  themeOverride?: GlobalTheme;

  // Generic Fields
  title?: string;
  
  // Hero Fields
  heroImage?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  aspectRatio?: AspectRatio;
  
  // Multi Banner Fields
  bannerColumns?: 1 | 2 | 3;
  banners?: Array<{ image: string; link: string; text?: string }>;
  
  // Split Layout Fields
  bannerPosition?: "left" | "right";
  bannerImage?: string;
  bannerLink?: string;
  bannerText?: string;
  productLimit?: number;

  // Image Grid Fields
  images?: Array<{ image: string; link?: string; caption?: string }>;

  // Product Grid Fields (Advanced Filters)
  category?: string;
  productMaterial?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  discountOnly?: boolean;

  // AdSense
  htmlCode?: string;
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
