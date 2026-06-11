import { storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export const uploadBase64ToStorage = async (base64Str: string | null, folder: string) => {
  if (!base64Str) return "";
  if (base64Str.startsWith("http")) return base64Str; // Already uploaded
  if (!base64Str.startsWith("data:image")) return base64Str;

  try {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    await uploadString(storageRef, base64Str, 'data_url');
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.error("Storage upload failed", e);
    return "";
  }
};
