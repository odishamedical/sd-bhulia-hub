const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const marginUI = `
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Stock Quantity</label>
                  <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#E57138] outline-none transition-all" required />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="flex items-start space-x-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={allowResellerMargin} onChange={e => setAllowResellerMargin(e.target.checked)} className="form-checkbox text-[#E57138] rounded w-5 h-5 mt-0.5 focus:ring-[#E57138]" />
                    <div>
                      <span className="text-sm text-gray-900 font-bold block">Allow Reseller Promotion?</span>
                      <span className="text-xs text-gray-500">Opt-in to allow resellers to market your product.</span>
                    </div>
                  </label>
                  {allowResellerMargin && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Margin Percentage (Min 5%)</label>
                      <input type="number" min="5" max="90" value={resellerMarginPercentage} onChange={e => setResellerMarginPercentage(Math.max(5, Number(e.target.value)))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#E57138] outline-none transition-all" required />
                      <div className="text-xs text-green-600 font-bold mt-2">
                        Resellers will sell this at a ₹{Math.floor(Number(productPrice || 0) * (Number(resellerMarginPercentage) / 100))} discount.
                      </div>
                    </div>
                  )}
                </div>
              </div>
`;

// Insert into Weaver form right before Upload Images
code = code.replace(
  '              <div>\n                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Images (Max 4)</label>',
  marginUI + '\n              <div>\n                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Images (Max 4)</label>'
);

// We need to do the same for Vendor form
// Vendor form might have a similar "Upload Images" block
// Let's use string split approach to insert safely

fs.writeFileSync('src/app/dashboard/page.tsx', code, 'utf8');
