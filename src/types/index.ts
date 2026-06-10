export interface BaseDocument {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User extends BaseDocument {
  name: string;
  email: string;
  role: string;
  status: string;
  permissions?: {
    products?: boolean;
    orders?: boolean;
    marketing?: boolean;
    finance?: boolean;
    support?: boolean;
    staff?: boolean;
  };
  phone?: string;
  businessName?: string;
  aadhaarNumber?: string;
  // --- Vanity URL Monetization ---
  slug?: string; // The SEO base slug (e.g., shyam-dash-304)
  subscriptionTier?: "free" | "professional" | "premium" | "enterprise";
  customDomain?: string; // Premium/Enterprise custom domain mapping
  vanityUrlActive?: boolean;
}

export interface Review extends BaseDocument {
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: string;
  date: string;
}

export interface Product extends BaseDocument {
  title: string;
  weaverName: string;
  status: string;
  giTagStatus: string;
  stock: number;
  price: number;
  image?: string;
  certUpload?: string;
}

export interface Ticket extends BaseDocument {
  subject: string;
  customerName: string;
  status: string;
  priority: string;
  date: string;
  lastMessage: string;
}

export interface Order extends BaseDocument {
  customerName: string;
  productTitle: string;
  amount: number | string;
  status: string;
  date: string;
  paymentStatus?: string;
  returnReason?: string;
  weaverName?: string;
  deliveryStatus?: string;
  lockedOn?: string;
  awb?: string;
  courier?: string;
  destination?: string;
  lastUpdate?: string;
}

export interface Cart extends BaseDocument {
  customerName: string;
  customerEmail: string;
  items: string[];
  totalValue: string | number;
  abandonedAt: string;
  reminderSent: boolean;
}

export interface Subscription extends BaseDocument {
  franchiseName: string;
  plan: string;
  amount: number;
  billingCycle: string;
  status: string;
  nextBilling: string;
}

export interface ApiKey extends BaseDocument {
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
}

export interface Webhook extends BaseDocument {
  endpoint: string;
  event: string;
  active: boolean;
}
