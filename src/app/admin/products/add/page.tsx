"use client";

import React, { useState } from "react";
import { addProduct } from "@/lib/db-hooks";
import ImageUploader from "@/components/ImageUploader";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Shortened Schema)
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [category, setCategory] = useState("Silk");
  const [desc, setDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [img, setImg] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  // Handloom Specs
  const [sareeType, setSareeType] = useState("Silk");
  const [colorUse, setColorUse] = useState("");
  const [length, setLength] = useState("");
  const [hasBlouse, setHasBlouse] = useState(true);
  const [weaverName, setWeaverName] = useState("");

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      category,
      sareeType,
      colorUse,
      length,
      hasBlouse,
      weaverName,
      isGI: false, // Explicitly false or completely removed from display
      isBhuliaVerified: true, // Auto true
      status: "approved",
      escrowStatus: "Payment Protected"
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
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                <option>Silk Masterpieces</option>
                <option>Cotton Classics</option>
                <option>Mix Pata</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Selling Price (₹)</label>
              <input required value={price} onChange={e => setPrice(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. ₹ 34,500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">MRP (₹)</label>
              <input required value={mrp} onChange={e => setMrp(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. ₹ 42,000" />
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
              <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Saree Type</label>
              <select value={sareeType} onChange={e => setSareeType(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                <option>Pure Silk</option>
                <option>Pure Cotton</option>
                <option>Mix Pata</option>
                <option>Tissue</option>
              </select>
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
          </div>
        </section>

        {/* Media Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-[#C5A059]/20 pb-2">3. Product Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader value={img} onChange={setImg} label="Main Product Photo (Image 1)" aspectRatio="portrait" />
            <ImageUploader value={img2} onChange={setImg2} label="Product Photo 2" aspectRatio="portrait" />
            <ImageUploader value={img3} onChange={setImg3} label="Product Photo 3" aspectRatio="portrait" />
            <ImageUploader value={img4} onChange={setImg4} label="Product Photo 4" aspectRatio="portrait" />
            
            {images.map((imgUrl, idx) => (
              <ImageUploader 
                key={idx} 
                value={imgUrl} 
                onChange={(val) => {
                  const newImages = [...images];
                  newImages[idx] = val;
                  setImages(newImages);
                }} 
                label={`Additional Photo ${idx + 1}`} 
                aspectRatio="portrait" 
              />
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => setImages([...images, ""])}
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
