const fs = require('fs');
const path = require('path');

const filePath = path.join('e:', 'web-app-projects-2026', 'sd-bhulia-hub', 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const hookInjection = `  const { orders } = useOrders();\n  const { transactions } = useTransactions();\n  const sellerTransactions = transactions.filter(t => t.sellerId === auth.currentUser?.uid);\n  const availableBalance = sellerTransactions.filter(t => t.status === "completed" || t.status === "paid_out").reduce((sum, t) => sum + t.amount, 0);`;
content = content.replace('  const { orders } = useOrders();', hookInjection);

const walletMock = `<div className="text-3xl font-black text-green-600">₹0</div>`;
const walletReal = `<div className="text-3xl font-black text-green-600">₹{availableBalance.toLocaleString()}</div>`;
content = content.replace(walletMock, walletReal);

content = content.replace(/<td className="py-4 font-medium text-gray-500">{product.category \|\| "Silk"}<\/td>/g, '<td className="py-4 font-medium text-gray-500">{product.category || "Uncategorized"}</td>');

const oldActionTd = `<td className="py-4 text-right whitespace-nowrap">
                            <a href={"/product/" + product.slug} target="_blank" className="inline-block bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors mr-2">
                              View Live ↗
                            </a>
                            <button onClick={() => handleEditClick(product)} className="inline-block bg-blue-50 text-[#0070F3] border border-blue-100 hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
                              Edit
                            </button>
                          </td>`;

const newActionTd = `<td className="py-4 text-right whitespace-nowrap">
                            {((product as any).status === "approved" || (product as any).status === "live") ? (
                              <a href={"/product/" + product.slug} target="_blank" className="inline-block bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors mr-2">
                                View Live ↗
                              </a>
                            ) : ((product as any).status === "pending_approval" || (product as any).status === "pending") ? (
                              <span className="inline-block bg-gray-100 text-gray-400 font-bold text-xs px-3 py-1.5 rounded-lg mr-2 cursor-not-allowed">
                                Under Review
                              </span>
                            ) : null}
                            <button onClick={() => handleEditClick(product)} className="inline-block bg-blue-50 text-[#0070F3] border border-blue-100 hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
                              Edit
                            </button>
                          </td>`;
content = content.replace(oldActionTd, newActionTd);

const formStartString = '<form className="space-y-6" onSubmit={handleUpload}>';
const formEndString = '              </form>';

const formStartIndex = content.indexOf(formStartString);
if (formStartIndex !== -1) {
  let formEndIndex = content.indexOf(formEndString, formStartIndex);
  if (formEndIndex !== -1) {
    formEndIndex += formEndString.length;
    
    const wizardUI = `
<div className="mb-8 bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-200">
  <div className="flex gap-2 w-full justify-between items-center">
    <div className={\`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors \${uploadStep === 1 ? 'bg-white shadow-sm text-[#0070F3]' : 'text-gray-400'}\`}>1. Basic Info</div>
    <div className={\`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors \${uploadStep === 2 ? 'bg-white shadow-sm text-[#0070F3]' : 'text-gray-400'}\`}>2. Specifications</div>
    <div className={\`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors \${uploadStep === 3 ? 'bg-white shadow-sm text-[#0070F3]' : 'text-gray-400'}\`}>3. Media & Options</div>
  </div>
</div>
<form className="space-y-6" onSubmit={handleUpload}>

  {uploadStep === 1 && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in">
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
        <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
        <input list="categoryList" value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type category..." required />
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
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Original Weaver Name</label>
        <input type="text" value={originalWeaver} onChange={e => setOriginalWeaver(e.target.value)} placeholder="e.g. Sambalpuri Cooperative" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Retail Selling Price (₹)</label>
        <input type="text" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required placeholder="e.g. 34500" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Retail MRP (₹)</label>
        <input type="text" value={productMrp} onChange={e => setProductMrp(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required placeholder="e.g. 42000" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Description</label>
        <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required rows={2} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Long Artisan Story Description</label>
        <textarea value={productLongDesc} onChange={e => setProductLongDesc(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required rows={4} />
      </div>
    </div>
  )}

  {uploadStep === 2 && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Material</label>
        <input list="materialList" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type material..." required />
        <datalist id="materialList">
          <option value="Pure Cotton" />
          <option value="Pure Silk (Pata)" />
          <option value="Mix Silk(Pata) (Silk+Polyster)" />
          <option value="Mix Cotton (Cotton+Polyster)" />
        </datalist>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Design</label>
        <input list="designList" value={design} onChange={e => setDesign(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="Select or type design..." required />
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
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color Palette</label>
        <input type="text" value={colorUse} onChange={e => setColorUse(e.target.value)} placeholder="e.g. Royal Blue & Gold" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Length</label>
        <input type="text" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 6.2 Meters" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Blouse Status</label>
        <select value={hasBlouse ? "true" : "false"} onChange={e => setHasBlouse(e.target.value === "true")} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all">
          <option value="true">With Blouse Piece</option>
          <option value="false">Without Blouse Piece</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Stock Quantity</label>
        <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
      </div>
    </div>
  )}

  {uploadStep === 3 && (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Product Images & Video</h3>
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#FF0000] uppercase tracking-wider mb-2">YouTube Demo Video (Optional)</label>
          <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="e.g. https://youtube.com/shorts/..." className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#FF0000] outline-none transition-all" />
          <p className="text-[10px] text-gray-500 mt-1">Paste a YouTube Shorts link to embed a vertical product demo.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ImageUploader label="Main Photo" value={productImage} onChange={setProductImage} aspectRatio="portrait" captionValue={imgCaption} onCaptionChange={setImgCaption} />
          <ImageUploader label="Photo 2" value={img2} onChange={setImg2} aspectRatio="portrait" captionValue={img2Caption} onCaptionChange={setImg2Caption} />
          <ImageUploader label="Photo 3" value={img3} onChange={setImg3} aspectRatio="portrait" captionValue={img3Caption} onCaptionChange={setImg3Caption} />
          <ImageUploader label="Photo 4" value={img4} onChange={setImg4} aspectRatio="portrait" captionValue={img4Caption} onCaptionChange={setImg4Caption} />
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <span className="font-bold text-gray-900 text-sm">⚙️ Advanced Selling Options (B2B & Resellers)</span>
          <span className="text-gray-500">{showAdvanced ? "▲" : "▼"}</span>
        </button>
        
        {showAdvanced && (
          <div className="p-6 space-y-6 animate-in slide-in-from-top-2">
            {canSellWholesale && (
              <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="text-sm font-bold text-purple-900 mb-4">Availability Options (B2B Privileges Enabled)</h4>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={availableForRetail} onChange={e => setAvailableForRetail(e.target.checked)} className="form-checkbox text-purple-600 rounded w-5 h-5 focus:ring-purple-500" />
                    <span className="font-bold text-gray-900 text-sm">Retail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={availableForWholesale} onChange={e => setAvailableForWholesale(e.target.checked)} className="form-checkbox text-purple-600 rounded w-5 h-5 focus:ring-purple-500" />
                    <span className="font-bold text-gray-900 text-sm">Wholesale</span>
                  </label>
                </div>
                
                {availableForWholesale && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">Wholesale Commercial Price (₹)</label>
                      <input type="text" value={commercialPrice} onChange={e => setCommercialPrice(e.target.value)} className="w-full bg-white border border-purple-200 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 outline-none transition-all" required={availableForWholesale} placeholder="e.g. 29000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">Wholesale Supply Terms (MOQ, Dispatch)</label>
                      <textarea value={wholesaleTerms} onChange={e => setWholesaleTerms(e.target.value)} className="w-full bg-white border border-purple-200 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 outline-none transition-all" required={availableForWholesale} placeholder="e.g. Min 5 Sarees, 15 days dispatch..." rows={1} />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <label className="flex items-start space-x-3 cursor-pointer mb-3">
                <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="form-checkbox text-[#0070F3] rounded w-5 h-5 mt-0.5 focus:ring-[#0070F3]" />
                <div>
                  <span className="text-sm text-blue-900 font-bold block">Allow Reseller Promotion?</span>
                  <span className="text-xs text-blue-700">Opt-in to allow resellers to market your product.</span>
                </div>
              </label>
              {allowResellerMargin && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Margin Percentage (Min 5%)</label>
                  <input type="number" min="5" max="90" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Math.max(5, Number(e.target.value)))} className="w-full bg-white border border-blue-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  <div className="text-xs text-blue-800 font-bold mt-2">
                    Resellers will sell this at a ₹{Math.floor(Number(productPrice || 0) * (Number(resellerMarginPercentage) / 100))} discount.
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <label className="flex items-start space-x-3 cursor-pointer mb-3">
                <input type="checkbox" checked={isSpecialOffer} onChange={e => setIsSpecialOffer(e.target.checked)} className="form-checkbox text-yellow-600 rounded w-5 h-5 mt-0.5 focus:ring-yellow-600" />
                <div>
                  <span className="text-sm text-yellow-900 font-bold block">Mark as Special Limited-Time Offer?</span>
                  <span className="text-xs text-yellow-700">This will display a flashy badge and feature the product on the homepage.</span>
                </div>
              </label>
              {isSpecialOffer && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Offer Tag Text</label>
                  <input type="text" value={specialOfferTag} onChange={e => setSpecialOfferTag(e.target.value)} placeholder="e.g. 50% OFF! or Mega Discount" className="w-full bg-white border border-yellow-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-yellow-500 outline-none transition-all" required />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  <div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t border-gray-100 gap-4 mt-8">
    <div className="flex gap-4">
      <button type="button" onClick={saveDraft} className="w-full md:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-3 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
        Save Draft
      </button>
      {uploadStep > 1 && (
        <button type="button" onClick={() => { setUploadStep(uploadStep - 1); saveDraft(); }} className="w-full md:w-auto bg-gray-100 text-gray-700 px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
          Previous Step
        </button>
      )}
    </div>
    
    <div className="flex gap-4">
      {uploadStep < 3 ? (
        <button type="button" onClick={() => { setUploadStep(uploadStep + 1); saveDraft(); }} className="w-full md:w-auto bg-black text-white px-8 py-3 font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
          Next Step →
        </button>
      ) : (
        <button type="submit" disabled={isUploading} className="w-full md:w-auto bg-[#0070F3] text-white px-8 py-3 font-bold rounded-xl disabled:opacity-50 hover:bg-[#005BB5] transition-colors shadow-sm">
          {isUploading ? "Uploading to Database..." : "Submit Inventory for QC"}
        </button>
      )}
    </div>
  </div>

</form>`;
    
    content = content.substring(0, formStartIndex) + wizardUI + content.substring(formEndIndex);
  }
}

if (!content.includes('useTransactions')) {
  content = content.replace(/import \{ useOrders \} from "\@\/hooks\/useOrders";/, 'import { useOrders } from "@/hooks/useOrders";\nimport { useTransactions } from "@/hooks/useTransactions";');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactor complete!');
