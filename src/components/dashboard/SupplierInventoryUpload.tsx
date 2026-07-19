"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadBase64ToStorage } from "@/lib/storageUtils";
import ImageUploader from "@/components/ImageUploader";

interface SupplierInventoryUploadProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
}

export default function SupplierInventoryUpload({ isOpen, onClose, sellerId }: SupplierInventoryUploadProps) {
  const [materialName, setMaterialName] = useState("");
  const [category, setCategory] = useState("Cotton Yarn");
  const [color, setColor] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [moqKg, setMoqKg] = useState("10");
  const [stockKg, setStockKg] = useState("100");
  const [desc, setDesc] = useState("");
  const [productImage, setProductImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!productImage) { alert("Main image is required."); return; }
    
    setIsUploading(true);
    try {
      const parsedPrice = Number(pricePerKg.toString().replace(/[^0-9.]/g, '')) || 0;
      const imgUrl = await uploadBase64ToStorage(productImage, `materials/${auth.currentUser.uid}`);
      
      const productData = {
        title: materialName,
        slug: String(materialName).toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 1000),
        category: category,
        color: color,
        pricePerKg: parsedPrice,
        commercialPrice: parsedPrice, // for compatibility
        availableForWholesale: true,
        availableForRetail: false,
        moqKg: Number(moqKg),
        stockKg: Number(stockKg),
        desc: desc,
        img: imgUrl,
        images: [imgUrl],
        sellerId,
        sellerType: "supplier",
        status: "approved",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "products"), productData);
      
      alert("Raw Material uploaded successfully!");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error uploading.");
    }
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        <div className="bg-[#051815] px-8 py-6 flex justify-between items-center text-white">
          <h2 className="text-2xl font-black font-serif">Upload Raw Material Inventory</h2>
          <button type="button" onClick={onClose} className="text-white hover:text-[#C5A059] font-bold text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleUpload} className="p-8 space-y-8 h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Material Title *</label>
                <input type="text" value={materialName} onChange={e => setMaterialName(e.target.value)} required placeholder="e.g. Premium Silk Yarn" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059] bg-white">
                    <option value="Cotton Yarn">Cotton Yarn</option>
                    <option value="Silk Yarn">Silk Yarn</option>
                    <option value="Dyes & Colors">Dyes & Colors</option>
                    <option value="Zari">Zari (Gold/Silver)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Color/Dye</label>
                  <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Royal Blue" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price Per Kg (₹) *</label>
                  <input type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} required placeholder="3500" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Min. Order (MOQ) Kg</label>
                  <input type="number" value={moqKg} onChange={e => setMoqKg(e.target.value)} required placeholder="10" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Total Stock Available (Kg) *</label>
                <input type="number" value={stockKg} onChange={e => setStockKg(e.target.value)} required placeholder="500" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059]" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description / Grade</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059] resize-none" placeholder="Enter yarn grade, quality, ply, etc." />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Material Photo</h3>
              <ImageUploader label="Main Photo" value={productImage} onChange={setProductImage} aspectRatio="square" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={isUploading} className="bg-[#051815] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0a2f29] transition-colors disabled:opacity-50">
              {isUploading ? "Uploading..." : "Save Material to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
