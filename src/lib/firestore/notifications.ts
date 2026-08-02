import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export interface ShopNotification {
  id?: string;
  shopId: string;
  type: 'approved' | 'rejected' | 'info_requested' | 'mapped';
  message: string;
  isRead: boolean;
  createdAt: any;
}

export const addNotification = async (shopId: string, type: ShopNotification['type'], message: string) => {
  if (!shopId) return;
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      shopId,
      type,
      message,
      isRead: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error adding notification: ", error);
  }
};

export const getShopNotifications = async (shopId: string): Promise<ShopNotification[]> => {
  if (!shopId) return [];
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef, 
      where("shopId", "==", shopId)
    );
    const querySnapshot = await getDocs(q);
    
    // Sort manually since we might not have a composite index
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ShopNotification[];
    
    return notifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching notifications: ", error);
    return [];
  }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.error("Error updating notification: ", error);
  }
};
