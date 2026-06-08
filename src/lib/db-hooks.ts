import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, doc, onSnapshot, query, where, setDoc, deleteDoc, updateDoc, getDoc, increment } from "firebase/firestore";
import { Product } from "./products";

// ============================================================================
// INTERFACES & SCHEMAS
// ============================================================================

export interface Weaver {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  heroImg?: string;
  badge: string;
  phone: string;
  whatsapp: string;
  country: string;
  state: string;
  district: string;
  block: string;
  townVillage: string;
  pin: string;
  address: string;
  tier: "Silver" | "Gold" | "Diamond" | "Master";
  status: "pending_approval" | "approved";
  layoutConfig?: {
    sidebarPosition: "Left" | "Right" | "Hidden";
    heroEnabled: boolean;
    gridStyle: "2-Column" | "3-Column";
  };
  subscription?: {
    status: "active" | "free_trial" | "expired";
    uploadLimit: number;
    commissionRate: number;
    expiresAt?: string;
  };
  pendingChanges?: any;
}

export interface Vendor {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  heroImg?: string;
  badge: string;
  phone: string;
  whatsapp: string;
  country: string;
  state: string;
  district: string;
  block: string;
  townVillage: string;
  pin: string;
  address: string;
  tier: "Silver" | "Gold" | "Diamond";
  status: "pending_approval" | "approved";
  productLimit: number; // Legacy limit
  subscription?: {
    status: "active" | "free_trial" | "expired";
    uploadLimit: number;
    commissionRate: number;
    expiresAt?: string;
  };
  pendingChanges?: any;
}


export interface Order {
  id: string;
  orderId: string;
  parentOrderId?: string;
  sellerId?: string;
  sellerType?: string;
  productName: string;
  productPrice: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  referralId: string | null;
  proxyBuyerId: string | null;
  paymentMode: string;
  paymentStatus: string;
  logisticsStatus: string;
  qcStatus: "Pending Sourcing" | "QC Passed";
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  state: string;
  district: string;
  address: string;
  pin: string;
  createdAt: string;
  totalSales?: number;
  commissionEarned?: number;
  userId?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Reseller {
  id: string;
  slug?: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  state: string;
  district: string;
  address: string;
  pin: string;
  referralId: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  commissionRate: number;
  status: "active" | "inactive";
  createdAt: string;
}

// ============================================================================
// HOOKS (REALTIME SYNC)
// ============================================================================

export function useAuthUsers() {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: AuthUser[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as AuthUser);
      });
      setAuthUsers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching auth users: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { authUsers, loading };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Product[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
}

export function useProductBySlug(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setProduct({ id: doc.id, ...doc.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching product by slug: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { product, loading };
}

export function useProductById(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, "products", id), (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching product by id: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  return { product, loading };
}

export function useWeavers() {
  const [weavers, setWeavers] = useState<Weaver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "weavers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Weaver[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Weaver);
      });
      setWeavers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching weavers: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { weavers, loading };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "customers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Customer[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching customers: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { customers, loading };
}

export function useResellers() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "resellers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Reseller[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Reseller);
      });
      setResellers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching resellers: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { resellers, loading };
}

export function useVendors() {
  const [vendors, setStores] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "vendors"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Vendor[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Vendor);
      });
      setStores(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vendors: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { vendors, loading };
}


export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Order[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { orders, loading };
}

