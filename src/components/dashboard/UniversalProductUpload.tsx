"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import ImageUploader from "@/components/ImageUploader";
import { uploadBase64ToStorage } from "@/lib/storageUtils";

interface UniversalProductUploadProps {
  isOpen: boolean;
  onClose: () => void;
  sellerRole: "weaver" | "shop" | "wholesaler" | "supplier" | string;
  sellerId: string;
  isAutoApprovedUser?: boolean;
}

export default function UniversalProductUpload({ isOpen, onClose, sellerRole, sellerId, isAutoApprovedUser = false }: UniversalProductUploadProps) {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productMrp, setProductMrp] = useState("");
  const [commercialPrice, setCommercialPrice] = useState("");
  const [availableForRetail, setAvailableForRetail] = useState(true);
  const [availableForWholesale, setAvailableForWholesale] = useState(false);
  const [wholesaleTerms, setWholesaleTerms] = useState("");
  const [allowResellerMargin, setAllowResellerMargin] = useState(false);
  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);
  const [productCategory, setProductCategory] = useState("Saree");
  const [productDesc, setProductDesc] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [productImage, setProductImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!productImage) { alert("Main image is required."); return; }
    
    setIsUploading(true);
    try {
      const parsedPrice = Number(productPrice.toString().replace(/[^0-9.]/g, '')) || 0;
      const parsedMrp = Number(productMrp.toString().replace(/[^0-9.]/g, '')) || 0;
      const parsedCommercialPrice = Number(commercialPrice.toString().replace(/[^0-9.]/g, '')) || 0;

      const imgUrl = await uploadBase64ToStorage(productImage, `products/${auth.currentUser.uid}`);
      
      const productData = {
        title: productName,
        slug: String(productName).toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 1000),
        price: parsedPrice,
        mrp: parsedMrp,
        availableForRetail,
        availableForWholesale,
        commercialPrice: parsedCommercialPrice,
        wholesaleTerms,
        category: productCategory,
        desc: productDesc,
        img: imgUrl,
        images: [imgUrl],
        stockQuantity: Number(stockQuantity),
        inStock: Number(stockQuantity) > 0,
        allowResellerMargin,
        resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,
        resellerPrice: allowResellerMargin ? String(Math.floor(parsedPrice * (1 - Number(resellerMarginPercentage) / 100))) : undefined,
        sellerId,
        sellerType: sellerRole,
        status: isAutoApprovedUser ? "approved" : "pending_approval",
        createdAt: serverTimestamp(),
        isBhuliaVerified: true,
      };

      await addDoc(collection(db, "products"), productData);
      
      alert("Product uploaded successfully!");
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
          <h2 className="text-2xl font-black font-serif">Upload B2B/Retail Product</h2>
          <button onClick={onClose} className="text-white hover:text-[#C5A059] font-bold text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleUpload} className="p-8 space-y-8 h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Title *</label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity *</label>
                  <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} required className="w-full border p-3 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full border p-3 rounded-xl">
                    <option value="Saree">Saree</option>
                    <option value="Suit">Suit</option>
                    <option value="Fabric">Fabric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full border p-3 rounded-xl" rows={3}></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Main Image *</label>
                <ImageUploader onImageCropped={setProductImage} aspect={9/16} />
              </div>
            </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-[#0B2B26] border-b pb-2">Pricing Engine Setup</h3>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input type="checkbox" checked={availableForRetail} onChange={e => setAvailableForRetail(e.target.checked)} className="w-5 h-5 accent-[#C5A059]" />
                  <span className="font-bold text-gray-900">Available for Retail (Single Piece)</span>
                </label>
                
                {availableForRetail && (
                  <div className="space-y-4 pl-8 border-l-2 border-[#C5A059]/20 ml-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">MSRP (₹) *</label>
                      <input type="number" value={productMrp} onChange={e => setProductMrp(e.target.value)} required className="w-full border-b border-gray-300 p-2 focus:border-[#C5A059] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Your Selling Price (₹) *</label>
                      <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} required className="w-full border-b border-gray-300 p-2 focus:border-[#C5A059] outline-none" />
                    </div>
                    
                    <label className="flex items-center gap-3 cursor-pointer mt-4">
                      <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="w-4 h-4 accent-green-600" />
                      <span className="text-sm font-bold text-green-700">Allow Resellers to Promote?</span>
                    </label>

                    {allowResellerMargin && (
                      <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                        <label className="block text-xs font-bold text-green-700 mb-2 uppercase">Reseller Discount ({resellerMarginPercentage}%)</label>
                        <input type="range" min="5" max="30" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Number(e.target.value))} className="w-full accent-green-600" />
                        <p className="text-[10px] text-green-600 mt-1">Guarantees min 5% discount for resellers.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input type="checkbox" checked={availableForWholesale} onChange={e => setAvailableForWholesale(e.target.checked)} className="w-5 h-5 accent-purple-600" />
                  <span className="font-bold text-purple-900">Available for B2B Wholesale (Bulk)</span>
                </label>

                {availableForWholesale && (
                  <div className="space-y-4 pl-8 border-l-2 border-purple-300 ml-2">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 uppercase">B2B Commercial Price (₹) *</label>
                      <input type="number" value={commercialPrice} onChange={e => setCommercialPrice(e.target.value)} required className="w-full border-b border-purple-300 bg-transparent p-2 focus:border-purple-600 outline-none text-purple-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700 uppercase">Wholesale Terms (MOQ, Dispatch) *</label>
                      <input type="text" value={wholesaleTerms} onChange={e => setWholesaleTerms(e.target.value)} required placeholder="e.g. Min 10 pieces, 15 days dispatch" className="w-full border-b border-purple-300 bg-transparent p-2 focus:border-purple-600 outline-none text-purple-900" />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
          
          <div className="pt-6 border-t flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isUploading} className="px-8 py-3 rounded-xl font-bold text-white bg-[#0B2B26] hover:bg-[#13403a] shadow-lg disabled:opacity-50 flex items-center gap-2">
              {isUploading ? "Uploading..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
