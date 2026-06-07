"use client";

import React, { useState, useEffect } from "react";
import { updateDocumentStatus, useProductById, useWeavers, useVendors } from "@/lib/db-hooks";
import { useTaxonomy, addTaxonomyItem } from "@/lib/taxonomy-hooks";
import ImageUploader from "@/components/ImageUploader";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params?.productId === "string" ? params.productId : "";
  
  const { product, loading: productLoading } = useProductById(productId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { weavers } = useWeavers();
  const { vendors } = useVendors();
  const { taxonomy } = useTaxonomy();

  // Custom Taxonomy State
  const [customCategory, setCustomCategory] = useState("");
  const [customMaterial, setCustomMaterial] = useState("");
  const [customDesign, setCustomDesign] = useState("");

  const [templates, setTemplates] = useState<any[]>([]);

  // Fetch product templates once on mount
  React.useEffect(() => {
    async function fetchTemplates() {
      try {
        const q = query(collection(db, "platform_pages"), where("type", "==", "product"), where("status", "in", ["published", "premium_template"]));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplates(fetched);
      } catch (err) {
        console.error("Error fetching templates", err);
      }
    }
    fetchTemplates();
  }, []);

  // Form State (Shortened Schema)
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [category, setCategory] = useState("Silk");
  const [desc, setDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [img, setImg] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  const [imgCaption, setImgCaption] = useState("");
  const [img2Caption, setImg2Caption] = useState("");
  const [img3Caption, setImg3Caption] = useState("");
  const [img4Caption, setImg4Caption] = useState("");
  const [imagesCaptions, setImagesCaptions] = useState<string[]>([]);
  
  // Handloom Specs
  const [sareeType, setSareeType] = useState("");
  const [material, setMaterial] = useState("");
  const [design, setDesign] = useState("");
  const [colorUse, setColorUse] = useState("");
  const [length, setLength] = useState("");
  const [hasBlouse, setHasBlouse] = useState(true);
  const [weaverName, setWeaverName] = useState("");
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [allowResellerMargin, setAllowResellerMargin] = useState(false);
  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);
  const [specialOfferTag, setSpecialOfferTag] = useState("");
  const [customLayoutId, setCustomLayoutId] = useState("");

  const allSellers = [...(weavers || []).map(w => ({...w, type: 'weaver'})), ...(vendors || []).map(v => ({...v, type: 'vendor'}))];

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setPrice(product.price || "");
      setMrp(product.mrp || "");
      setStockQuantity(product.stockQuantity ?? (product.inStock ? 1 : 0));
      setCategory(product.category || "Silk");
      setDesc(product.desc || "");
      setLongDesc(product.longDesc || "");
      setImg(product.img || "");
      setImg2(product.img2 || "");
      setImg3(product.img3 || "");
      setImg3(product.img3 || "");
      setImg4(product.img4 || "");
      setImages(product.images || []);
      
      setSareeType(product.sareeType || "");
      setMaterial(product.material || product.sareeType || "");
      setDesign(product.design || "");

      const caps = product.imageCaptions || [];
      setImgCaption(caps[0] || "");
      setImg2Caption(caps[1] || "");
      setImg3Caption(caps[2] || "");
      setImg4Caption(caps[3] || "");
      setImagesCaptions(caps.slice(4));
      
      setSareeType(product.sareeType || "Silk");
      setColorUse(product.colorUse || "");
      setLength(product.length || "");
      setHasBlouse(product.hasBlouse ?? true);
      setWeaverName(product.weaverName || "");
      setSelectedSellerId(product.sellerId || "");
      setAllowResellerMargin(product.allowResellerMargin || false);
      setResellerMarginPercentage(product.resellerMarginPercentage || 5);
      setIsSpecialOffer(product.isSpecialOffer || false);
      setSpecialOfferTag(product.specialOfferTag || "");
      setCustomLayoutId(product.customLayoutId || "");
    }
  }, [product]);

  const handleUpdateProduct = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Process Taxonomy
    let finalCategory = category;
    let finalMaterial = material;
    let finalDesign = design;
    
    if (category === "Other" && customCategory.trim()) {
      finalCategory = customCategory.trim();
      await addTaxonomyItem("categories", finalCategory, "Vendor/Weaver");
    }
    if (material === "Other" && customMaterial.trim()) {
      finalMaterial = customMaterial.trim();
      await addTaxonomyItem("materials", finalMaterial, "Vendor/Weaver");
    }
    if (design === "Other" && customDesign.trim()) {
      finalDesign = customDesign.trim();
      await addTaxonomyItem("designs", finalDesign, "Vendor/Weaver");
    }

    const parsedPrice = parseInt(price.replace(/[^0-9]/g, "")) || 0;

    const data = {
      title,
      price,
      mrp,
      desc,
      longDesc,
      img,
      img2,
      img3,
      img4,
      images: images.filter(Boolean),
      imageCaptions: [imgCaption, img2Caption, img3Caption, img4Caption, ...imagesCaptions],
      category: finalCategory,
      sareeType: finalMaterial || sareeType,
      material: finalMaterial,
      design: finalDesign,
      colorUse,
      length,
      hasBlouse,
      weaverName,
      sellerId: selectedSellerId || null,
      sellerType: selectedSellerId ? allSellers.find(s => s.id === selectedSellerId)?.type || null : null,
      allowResellerMargin,
      resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,
      resellerPrice: allowResellerMargin ? String(Math.floor(parsedPrice * (1 - Number(resellerMarginPercentage) / 100))) : null,
      isSpecialOffer,
      specialOfferTag: isSpecialOffer ? specialOfferTag : null,
      isGI: false, // Override to remove GI mention completely
      isBhuliaVerified: true, // Always true as requested
      escrowStatus: "Payment Protected",
      stockQuantity: Number(stockQuantity),
      inStock: Number(stockQuantity) > 0,
      customLayoutId: customLayoutId || null,
      ...(statusOverride ? { status: statusOverride } : {})
    };

    // Remove any accidental undefined values
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    const res = await updateDocumentStatus("products", productId, cleanData);
    setIsSubmitting(false);
    
    if (res.success) {
      router.push("/admin/products");
    } else {
      alert("Error updating product");
    }
  };

  if (loading) {
    return <div className="p-8 text-[#C5A059] animate-pulse">Loading Product Details...</div>;
  }

  if (!product && !loading) {
    return <div className="p-8 text-red-500">Product Not Found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b border-[#C5A059]/30 pb-4">
        <Link href="/admin/products" className="text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Edit Product</h1>
      </div>

      <form onSubmit={handleUpdateProduct} className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
        
        {/* Basic Info Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">1. Core Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" required>
                {!taxonomy.categories.includes(category) && category && category !== "Other" && (
                  <option value={category}>{category}</option>
                )}
                {taxonomy.categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other (Add Custom)</option>
              </select>
              {category === "Other" && (
                <input required value={customCategory} onChange={e => setCustomCategory(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059] mt-2" placeholder="Type new category..." />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Selling Price (₹)</label>
              <input required value={price} onChange={e => setPrice(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">MRP (₹)</label>
              <input required value={mrp} onChange={e => setMrp(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Stock Quantity</label>
              <input required value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} type="number" min="0" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Short Catalog Description</label>
            <textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]"></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Artisan Story & Full Description</label>
            <textarea required value={longDesc} onChange={e => setLongDesc(e.target.value)} rows={4} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]"></textarea>
          </div>
        </section>

        {/* Handloom Specs Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">2. Handloom Specs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Material</label>
              <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" required>
                {!taxonomy.materials.includes(material) && material && material !== "Other" && (
                  <option value={material}>{material}</option>
                )}
                <option value="">Select Material...</option>
                {taxonomy.materials.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Other">Other (Add Custom)</option>
              </select>
              {material === "Other" && (
                <input required value={customMaterial} onChange={e => setCustomMaterial(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059] mt-2" placeholder="Type new material..." />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Design</label>
              <select value={design} onChange={e => setDesign(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" required>
                {!taxonomy.designs.includes(design) && design && design !== "Other" && (
                  <option value={design}>{design}</option>
                )}
                <option value="">Select Design...</option>
                {taxonomy.designs.map(d => <option key={d} value={d}>{d}</option>)}
                <option value="Other">Other (Add Custom)</option>
              </select>
              {design === "Other" && (
                <input required value={customDesign} onChange={e => setCustomDesign(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059] mt-2" placeholder="Type new design..." />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Color Palette</label>
              <input required value={colorUse} onChange={e => setColorUse(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Length</label>
              <input required value={length} onChange={e => setLength(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Blouse Status</label>
              <select value={hasBlouse ? "true" : "false"} onChange={e => setHasBlouse(e.target.value === "true")} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                <option value="true">With Blouse Piece</option>
                <option value="false">Without Blouse Piece</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Weaver Name</label>
              <input required value={weaverName} onChange={e => setWeaverName(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Seller Account Linking</label>
              <select value={selectedSellerId} onChange={e => setSelectedSellerId(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                <option value="">-- Unassigned (Bhulia Hub Centric) --</option>
                {allSellers.map(seller => (
                  <option key={seller.id} value={seller.id}>{seller.title || seller.name || "Unnamed"} ({seller.type})</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Linking an account ensures the product appears on their digital storefront.</p>
            </div>
          </div>
        </section>

        {/* Reseller Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">3. Reseller Commission</h2>
          <div className="bg-[#051815] p-4 rounded-xl border border-[#C5A059]/20">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]" />
              <div>
                <label className="text-sm font-bold text-white block">Allow Reseller Promotion?</label>
                <p className="text-xs text-gray-400">Opt-in to allow resellers to market this product.</p>
              </div>
            </div>
            {allowResellerMargin && (
              <div className="mt-4 pl-7">
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Reseller Margin (%)</label>
                <input type="number" min="5" max="90" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Math.max(5, Number(e.target.value)))} className="w-full md:w-1/2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
                <p className="text-xs text-gray-400 mt-1">Resellers will sell this at a ₹{Math.floor((parseInt(price.replace(/[^0-9]/g, "")) || 0) * (Number(resellerMarginPercentage) / 100))} discount.</p>
              </div>
            )}
          </div>
        </section>

        {/* Special Offer Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">4. Special Discount Sale</h2>
          <div className="bg-[#051815] p-4 rounded-xl border border-[#C5A059]/20">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={isSpecialOffer} onChange={e => setIsSpecialOffer(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]" />
              <div>
                <label className="text-sm font-bold text-white block">Mark as Special Limited-Time Offer?</label>
                <p className="text-xs text-gray-400">This will display a flashy badge and feature the product on the homepage.</p>
              </div>
            </div>
            {isSpecialOffer && (
              <div className="mt-4 pl-7">
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Offer Tag Text</label>
                <input type="text" value={specialOfferTag} onChange={e => setSpecialOfferTag(e.target.value)} placeholder="e.g. 50% OFF! or Mega Discount" className="w-full md:w-1/2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" />
              </div>
            )}
          </div>
        </section>

        {/* Premium Landing Page Assignment */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">5. Advanced Landing Page</h2>
          <div className="bg-[#051815] p-4 rounded-xl border border-[#C5A059]/20">
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest">Custom Product Layout (Premium)</label>
                {customLayoutId && (
                  <Link 
                    href={`/admin/cms/builder/${customLayoutId}`}
                    target="_blank"
                    className="text-[10px] text-blue-400 hover:underline font-bold uppercase tracking-wider"
                  >
                    ✎ Quick Edit Layout
                  </Link>
                )}
              </div>
              <select value={customLayoutId} onChange={e => setCustomLayoutId(e.target.value)} className="w-full md:w-1/2 bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                <option value="">-- Use Global Default Product Template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.title} {t.status === 'premium_template' ? '(Premium)' : ''}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Select a highly-customized layout template to override the default product page for this specific ultra-luxury item.</p>
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">6. Product Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader value={img} onChange={setImg} label="Main Product Photo (Image 1)" aspectRatio="portrait" captionValue={imgCaption} onCaptionChange={setImgCaption} />
            <ImageUploader value={img2} onChange={setImg2} label="Product Photo 2" aspectRatio="portrait" captionValue={img2Caption} onCaptionChange={setImg2Caption} />
            <ImageUploader value={img3} onChange={setImg3} label="Product Photo 3" aspectRatio="portrait" captionValue={img3Caption} onCaptionChange={setImg3Caption} />
            <ImageUploader value={img4} onChange={setImg4} label="Product Photo 4" aspectRatio="portrait" captionValue={img4Caption} onCaptionChange={setImg4Caption} />
            
            {images.map((imgUrl, idx) => (
              <ImageUploader 
                key={idx} 
                value={imgUrl} 
                onChange={(val) => {
                  const newImages = [...images];
                  newImages[idx] = val;
                  setImages(newImages);
                }} 
                captionValue={imagesCaptions[idx] || ""}
                onCaptionChange={(val) => {
                  const newCaptions = [...imagesCaptions];
                  newCaptions[idx] = val;
                  setImagesCaptions(newCaptions);
                }}
                label={`Additional Photo ${idx + 1}`} 
                aspectRatio="portrait" 
              />
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => {
              setImages([...images, ""]);
              setImagesCaptions([...imagesCaptions, ""]);
            }}
            className="mt-4 px-4 py-2 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors"
          >
            + Add Another Image
          </button>
        </section>

        {/* Submit */}
        <div className="pt-6 flex flex-wrap justify-end gap-4 border-t border-[#C5A059]/20">
          <Link href="/admin/products" className="px-6 py-3 text-gray-300 font-bold text-xs uppercase tracking-wider hover:text-white transition-colors">
            Cancel
          </Link>
          <button type="button" onClick={(e) => handleUpdateProduct(e)} disabled={isSubmitting} className="bg-transparent border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 transition-all font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wider disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={(e) => handleUpdateProduct(e, "live")} disabled={isSubmitting} className="bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wider disabled:opacity-50 shadow-lg">
            {isSubmitting ? "Approving..." : "Approve & Go Live"}
          </button>
        </div>
      </form>
    </div>
  );
}
