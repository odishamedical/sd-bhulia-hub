import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageCropperModal from "@/components/ImageCropperModal";
import Image from "next/image";

interface WorkspaceIdentityProps {
  franchiseId: string;
}

export default function WorkspaceIdentity({ franchiseId }: WorkspaceIdentityProps) {
  const [images, setImages] = useState<{ url: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!franchiseId) return;
      try {
        const docRef = await getDoc(doc(db, "franchises", franchiseId));
        if (docRef.exists()) {
          setImages(docRef.data().workspaceImages || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchImages();
  }, [franchiseId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (images.length >= 3) {
        alert("You can only upload up to 3 workspace images.");
        return;
      }
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImageSrc(reader.result?.toString() || "");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropping(false);
    setLoading(true);
    try {
      const { storage } = await import('@/lib/firebase');
      const storageRef = ref(storage, `franchises/${franchiseId}/workspace_${Date.now()}.jpg`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);
      
      const updatedImages = [...images, { url: downloadURL, description: "Workspace Image" }];
      await updateDoc(doc(db, "franchises", franchiseId), { workspaceImages: updatedImages });
      setImages(updatedImages);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateDescription = async (index: number, newDesc: string) => {
    const newImages = [...images];
    newImages[index].description = newDesc;
    setImages(newImages);
    try {
      await updateDoc(doc(db, "franchises", franchiseId), { workspaceImages: newImages });
    } catch (err) {
      console.error(err);
    }
  };

  const removeImage = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    try {
      await updateDoc(doc(db, "franchises", franchiseId), { workspaceImages: newImages });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && images.length === 0) return <div className="text-[#C5A059] animate-pulse">Loading Workspace...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-serif font-bold text-[#C5A059] mb-2">Storefront Branding</h2>
        <p className="text-xs text-gray-300 leading-relaxed mb-6">
          Upload up to 3 cover images or logos to build trust with buyers. These images are shown publicly when buyers visit your store profile.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div key={idx} className="space-y-3 bg-[#051815] p-3 rounded-2xl border border-[#C5A059]/20 relative group">
              <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-900 text-white w-6 h-6 rounded-full font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">✕</button>
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#C5A059]/30">
                <Image src={img.url} alt="Workspace" fill className="object-cover" />
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold">Image Description</label>
                <input 
                  type="text" 
                  value={img.description} 
                  onChange={(e) => updateDescription(idx, e.target.value)}
                  className="w-full mt-1 bg-transparent border-b border-[#C5A059]/40 text-white text-xs px-1 py-1 focus:outline-none focus:border-[#C5A059]"
                  placeholder="e.g. Master Weavers at work in Bargarh"
                />
              </div>
            </div>
          ))}

          {images.length < 3 && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#C5A059]/40 rounded-2xl flex flex-col items-center justify-center aspect-[16/9] cursor-pointer hover:bg-[#C5A059]/10 transition-colors"
            >
              <span className="text-3xl mb-2">📸</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">Upload Image</span>
            </div>
          )}
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
      </div>

      {isCropping && selectedImageSrc && (
        <ImageCropperModal
          imageSrc={selectedImageSrc}
          aspect={16 / 9}
          onClose={() => { setIsCropping(false); setSelectedImageSrc(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
