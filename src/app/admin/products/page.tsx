"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useProducts, addProduct, deleteProduct, updateDocumentStatus } from "@/lib/db-hooks";
import ImageUploader from "@/components/ImageUploader";

export default function AdminProductsPage() {
  const { products, loading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  const [category, setCategory] = useState("Silk");
  const [weave, setWeave] = useState("Double Ikat");
  const [time, setTime] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [weaverName, setWeaverName] = useState("");
  const [designerName, setDesignerName] = useState("");
  const [threadType, setThreadType] = useState("");
  const [colorUse, setColorUse] = useState("");
  const [length, setLength] = useState("");
  const [hasBlouse, setHasBlouse] = useState(true);
  const [isGI, setIsGI] = useState(true);
  const [isBhuliaVerified, setIsBhuliaVerified] = useState(true);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setTitle(product.title || "");
    setSlug(product.slug || "");
    setPrice(product.price || "");
    setDesc(product.desc || "");
    setImg(product.img || "");
    setImg2(product.img2 || "");
    setImg3(product.img3 || "");
    setImg4(product.img4 || "");
    setCategory(product.category || "Silk");
    setWeave(product.weave || "Double Ikat");
    setTime(product.time || "");
    setLongDesc(product.longDesc || "");
    setWeaverName(product.weaverName || "");
    setDesignerName(product.designerName || "");
    setThreadType(product.threadType || "");
    setColorUse(product.colorUse || "");
    setLength(product.length || "");
    setHasBlouse(product.hasBlouse ?? true);
    setIsGI(product.isGI ?? true);
    setIsBhuliaVerified(product.isBhuliaVerified ?? true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setTitle("");
    setSlug("");
    setPrice("");
    setDesc("");
    setImg("");
    setImg2("");
    setImg3("");
    setImg4("");
    setCategory("Silk");
    setWeave("Double Ikat");
    setTime("");
    setLongDesc("");
    setWeaverName("");
    setDesignerName("");
    setThreadType("");
    setColorUse("");
    setLength("");
    setHasBlouse(true);
    setIsGI(true);
    setIsBhuliaVerified(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price,
      desc,
      img: img || "https://images.unsplash.com/photo-1605814526362-790100f91eb8?w=800&q=80",
      img2,
      img3,
      img4,
      category,
      weave,
      time,
      longDesc: longDesc || desc,
      weaverName,
      designerName,
      threadType,
      colorUse,
      length,
      hasBlouse,
      isGI,
      isBhuliaVerified,
      status: editingProduct ? (editingProduct.status || "approved") : "approved",
      escrowStatus: editingProduct ? (editingProduct.escrowStatus || "approved") : "approved"
    };

    if (editingProduct) {
      const res = await updateDocumentStatus("products", editingProduct.id, data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error updating product");
      }
    } else {
      const res = await addProduct(data);
      if (res.success) {
        handleCloseModal();
      } else {
        alert("Error adding product");
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">Products Directory</h1>
          <p className="text-gray-300 text-xs mt-1">Manage the live saree catalog.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-[#C5A059] font-mono text-xs animate-pulse p-4">Loading catalog...</div>
      ) : (
        <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Title & Weave</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Weaving Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[#C5A059]/50">
                        <Image src={product.img} alt={product.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-white font-serif">{product.title}</div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{product.category} • {product.weave}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#C5A059]">{product.price}</td>
                    <td className="px-6 py-4 text-xs font-mono">{product.time}</td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <a 
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C5A059] hover:underline font-bold text-xs uppercase tracking-wider"
                      >
                        View Product
                      </a>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-blue-400 hover:text-blue-350 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.title)}
                        className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">No products found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(197,160,89,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-[#C5A059]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Product Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Royal Pasapalli Pata" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">URL Slug (Optional)</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="auto-generated if blank" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Price</label>
                  <input required value={price} onChange={e => setPrice(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. ₹ 34,500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Weaving Time</label>
                  <input required value={time} onChange={e => setTime(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. 45 days" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Category / Saree Type</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option>Silk</option>
                    <option>Cotton</option>
                    <option>Tissue</option>
                    <option>Mix Pata</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Weave Type / Process</label>
                  <input required value={weave} onChange={e => setWeave(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Double Ikat (Double Bandha)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Weaver Name</label>
                  <input value={weaverName} onChange={e => setWeaverName(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Master Weaver Nagarjuna Meher" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Designer Name</label>
                  <input value={designerName} onChange={e => setDesignerName(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Traditional Motif Art" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Thread / Yarn Type</label>
                  <input value={threadType} onChange={e => setThreadType(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. 100/120 Count Mulberry Silk" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Color Dyes Used</label>
                  <input value={colorUse} onChange={e => setColorUse(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. Organic Natural Dyes" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Saree Length</label>
                  <input value={length} onChange={e => setLength(e.target.value)} type="text" className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="e.g. 6.2 Meters" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Blouse Status</label>
                  <select value={hasBlouse ? "true" : "false"} onChange={e => setHasBlouse(e.target.value === "true")} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option value="true">With Blouse Piece</option>
                    <option value="false">Without Blouse Piece</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Geographical Indication (GI) Status</label>
                  <select value={isGI ? "true" : "false"} onChange={e => setIsGI(e.target.value === "true")} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option value="true">GI-Tag Certified Artisan Saree</option>
                    <option value="false">Standard Handloom Weave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Bhulia Hub Premium Verification Seal</label>
                  <select value={isBhuliaVerified ? "true" : "false"} onChange={e => setIsBhuliaVerified(e.target.value === "true")} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]">
                    <option value="true">Bhulia Verified Seal</option>
                    <option value="false">Self-Declared Listing</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Short Catalog Description</label>
                <textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Brief teaser description for list cards..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest mb-1">Artisan Story & Full History Description</label>
                <textarea required value={longDesc} onChange={e => setLongDesc(e.target.value)} rows={4} className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]" placeholder="Describe the motif story, historic context, cluster description, and full details..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                  value={img} 
                  onChange={setImg} 
                  label="Main Product Photo (Image 1)" 
                  aspectRatio="portrait"
                />
                <ImageUploader 
                  value={img2} 
                  onChange={setImg2} 
                  label="Product Photo 2" 
                  aspectRatio="portrait"
                />
                <ImageUploader 
                  value={img3} 
                  onChange={setImg3} 
                  label="Product Photo 3" 
                  aspectRatio="portrait"
                />
                <ImageUploader 
                  value={img4} 
                  onChange={setImg4} 
                  label="Product Photo 4" 
                  aspectRatio="portrait"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-gray-300 font-bold text-xs uppercase tracking-wider hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50">
                  {isSubmitting ? "Saving..." : (editingProduct ? "Save Changes" : "Save Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
