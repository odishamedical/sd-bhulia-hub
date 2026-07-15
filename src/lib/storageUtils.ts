import { storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export const uploadBase64ToStorage = async (base64Str: string | null, folder: string) => {
  if (!base64Str) return "";
  if (base64Str.startsWith("http")) return base64Str; // Already uploaded
  if (!base64Str.startsWith("data:image")) return base64Str;

  try {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // Add timeout promise to prevent hanging
    const uploadPromise = uploadString(storageRef, base64Str, 'data_url');
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout")), 15000));
    
    await Promise.race([uploadPromise, timeoutPromise]);
    
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.error("Storage upload failed", e);
    return "";
  }
};
