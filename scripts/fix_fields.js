const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const weaverFields = `                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Stock Quantity</label>
                    <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 md:col-span-2">
                    <label className="flex items-start space-x-3 cursor-pointer mb-3">
                      <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="form-checkbox text-[#0070F3] rounded w-5 h-5 mt-0.5 focus:ring-[#0070F3]" />
                      <div>
                        <span className="text-sm text-gray-900 font-bold block">Allow Reseller Promotion?</span>
                        <span className="text-xs text-gray-500">Opt-in to allow resellers to market your product.</span>
                      </div>
                    </label>
                    {allowResellerMargin && (
                      <div className="animate-in fade-in slide-in-from-top-2 mt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Margin Percentage (Min 5%)</label>
                        <input type="number" min="5" max="90" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Math.max(5, Number(e.target.value)))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" required />
                        <div className="text-xs text-green-600 font-bold mt-2">
                          Resellers will sell this at a ₹{Math.floor(Number(productPrice || 0) * (Number(resellerMarginPercentage) / 100))} discount.
                        </div>
                      </div>
                    )}
                  </div>`;

// 1. Insert into Weaver Form
code = code.replace(
  '              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Images (Max 4)</label>',
  weaverFields + '\n            </div>\n            <div>\n              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Images (Max 4)</label>'
);

// 2. Insert into Vendor Form
code = code.replace(
  '                {/* Images Section */}',
  weaverFields + '\n\n                {/* Images Section */}'
);

// 3. Remove the entire stock section from KYC block
code = code.replace(/<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<div className="col-span-2">/m, '<div className="col-span-2">');

// 4. Change all oranges to Antigravity Blue globally in dashboard
code = code.replace(/#E57138/g, '#0070F3');
code = code.replace(/#D56128/g, '#005BB5');
code = code.replace(/text-orange-500/g, 'text-blue-500');
code = code.replace(/text-orange-600/g, 'text-blue-600');
code = code.replace(/bg-orange-50/g, 'bg-blue-50');
code = code.replace(/border-orange-100/g, 'border-blue-100');
code = code.replace(/border-orange-200/g, 'border-blue-200');

fs.writeFileSync('src/app/dashboard/page.tsx', code);
console.log("Dashboard UI fixed");
