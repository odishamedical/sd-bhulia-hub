"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadBase64ToStorage } from "@/lib/storageUtils";
import ImageUploader from "@/components/ImageUploader";

interface WholesaleTier {
  minQty: number;
  price: number;
}

interface UnifiedProductUploadProps {
  isOpen: boolean;
  onClose: () => void;
  sellerRole: "weaver" | "store" | "wholesaler" | "supplier" | string;
  sellerId: string;
  isAutoApprovedUser?: boolean;
  storeName?: string;
  existingProduct?: any;
}

export default function UnifiedProductUpload({ 
  isOpen, 
  onClose, 
  sellerRole, 
  sellerId, 
  isAutoApprovedUser = false,
  storeName = "",
  existingProduct = null
}: UnifiedProductUploadProps) {
  const [uploadStep, setUploadStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Saree");
  const [originalWeaver, setOriginalWeaver] = useState(storeName);
  const [productPrice, setProductPrice] = useState("");
  const [productMrp, setProductMrp] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productLongDesc, setProductLongDesc] = useState("");

  const [material, setMaterial] = useState("");
  const [design, setDesign] = useState("");
  const [colorUse, setColorUse] = useState("");
  const [length, setLength] = useState("");
  const [hasBlouse, setHasBlouse] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(1);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [productImage, setProductImage] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [img2Caption, setImg2Caption] = useState("");
  const [img3Caption, setImg3Caption] = useState("");
  const [img4Caption, setImg4Caption] = useState("");

  // Advanced / B2B State
  const [availableForRetail, setAvailableForRetail] = useState(true);
  const [allowResellerMargin, setAllowResellerMargin] = useState(false);
  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);
  const [specialOfferTag, setSpecialOfferTag] = useState("");

  // Wholesaler Specific
  const [availableForWholesale, setAvailableForWholesale] = useState(sellerRole === 'wholesaler');
  const [wholesaleTerms, setWholesaleTerms] = useState("");
  const [wholesaleTiers, setWholesaleTiers] = useState<WholesaleTier[]>(
    sellerRole === 'wholesaler' ? [{ minQty: 5, price: 0 }] : []
  );

  useEffect(() => {
    if (existingProduct) {
      setProductName(existingProduct.title || "");
      setProductCategory(existingProduct.category || "Saree");
      setOriginalWeaver(existingProduct.weaverName || storeName);
      setProductPrice(existingProduct.price?.toString() || "");
      setProductMrp(existingProduct.mrp?.toString() || "");
      setProductDesc(existingProduct.desc || "");
      setProductLongDesc(existingProduct.longDesc || "");
      setMaterial(existingProduct.material || existingProduct.sareeType || "");
      setDesign(existingProduct.design || "");
      setColorUse(existingProduct.colorUse || "");
      setLength(existingProduct.length || "");
      setHasBlouse(existingProduct.hasBlouse || false);
      setStockQuantity(existingProduct.stockQuantity || 1);
      setYoutubeUrl(existingProduct.youtubeUrl || "");
      setProductImage(existingProduct.img || "");
      setImg2(existingProduct.img2 || "");
      setImg3(existingProduct.img3 || "");
      setImg4(existingProduct.img4 || "");
      setAvailableForRetail(existingProduct.availableForRetail !== false);
      setAllowResellerMargin(existingProduct.allowResellerMargin || false);
      setResellerMarginPercentage(existingProduct.resellerMarginPercentage || 5);
      setIsSpecialOffer(existingProduct.isSpecialOffer || false);
      setSpecialOfferTag(existingProduct.specialOfferTag || "");
      
      if (existingProduct.availableForWholesale) {
        setAvailableForWholesale(true);
        setWholesaleTerms(existingProduct.wholesaleTerms || "");
        if (existingProduct.wholesaleTiers && existingProduct.wholesaleTiers.length > 0) {
          setWholesaleTiers(existingProduct.wholesaleTiers);
        }
      }
    } else {
      // Load draft if not editing
      try {
        const draft = localStorage.getItem("sd_product_draft");
        if (draft && confirm("You have an unsaved product draft. Would you like to restore it?")) {
          const p = JSON.parse(draft);
          if(p.productName) setProductName(p.productName);
          if(p.productPrice) setProductPrice(p.productPrice);
          if(p.productMrp) setProductMrp(p.productMrp);
          if(p.productDesc) setProductDesc(p.productDesc);
          if(p.productLongDesc) setProductLongDesc(p.productLongDesc);
          if(p.productCategory) setProductCategory(p.productCategory);
          if(p.originalWeaver) setOriginalWeaver(p.originalWeaver);
          if(p.material) setMaterial(p.material);
          if(p.design) setDesign(p.design);
          if(p.colorUse) setColorUse(p.colorUse);
          if(p.length) setLength(p.length);
          if(p.hasBlouse !== undefined) setHasBlouse(p.hasBlouse);
          if(p.stockQuantity) setStockQuantity(p.stockQuantity);
          if(p.productImage) setProductImage(p.productImage);
          if(p.img2) setImg2(p.img2);
          if(p.img3) setImg3(p.img3);
          if(p.img4) setImg4(p.img4);
          if(p.youtubeUrl) setYoutubeUrl(p.youtubeUrl);
          if(p.wholesaleTerms) setWholesaleTerms(p.wholesaleTerms);
          if(p.availableForRetail !== undefined) setAvailableForRetail(p.availableForRetail);
          if(p.availableForWholesale !== undefined) setAvailableForWholesale(p.availableForWholesale);
          if(p.allowResellerMargin !== undefined) setAllowResellerMargin(p.allowResellerMargin);
          if(p.resellerMarginPercentage) setResellerMarginPercentage(p.resellerMarginPercentage);
          if(p.isSpecialOffer !== undefined) setIsSpecialOffer(p.isSpecialOffer);
          if(p.specialOfferTag) setSpecialOfferTag(p.specialOfferTag);
          if(p.wholesaleTiers) setWholesaleTiers(p.wholesaleTiers);
        }
      } catch (e) {}
    }
  }, [existingProduct, storeName]);

  const saveDraft = () => {
    if (existingProduct) return; // Don't draft if editing
    const draft = { productName, productPrice, availableForRetail, availableForWholesale, wholesaleTerms, productCategory, productDesc, stockQuantity, allowResellerMargin, resellerMarginPercentage, isSpecialOffer, specialOfferTag, productImage, img2, img3, img4, youtubeUrl, productMrp, productLongDesc, originalWeaver, material, design, colorUse, length, hasBlouse, wholesaleTiers };
    localStorage.setItem("sd_product_draft", JSON.stringify(draft));
    alert("Draft saved to browser!");
  };

  const handleAddTier = () => {
    const lastTier = wholesaleTiers[wholesaleTiers.length - 1];
    setWholesaleTiers([...wholesaleTiers, { minQty: lastTier ? lastTier.minQty + 5 : 5, price: 0 }]);
  };

  const handleRemoveTier = (index: number) => {
    setWholesaleTiers(wholesaleTiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: 'minQty' | 'price', value: number) => {
    const newTiers = [...wholesaleTiers];
    newTiers[index][field] = value;
    setWholesaleTiers(newTiers);
  };

  // Validate tiers enforce strict lower pricing for higher tiers
  const validateTiers = (): boolean => {
    if (!availableForWholesale || wholesaleTiers.length === 0) return true;
    
    // Sort tiers by quantity
    const sortedTiers = [...wholesaleTiers].sort((a, b) => a.minQty - b.minQty);
    
    for (let i = 1; i < sortedTiers.length; i++) {
      if (sortedTiers[i].minQty <= sortedTiers[i - 1].minQty) {
        alert("Each tier must have a strictly increasing minimum quantity.");
        return false;
      }
      if (sortedTiers[i].price >= sortedTiers[i - 1].price) {
        alert("Each higher quantity tier must have a strictly lower price per piece than the previous tier.");
        return false;
      }
    }
    
    // Check against retail price
    const parsedRetail = Number(productPrice.toString().replace(/[^0-9.]/g, '')) || 0;
    if (parsedRetail > 0 && sortedTiers[0].price >= parsedRetail) {
      alert("Wholesale tier 1 price must be strictly lower than the retail selling price.");
      return false;
    }
    
    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!productImage) { alert("Main image is required."); return; }
    
    if (!validateTiers()) return;

    setIsUploading(true);
    try {
      const parsedPrice = Number(productPrice.toString().replace(/[^0-9.]/g, '')) || 0;
      const parsedMrp = Number(productMrp.toString().replace(/[^0-9.]/g, '')) || 0;
      
      // Handle legacy single-price B2B for backwards compatibility if needed, but we prefer tiers
      const parsedCommercialPrice = wholesaleTiers.length > 0 ? wholesaleTiers[0].price : 0; 

      // Generate GI-Tracking Product ID
      const generateProductId = () => `BHL-${Math.floor(10000 + Math.random() * 90000)}`;
      const bhuliaProductId = existingProduct ? undefined : generateProductId();

      const img1Url = productImage.startsWith('data:') ? await uploadBase64ToStorage(productImage, `products/${auth.currentUser.uid}`) : productImage;
      const img2Url = img2.startsWith('data:') ? await uploadBase64ToStorage(img2, `products/${auth.currentUser.uid}`) : img2;
      const img3Url = img3.startsWith('data:') ? await uploadBase64ToStorage(img3, `products/${auth.currentUser.uid}`) : img3;
      const img4Url = img4.startsWith('data:') ? await uploadBase64ToStorage(img4, `products/${auth.currentUser.uid}`) : img4;

      const finalImages = [img1Url, img2Url, img3Url, img4Url].filter(Boolean);
      
      // Sort tiers before saving
      const sortedTiers = [...wholesaleTiers].sort((a, b) => a.minQty - b.minQty);

      const productData: any = {
        title: productName,
        slug: String(productName).toLowerCase().replace(/[^a-z0-9]+/g, "-") + (existingProduct ? "" : `-${Math.floor(Math.random() * 1000)}`),
        price: parsedPrice,
        mrp: parsedMrp,
        availableForRetail,
        availableForWholesale,
        commercialPrice: parsedCommercialPrice, // legacy support
        wholesaleTiers: availableForWholesale ? sortedTiers : [],
        wholesaleTerms: availableForWholesale ? wholesaleTerms : "",
        category: productCategory,
        desc: productDesc,
        longDesc: productLongDesc || productDesc,
        sareeType: material,
        material: material,
        design: design,
        colorUse: colorUse,
        length: length,
        hasBlouse: hasBlouse,
        weaverName: originalWeaver,
        img: img1Url || "https://images.unsplash.com/photo-1605814526362-790100f91eb8?w=800&q=80",
        img2: img2Url,
        img3: img3Url,
        img4: img4Url,
        images: finalImages,
        imageCaptions: [imgCaption, img2Caption, img3Caption, img4Caption],
        youtubeUrl: youtubeUrl || undefined,
        stockQuantity: Number(stockQuantity),
        inStock: Number(stockQuantity) > 0,
        allowResellerMargin,
        resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,
        resellerPrice: allowResellerMargin ? String(Math.floor(parsedPrice * (1 - Number(resellerMarginPercentage) / 100))) : undefined,
        isSpecialOffer,
        specialOfferTag: isSpecialOffer ? specialOfferTag : undefined,
        sellerId,
        sellerType: sellerRole,
        isBhuliaVerified: true,
      };

      if (existingProduct) {
        await updateDoc(doc(db, "products", existingProduct.id), {
          ...productData,
          status: isAutoApprovedUser ? "approved" : "pending_approval",
          updatedAt: serverTimestamp(),
        });
        alert(isAutoApprovedUser ? "Inventory updated and went live instantly (VIP)!" : "Inventory updated successfully and submitted for QC!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          bhuliaProductId,
          escrowStatus: "Payment Protected",
          status: isAutoApprovedUser ? "approved" : "pending_approval",
          createdAt: serverTimestamp(),
        });
        alert(isAutoApprovedUser ? "Inventory batch saved and went live instantly (VIP)!" : "Inventory batch saved and submitted for QC!");
        localStorage.removeItem("sd_product_draft");
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
    setIsUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        <div className="bg-[#051815] px-8 py-6 flex justify-between items-center text-white">
          <h2 className="text-2xl font-black font-serif">{existingProduct ? "Edit Item" : "Add New Item"}</h2>
          <button type="button" onClick={onClose} className="text-white hover:text-[#C5A059] font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-8 pb-0">
          {/* Visual Stepper */}
          <div className="mb-8 bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-200">
            <div className="flex gap-2 w-full justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-[#0070F3] -z-10 -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${(uploadStep - 1) * 50}%` }}></div>
              
              <div className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-colors ${uploadStep === 1 ? 'bg-[#0070F3] text-white shadow-sm' : uploadStep > 1 ? 'bg-white border-2 border-[#0070F3] text-[#0070F3]' : 'bg-white border border-gray-200 text-gray-400'}`}>
                <span className="md:hidden">1</span>
                <span className="hidden md:inline">Step 1: Basic Info</span>
              </div>
              <div className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-colors ${uploadStep === 2 ? 'bg-[#0070F3] text-white shadow-sm' : uploadStep > 2 ? 'bg-white border-2 border-[#0070F3] text-[#0070F3]' : 'bg-white border border-gray-200 text-gray-400'}`}>
                <span className="md:hidden">2</span>
                <span className="hidden md:inline">Step 2: Specifications</span>
              </div>
              <div className={`flex-1 text-center py-2 rounded-xl text-sm font-bold transition-colors ${uploadStep === 3 ? 'bg-[#0070F3] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-400'}`}>
                <span className="md:hidden">3</span>
                <span className="hidden md:inline">Step 3: Media & Pricing</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={uploadStep === 3 ? handleUpload : (e) => { e.preventDefault(); setUploadStep(uploadStep + 1); }} className="p-8 pt-0 space-y-6 h-[60vh] overflow-y-auto">
          
          {uploadStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Name *</label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#0070F3]" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Category *</label>
                <input list="categoryList" value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#0070F3]" required />
                <datalist id="categoryList">
                  <option value="Saree" />
                  <option value="Dress material" />
                  <option value="Bedsheet" />
                  <option value="Suit" />
                  <option value="Fabric" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Original Weaver / Brand Name *</label>
                <input type="text" value={originalWeaver} onChange={e => setOriginalWeaver(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#0070F3]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Short Description *</label>
                <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#0070F3]" required rows={2} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Long Artisan Story Description</label>
                <textarea value={productLongDesc} onChange={e => setProductLongDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#0070F3]" rows={3} />
              </div>
            </div>
          )}

          {uploadStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Material</label>
                <input list="materialList" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0070F3]" />
                <datalist id="materialList">
                  <option value="Pure Cotton" />
                  <option value="Pure Silk (Pata)" />
                  <option value="Mix Silk" />
                  <option value="Linen" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Design</label>
                <input list="designList" value={design} onChange={e => setDesign(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0070F3]" />
                <datalist id="designList">
                  <option value="Sambalpuri Ikat (Bandha)" />
                  <option value="Bomkei" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Color Palette</label>
                <input type="text" value={colorUse} onChange={e => setColorUse(e.target.value)} placeholder="e.g. Royal Blue & Gold" className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0070F3]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Length</label>
                <input type="text" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 6.2 Meters" className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0070F3]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Blouse Status</label>
                <select value={hasBlouse ? "true" : "false"} onChange={e => setHasBlouse(e.target.value === "true")} className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0070F3]">
                  <option value="true">With Blouse Piece</option>
                  <option value="false">Without Blouse Piece</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Total Stock Quantity *</label>
                <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0070F3]" required />
              </div>
            </div>
          )}

          {uploadStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Product Images & Video</h3>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-[#FF0000] uppercase tracking-wider mb-2">YouTube Demo Video (Optional)</label>
                  <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="e.g. https://youtube.com/shorts/..." className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#FF0000]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <ImageUploader label="Main Photo *" value={productImage} onChange={setProductImage} aspectRatio="portrait" captionValue={imgCaption} onCaptionChange={setImgCaption} />
                  <ImageUploader label="Photo 2" value={img2} onChange={setImg2} aspectRatio="portrait" captionValue={img2Caption} onCaptionChange={setImg2Caption} />
                  <ImageUploader label="Photo 3" value={img3} onChange={setImg3} aspectRatio="portrait" captionValue={img3Caption} onCaptionChange={setImg3Caption} />
                  <ImageUploader label="Photo 4" value={img4} onChange={setImg4} aspectRatio="portrait" captionValue={img4Caption} onCaptionChange={setImg4Caption} />
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <div className="p-6 space-y-6">
                  <h3 className="text-lg font-black text-gray-900 border-b border-gray-200 pb-2">Pricing Engine Setup</h3>
                  
                  {/* RETAIL PRICING */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input type="checkbox" checked={availableForRetail} onChange={e => setAvailableForRetail(e.target.checked)} className="w-5 h-5 accent-[#0070F3]" />
                      <span className="font-bold text-gray-900 text-lg">Available for Retail (Single Piece)</span>
                    </label>
                    
                    {availableForRetail && (
                      <div className="space-y-4 pl-8 border-l-2 border-[#0070F3]/20 ml-2 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MSRP (₹) *</label>
                            <input type="number" value={productMrp} onChange={e => setProductMrp(e.target.value)} required={availableForRetail} className="w-full border border-gray-300 rounded-lg p-3 focus:border-[#0070F3] outline-none" placeholder="e.g. 5000" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#0070F3] uppercase mb-1">Retail Selling Price (₹) *</label>
                            <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} required={availableForRetail} className="w-full border-2 border-[#0070F3] rounded-lg p-3 outline-none font-bold" placeholder="e.g. 3500" />
                          </div>
                        </div>
                        
                        <label className="flex items-center gap-3 cursor-pointer mt-4">
                          <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="w-4 h-4 accent-green-600" />
                          <span className="text-sm font-bold text-green-700">Allow Resellers to Promote?</span>
                        </label>

                        {allowResellerMargin && (
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <label className="block text-xs font-bold text-green-700 mb-2 uppercase">Reseller Discount ({resellerMarginPercentage}%)</label>
                            <input type="range" min="5" max="50" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Number(e.target.value))} className="w-full accent-green-600" />
                            <p className="text-xs text-green-800 font-bold mt-2">
                              Resellers will sell this at a ₹{Math.floor(Number(productPrice || 0) * (Number(resellerMarginPercentage) / 100))} discount from your Retail Price.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* WHOLESALE TIERED PRICING */}
                  {(sellerRole === 'wholesaler' || sellerRole === 'weaver') && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mt-4">
                      <label className="flex items-center gap-3 cursor-pointer mb-4">
                        <input type="checkbox" checked={availableForWholesale} onChange={e => setAvailableForWholesale(e.target.checked)} className="w-5 h-5 accent-purple-600" />
                        <span className="font-bold text-purple-900 text-lg">Available for B2B Wholesale (Bulk)</span>
                      </label>

                      {availableForWholesale && (
                        <div className="space-y-4 pl-8 border-l-2 border-purple-300 ml-2 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <label className="block text-xs font-bold text-purple-700 uppercase mb-1">Wholesale Terms (Dispatch/Shipping) *</label>
                            <input type="text" value={wholesaleTerms} onChange={e => setWholesaleTerms(e.target.value)} required={availableForWholesale} placeholder="e.g. 15 days dispatch, free shipping over 100 units" className="w-full border-b border-purple-300 bg-transparent p-2 focus:border-purple-600 outline-none text-purple-900" />
                          </div>

                          <div className="mt-6">
                            <label className="block text-sm font-bold text-purple-900 uppercase tracking-wider mb-4 border-b border-purple-200 pb-2">Wholesale Pricing Tiers</label>
                            
                            <div className="space-y-3">
                              {wholesaleTiers.map((tier, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                  <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-purple-700 mb-1">Tier {index + 1}: Minimum Quantity (pcs)</label>
                                    <input type="number" min="2" value={tier.minQty || ""} onChange={e => handleTierChange(index, 'minQty', Number(e.target.value))} required className="w-full border border-gray-300 rounded-lg p-2 focus:border-purple-500 outline-none" />
                                  </div>
                                  <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-purple-700 mb-1">Price Per Piece (₹)</label>
                                    <input type="number" min="1" value={tier.price || ""} onChange={e => handleTierChange(index, 'price', Number(e.target.value))} required className="w-full border border-gray-300 rounded-lg p-2 focus:border-purple-500 outline-none" />
                                  </div>
                                  <div className="pb-1">
                                    <button type="button" onClick={() => handleRemoveTier(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg font-bold" title="Remove Tier">
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <button type="button" onClick={handleAddTier} className="mt-4 text-sm font-bold text-purple-700 bg-purple-100 px-4 py-2 rounded-xl hover:bg-purple-200 transition-colors">
                              + Add Quantity Tier
                            </button>
                          </div>
                          <div className="bg-purple-100 text-purple-800 p-3 rounded-xl text-xs font-medium mt-4">
                            <strong className="font-bold">Important:</strong> Ensure each tier has a strictly higher minimum quantity and a strictly lower price per piece. Tier 1 price must be lower than your Retail Selling Price.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isSpecialOffer} onChange={e => setIsSpecialOffer(e.target.checked)} className="w-5 h-5 accent-yellow-600" />
                      <span className="font-bold text-yellow-900">Mark as Special Limited-Time Offer?</span>
                    </label>
                    {isSpecialOffer && (
                      <div className="mt-4 pl-8">
                        <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Offer Tag Text</label>
                        <input type="text" value={specialOfferTag} onChange={e => setSpecialOfferTag(e.target.value)} placeholder="e.g. 50% OFF! or Mega Discount" className="w-full bg-white border border-yellow-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-yellow-500 outline-none transition-all" required />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Footer */}
          <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-100 flex justify-between items-center mt-8 pb-4">
            <div>
              {uploadStep > 1 && (
                <button type="button" onClick={() => setUploadStep(uploadStep - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  ← Previous Step
                </button>
              )}
            </div>
            
            <div className="flex gap-4 items-center">
              <button type="button" onClick={saveDraft} className="text-gray-500 hover:text-gray-900 font-bold text-sm mr-4 hidden md:block">
                Save Draft
              </button>
              
              {uploadStep < 3 ? (
                <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-[#0070F3] hover:bg-[#005BB5] shadow-lg transition-colors">
                  Next Step →
                </button>
              ) : (
                <button type="submit" disabled={isUploading} className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {isUploading ? "Uploading & Saving..." : (existingProduct ? "Save Changes" : "Publish to Catalog")}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
