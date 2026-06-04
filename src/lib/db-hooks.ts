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

export interface Store {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  heroImg?: string;
  badge: string;
  phone: string;
  whatsapp: string;
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

export interface Franchise {
  id: string;
  slug: string;
  name: string;
  city: string;
  phone: string;
  whatsapp: string;
  address: string;
  img: string;
  tier: "Silver" | "Gold" | "Diamond";
  status: "pending_approval" | "approved";
  invitedCount: number;
  totalSales: number;
  commissionEarned: number;
  userId?: string;
  userEmail?: string;
  pendingChanges?: any;
}

export interface Order {
  id: string;
  orderId: string;
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
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
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

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "stores"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Store[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Store);
      });
      setStores(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stores: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { stores, loading };
}

export function useFranchises() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "franchises"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Franchise[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Franchise);
      });
      setFranchises(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching franchises: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { franchises, loading };
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

export function useProductBySlug(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
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

export function useStoreBySlug(slug: string) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const q = query(collection(db, "stores"), where("slug", "==", slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setStore({ id: doc.id, ...doc.data() } as Store);
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

  return { store, loading };
}

export function useFranchiseBySlug(slug: string) {
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const q = query(collection(db, "franchises"), where("slug", "==", slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setFranchise({ id: doc.id, ...doc.data() } as Franchise);
      } else {
        setFranchise(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching franchise by slug: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { franchise, loading };
}

// ============================================================================
// CREATE / UPDATE / DELETE FUNCTIONS
// ============================================================================

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

export async function addStore(store: Partial<Omit<Store, 'id'>>, customId?: string) {
  try {
    const docRef = customId ? doc(db, "stores", customId) : doc(collection(db, "stores"));
    await setDoc(docRef, store);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding store:", error);
    return { success: false, error };
  }
}

export async function deleteStore(id: string) {
  try {
    await deleteDoc(doc(db, "stores", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting store:", error);
    return { success: false, error };
  }
}

export async function addFranchise(franchise: Partial<Omit<Franchise, 'id'>>, customId?: string) {
  try {
    const docRef = customId ? doc(db, "franchises", customId) : doc(collection(db, "franchises"));
    await setDoc(docRef, franchise);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding franchise:", error);
    return { success: false, error };
  }
}

export async function deleteFranchise(id: string) {
  try {
    await deleteDoc(doc(db, "franchises", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting franchise:", error);
    return { success: false, error };
  }
}

export async function updateDocumentStatus(collectionName: "weavers" | "stores" | "franchises" | "products", id: string, updates: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    return { success: false, error };
  }
}

export async function approveFranchiseAndUserRole(franchiseId: string, userId?: string) {
  try {
    const franchiseRef = doc(db, "franchises", franchiseId);
    await updateDoc(franchiseRef, { status: "approved" });
    
    if (userId && userId !== "demo_user") {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: "franchisee" });
    }
    return { success: true };
  } catch (error) {
    console.error("Error approving franchise:", error);
    return { success: false, error };
  }
}

export async function addOrder(order: Partial<Omit<Order, 'id'>>) {
  try {
    const docRef = doc(collection(db, "orders"));
    await setDoc(docRef, { ...order, id: docRef.id });
    
    // Check if referralId exists to increment franchise promoter stats
    if (order.referralId) {
      const franchiseRef = doc(db, "franchises", order.referralId);
      const franchiseDoc = await getDoc(franchiseRef);
      
      if (franchiseDoc.exists()) {
        const franchiseData = franchiseDoc.data();
        const priceNum = parseInt(order.productPrice?.replace(/[^0-9]/g, '') || "0");
        const qty = order.quantity || 1;
        const totalCost = priceNum * qty;
        const commission = Math.round(totalCost * 0.05); // 5% commission rate
        
        const newTotalSales = (franchiseData.totalSales || 0) + 1;
        const newTier = (franchiseData.tier === "Silver" && newTotalSales >= 50) ? "Gold" : franchiseData.tier;

        await updateDoc(franchiseRef, {
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