export interface Transaction {
  id: string;
  type: string;
  resellerId?: string;
  orderId?: string;
  amount: number;
  status: "pending_escrow" | "completed" | "paid_out";
  createdAt: any;
  completedAt?: any;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Transaction[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { transactions, loading };
}

export function useWeaverBySlug(slug: string) {
  const [weaver, setWeaver] = useState<Weaver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const q = query(collection(db, "weavers"), where("slug", "==", slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setWeaver({ id: doc.id, ...doc.data() } as Weaver);
      } else {
        setWeaver(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching weaver by slug: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { weaver, loading };
}

export function useVendorBySlug(slug: string) {
  const [vendor, setStore] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const q = query(collection(db, "vendors"), where("slug", "==", slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setStore({ id: doc.id, ...doc.data() } as Vendor);
      } else {
        setStore(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching store by slug: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { vendor, loading };
}


// ============================================================================
// CREATE / UPDATE / DELETE FUNCTIONS
// ============================================================================

export async function addReseller(data: Omit<Reseller, "id" | "referralId" | "tier" | "createdAt">) {
  const docRef = doc(collection(db, "resellers"));
  const referralId = `SDR-${Math.floor(1000 + Math.random() * 9000)}`;
  await setDoc(docRef, { ...data, referralId, tier: "Bronze", createdAt: new Date().toISOString() });
  return docRef.id;
}

export async function addCustomer(data: Omit<Customer, "id" | "createdAt">) {
  const docRef = doc(collection(db, "customers"));
  await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
  return docRef.id;
}

export async function addProduct(product: Partial<Omit<Product, 'id'>>, customId?: string) {
  try {
    const docRef = customId ? doc(db, "products", customId) : doc(collection(db, "products"));
    await setDoc(docRef, product);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding product:", error);
    return { success: false, error };
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, "products", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error };
  }
}

export async function addWeaver(weaver: Partial<Omit<Weaver, 'id'>>, customId?: string) {
  try {
    const docRef = customId ? doc(db, "weavers", customId) : doc(collection(db, "weavers"));
    await setDoc(docRef, weaver);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding weaver:", error);
    return { success: false, error };
  }
}

export async function deleteWeaver(id: string) {
  try {
    await deleteDoc(doc(db, "weavers", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting weaver:", error);
    return { success: false, error };
  }
}

export async function addVendor(store: Partial<Omit<Store, 'id'>>, customId?: string) {
  try {
    const docRef = customId ? doc(db, "vendors", customId) : doc(collection(db, "vendors"));
    await setDoc(docRef, store);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding store:", error);
    return { success: false, error };
  }
}

export async function deleteVendor(id: string) {
  try {
    await deleteDoc(doc(db, "vendors", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting store:", error);
    return { success: false, error };
  }
}

export async function updateDocumentStatus(collectionName: "weavers" | "vendors" | "resellers" | "products", id: string, updates: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    return { success: false, error };
  }
}

export async function deleteReseller(id: string) {
  try {
    await deleteDoc(doc(db, "resellers", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting reseller:", error);
    return { success: false, error };
  }
}

export async function approveResellerAndUserRole(resellerId: string, userId?: string) {
  try {
    const resellerRef = doc(db, "resellers", resellerId);
    await updateDoc(resellerRef, { status: "approved" });
    
    if (userId && userId !== "demo_user") {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: "resellere" });
    }
    return { success: true };
  } catch (error) {
    console.error("Error approving reseller:", error);
    return { success: false, error };
  }
}

export async function addOrder(order: Partial<Omit<Order, 'id'>>) {
  try {
    const docRef = doc(collection(db, "orders"));
    await setDoc(docRef, { ...order, id: docRef.id });
    
    // Check if referralId exists to increment reseller promoter stats
    if (order.referralId) {
      const resellerRef = doc(db, "resellers", order.referralId);
      const resellerDoc = await getDoc(resellerRef);
      
      if (resellerDoc.exists()) {
        const resellerData = resellerDoc.data();
        const priceNum = parseInt(order.productPrice?.replace(/[^0-9]/g, '') || "0");
        const qty = order.quantity || 1;
        const totalCost = priceNum * qty;
        const commission = Math.round(totalCost * 0.05); // 5% commission rate
        
        const newTotalSales = (resellerData.totalSales || 0) + 1;
        const newTier = (resellerData.tier === "Silver" && newTotalSales >= 50) ? "Gold" : resellerData.tier;

        await updateDoc(resellerRef, {
          totalSales: increment(1),
          commissionEarned: increment(commission),
          tier: newTier
        });
        console.log(`Updated promoter stats: sales=${newTotalSales}, commission=+₹${commission}, tier=${newTier}`);
      }
    }
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding order:", error);
    return { success: false, error };
  }
}

export async function deleteUserRecord(role: string, id: string) {
  try {
    let collectionName = "";
    if (role === "weaver") collectionName = "weavers";
    else if (role === "shop" || role === "vendor") collectionName = "vendors";
    else if (role === "customer") collectionName = "customers";
    else if (role === "reseller") collectionName = "resellers";
    else if (role === "resellere" || role === "reseller") collectionName = "resellers";
    else collectionName = "users"; // Fallback to auth users collection

    if (collectionName) {
      await deleteDoc(doc(db, collectionName, id));
    }
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user from ${role}:`, error);
    return { success: false, error };
  }
}

export async function suspendUserRecord(role: string, id: string) {
  try {
    let collectionName = "";
    if (role === "weaver") collectionName = "weavers";
    else if (role === "shop" || role === "vendor") collectionName = "vendors";
    else if (role === "customer") collectionName = "customers";
    else if (role === "reseller") collectionName = "resellers";
    else if (role === "resellere" || role === "reseller") collectionName = "resellers";
    else collectionName = "users"; // Fallback to auth users collection

    if (collectionName) {
      await updateDoc(doc(db, collectionName, id), { status: "suspended" });
    }
    
    // Also try to suspend their primary Auth record if it exists
    try {
      await updateDoc(doc(db, "users", id), { status: "suspended" });
    } catch(e) {
      // It's okay if they don't have a record in the 'users' mirror collection
    }

    return { success: true };
  } catch (error) {
    console.error(`Error suspending user from ${role}:`, error);
    return { success: false, error };
  }
}

// ============================================================================
// CONVERT USER ROLE
// ============================================================================

export async function convertUserRole(userId: string, userEmail: string, userName: string, newRole: "weaver" | "shop" | "reseller" | "customer") {
  try {
    // 1. Update the role in the 'users' collection so they get the correct dashboard
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });

    // 2. Auto-generate a basic profile in the corresponding collection
    const generatedSlug = userName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + userId.slice(0, 4).toLowerCase();

    if (newRole === "weaver") {
      await setDoc(doc(db, "weavers", userId), {
        slug: generatedSlug,
        title: userName,
        desc: "Newly registered weaver.",
        img: "/bhulia-hero.png",
        badge: "Odishan Master Weaver",
        phone: "N/A",
        whatsapp: "N/A",
        address: "N/A, Odisha",
        tier: "Silver",
        status: "approved",
        subscription: { status: "free_trial", uploadLimit: 10, commissionRate: 15 }
      });
    } else if (newRole === "shop") {
      await setDoc(doc(db, "vendors", userId), {
        slug: generatedSlug,
        title: userName,
        desc: "Newly registered retail store.",
        img: "/bhulia-hero.png",
        badge: "Verified Vendor",
        phone: "N/A",
        whatsapp: "N/A",
        address: "N/A",
        tier: "Silver",
        status: "approved",
        productLimit: 10,
        subscription: { status: "free_trial", uploadLimit: 10, commissionRate: 15 }
      });
    } else if (newRole === "reseller") {
      const referralId = `SDR-${Math.floor(1000 + Math.random() * 9000)}`;
      await setDoc(doc(db, "resellers", userId), {
        name: userName,
        email: userEmail || "N/A",
        phone: "N/A",
        whatsapp: "N/A",
        country: "India",
        state: "N/A",
        district: "N/A",
        address: "N/A",
        pin: "N/A",
        referralId,
        tier: "Bronze",
        commissionRate: 15,
        status: "active",
        createdAt: new Date().toISOString()
      });
    } else if (newRole === "customer") {
      await setDoc(doc(db, "customers", userId), {
        name: userName,
        email: userEmail || "N/A",
        phone: "N/A",
        whatsapp: "N/A",
        country: "India",
        state: "N/A",
        district: "N/A",
        address: "N/A",
        pin: "N/A",
        createdAt: new Date().toISOString()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error converting user role:", error);
    return { success: false, error };
  }
}

// ============================================================================
// GLOBAL SETTINGS HOOKS
// ============================================================================

export interface GlobalSettings {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  allowNewsletterSignup?: boolean;
}

export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      } else {
        setSettings({ maintenanceMode: false });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { settings, loading };
}

export async function updateGlobalSettings(data: Partial<GlobalSettings>) {
  try {
    await setDoc(doc(db, "settings", "global"), data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating global settings:", error);
    return { success: false, error };
  }
}
