import React, { useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageCropperModal from "@/components/ImageCropperModal";
import Image from "next/image";

interface ListProductProps {
  franchiseId: string;
}

export default function ListProduct({ franchiseId }: ListProductProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Cotton Classics",
    weave: "Sambalpuri",
    fabricPurity: "100% Pure Cotton",
    threadCount: "120x120",
    dimensions: "5.5m Saree + 0.8m Blouse Piece",
    description: "",
    handloomMark: ""
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (images.length >= 5) {
        alert("You can only upload up to 5 product images.");
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
      const storageRef = ref(storage, `products/temp_${Date.now()}.jpg`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);
      setImages([...images, downloadURL]);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    setLoading(true);

    try {
      await addDoc(collection(db, "products"), {
        ...formData,
        images,
        sellerId: franchiseId,
        status: "pending_approval",
        createdAt: serverTimestamp()
      });
      alert("Product Submitted Successfully! It is now pending QC approval by our Hub Admins.");
      // Reset form
      setFormData({
        title: "",
        price: "",
        category: "Cotton Classics",
        weave: "Sambalpuri",
        fabricPurity: "100% Pure Cotton",
        threadCount: "120x120",
        dimensions: "5.5m Saree + 0.8m Blouse Piece",
        description: "",
        handloomMark: ""
      });
      setImages([]);
    } catch (err) {
      console.error("Error submitting product", err);
      alert("Error submitting product.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-serif font-bold text-[#C5A059] mb-2">List New Product</h2>
        <p className="text-xs text-gray-300 leading-relaxed mb-6">
          Upload products to the Bhulia Hub network. All listings are subject to strict GI-Tag and Quality Check (QC) verification by the Admin Hub before they are published to buyers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-[#C5A059]/30 pb-2">1. Product Imagery</h3>
            <p className="text-[10px] text-gray-400">Upload up to 5 images. A portrait 9:16 aspect ratio will be applied to look beautiful on mobile devices.</p>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-[170px] shrink-0 rounded-xl overflow-hidden border border-[#C5A059]/40 group">
                  <Image src={img} alt="Product" fill className="object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-900 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-xs">✕</button>
                </div>
              ))}
              {images.length < 5 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-[170px] shrink-0 rounded-xl border-2 border-dashed border-[#C5A059]/40 flex flex-col items-center justify-center cursor-pointer hover:bg-[#C5A059]/10 transition-colors"
                >
                  <span className="text-xl mb-1">📸</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059] text-center px-2">Add Image</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-[#C5A059]/30 pb-2">2. Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Product Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" placeholder="e.g. Pasapalli Silk Pata" />
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Pricing (₹)</label>
                <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" placeholder="e.g. ₹ 24,500" />
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]">
                  <option value="Cotton Classics">Cotton Classics</option>
                  <option value="Silk Masterpieces">Silk Masterpieces</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Weave Type</label>
                <input required type="text" value={formData.weave} onChange={e => setFormData({...formData, weave: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-[#C5A059]/30 pb-2">3. Quality Check (QC) Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Fabric Purity</label>
                <input required type="text" value={formData.fabricPurity} onChange={e => setFormData({...formData, fabricPurity: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" />
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Thread Count</label>
                <input required type="text" value={formData.threadCount} onChange={e => setFormData({...formData, threadCount: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" />
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Dimensions</label>
                <input required type="text" value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" />
              </div>
              <div>
                <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Handloom/Silk Mark ID (Optional)</label>
                <input type="text" value={formData.handloomMark} onChange={e => setFormData({...formData, handloomMark: e.target.value})} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" placeholder="e.g. HM-293819" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-1">Full Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#C5A059]" placeholder="Write about the design, heritage, and colors..."></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button disabled={loading} type="submit" className="px-8 py-3 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg disabled:opacity-50">
              {loading ? "Uploading..." : "Submit for Verification"}
            </button>
          </div>

        </form>
      </div>

      {isCropping && selectedImageSrc && (
        <ImageCropperModal
          imageSrc={selectedImageSrc}
          aspect={9 / 16}
          onClose={() => { setIsCropping(false); setSelectedImageSrc(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
