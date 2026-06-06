"use client";

import React, { useState } from "react";
import { addProduct, useWeavers, useVendors } from "@/lib/db-hooks";
import ImageUploader from "@/components/ImageUploader";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { weavers } = useWeavers();
  const { vendors } = useVendors();
  
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

  const allSellers = [...(weavers || []).map(w => ({...w, type: 'weaver'})), ...(vendors || []).map(v => ({...v, type: 'vendor'}))];

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const parsedPrice = parseInt(price.replace(/[^0-9]/g, "")) || 0;

    const data = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price,
      mrp,
      desc,
      longDesc: longDesc || desc,
      img: img || "https://images.unsplash.com/photo-1605814526362-790100f91eb8?w=800&q=80",
      img2,
      img3,
      img4,
      images: images.filter(Boolean),
      imageCaptions: [imgCaption, img2Caption, img3Caption, img4Caption, ...imagesCaptions],
      category,
      sareeType: material || sareeType,
      material,
      design,
      colorUse,
      length,
      hasBlouse,
      weaverName,
      sellerId: selectedSellerId || undefined,
      sellerType: selectedSellerId ? allSellers.find(s => s.id === selectedSellerId)?.type : undefined,
      allowResellerMargin,
      resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,
      resellerPrice: allowResellerMargin ? String(Math.floor(parsedPrice * (1 - Number(resellerMarginPercentage) / 100))) : undefined,
      isGI: false, // Explicitly false or completely removed from display
      isBhuliaVerified: true, // Auto true
      status: "approved",
      escrowStatus: "Payment Protected",
      stockQuantity: Number(stockQuantity),
      inStock: Number(stockQuantity) > 0
    };

    const res = await addProduct(data);
    setIsSubmitting(false);
    
    if (res.success) {
      router.push("/admin/products");
    } else {
      alert("Error adding product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b border-[#C5A059]/30 pb-4">
        <Link href="/admin/products" className="text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Add New Product</h1>
      </div>

      <form onSubmit={handleAddProduct} className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
        
        {/* Basic Info Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">1. Core Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Royal Pasapalli Pata" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Category</label>
              <input list="categoryList" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Select or type category..." required />
              <datalist id="categoryList">
                <option value="Saree" />
                <option value="Dress material" />
                <option value="Bedsheet" />
                <option value="RedyMade shirts" />
                <option value="Redy made Kurti" />
                <option value="Kurti dress material" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Selling Price (₹)</label>
              <input required value={price} onChange={e => setPrice(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. ₹ 34,500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">MRP (₹)</label>
              <input required value={mrp} onChange={e => setMrp(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. ₹ 42,000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Stock Quantity</label>
              <input required value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} type="number" min="1" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="1" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Short Catalog Description</label>
            <textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Brief teaser description for list cards..."></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Artisan Story & Full Description</label>
            <textarea required value={longDesc} onChange={e => setLongDesc(e.target.value)} rows={4} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Describe the motif story, historic context, cluster description, and full details..."></textarea>
          </div>
        </section>

        {/* Handloom Specs Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">2. Handloom Specs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Material</label>
              <input list="materialList" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Select or type material..." required />
              <datalist id="materialList">
                <option value="Pure Cotton" />
                <option value="Pure Silk (Pata)" />
                <option value="Mix Silk(Pata) (Silk+Polyster)" />
                <option value="Mix Cotton (Cotton+Polyster)" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Design</label>
              <input list="designList" value={design} onChange={e => setDesign(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Select or type design..." required />
              <datalist id="designList">
                <option value="Sambalpuri Ikat (Bandha)" />
                <option value="Sambalpuri Traditional Ikat Design" />
                <option value="Sambalpuri Modern Ikat Design" />
                <option value="Sambalpuri Double Ikat (Pashapali/Saptapar)" />
                <option value="Bomkei" />
                <option value="Bomkei+Ikat" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Color Palette</label>
              <input required value={colorUse} onChange={e => setColorUse(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Royal Blue & Gold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Length</label>
              <input required value={length} onChange={e => setLength(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. 6.2 Meters" />
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
              <input required value={weaverName} onChange={e => setWeaverName(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Master Weaver Nagarjuna Meher" />
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

        {/* Media Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">4. Product Gallery</h2>
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
        <div className="pt-6 flex justify-end gap-4 border-t border-[#C5A059]/20">
          <Link href="/admin/products" className="px-6 py-3 text-gray-300 font-bold text-xs uppercase tracking-wider hover:text-white transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wider disabled:opacity-50 shadow-lg">
            {isSubmitting ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
