const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Remove redundant Add Inventory button from Vendor Hub Header
const vendorHeaderRegex = /<button onClick=\{\(\) => onTabChange\("products"\)\} className="bg-\[#0070F3\] text-white px-6 py-2\.5 rounded-xl font-bold hover:bg-\[#005BB5\] transition-colors shadow-sm self-start md:self-auto">\s*\+\s*Add Inventory\s*<\/button>/g;
content = content.replace(vendorHeaderRegex, '');

// 2. Remove redundant Upload Product button from Weaver Hub Header
const weaverHeaderRegex = /<button onClick=\{\(\) => onTabChange\("upload"\)\} className="bg-\[#0070F3\] text-white px-6 py-2\.5 rounded-xl font-bold hover:bg-\[#005BB5\] transition-colors shadow-sm self-start md:self-auto">\s*\+\s*Upload Product\s*<\/button>/g;
content = content.replace(weaverHeaderRegex, '');

// 3. Add search and filter state to VendorDashboard
const vendorStateRegex = /const \[isAddInventoryOpen, setIsAddInventoryOpen\] = useState\(false\);/;
const vendorStateReplacement = `const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");`;
content = content.replace(vendorStateRegex, vendorStateReplacement);

// 4. Implement filter logic in VendorDashboard
const vendorProductsRegex = /const vendorProducts = products\.filter\(p => p\.sellerId === auth\.currentUser\?\.uid\);/;
const vendorProductsReplacement = `const vendorProductsRaw = products.filter(p => p.sellerId === auth.currentUser?.uid);
  const vendorProducts = vendorProductsRaw.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const productStatus = p.status || "pending";
    const matchesStatus = statusFilter === "all" || productStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });`;
content = content.replace(vendorProductsRegex, vendorProductsReplacement);

// 5. Add UI above Products Catalog and custom scroll container
const catalogHeaderRegex = /<div className="flex justify-between items-center mb-8">\s*<h2 className="text-2xl font-bold text-gray-900">Products Catalog<\/h2>\s*<button onClick=\{handleAddNewClick\} className="bg-\[#1f2937\] text-white px-5 py-2\.5 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">\s*\+\s*Add Inventory\s*<\/button>\s*<\/div>/g;

const catalogHeaderReplacement = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Products Catalog</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage and track your inventory.</p>
                </div>
                <button onClick={handleAddNewClick} className="bg-[#1f2937] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors shadow-sm w-full md:w-auto">
                  + Add Inventory
                </button>
              </div>

              {vendorProductsRaw.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search products by name..." 
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="py-2 px-4 rounded-xl border border-gray-200 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3] outline-none text-sm bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending QC</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}`;
content = content.replace(catalogHeaderRegex, catalogHeaderReplacement);

// 6. Wrap table in scroll container and improve buttons
const tableStartRegex = /<div className="overflow-x-auto">/g;
const tableStartReplacement = `<div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-xl border border-gray-100">`;
content = content.replace(tableStartRegex, tableStartReplacement);

const emptyStateRegex = /vendorProducts\.length === 0 \?/g;
const emptyStateReplacement = `vendorProductsRaw.length === 0 ?`;
content = content.replace(emptyStateRegex, emptyStateReplacement);

const actionButtonsRegex = /<td className="py-4 text-right">\s*<a href=\{"\/product\/" \+ product\.id\} target="_blank" className="text-gray-500 font-bold text-xs hover:text-gray-900 hover:underline mr-4">View Live ↗<\/a>\s*<button onClick=\{\(\) => handleEditClick\(product\)\} className="text-\[#0070F3\] font-bold text-xs hover:underline">\s*Edit\s*<\/button>\s*<\/td>/g;
const actionButtonsReplacement = `<td className="py-4 text-right whitespace-nowrap">
                            <a href={"/product/" + product.id} target="_blank" className="inline-block bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors mr-2">
                              View Live ↗
                            </a>
                            <button onClick={() => handleEditClick(product)} className="inline-block bg-blue-50 text-[#0070F3] border border-blue-100 hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
                              Edit
                            </button>
                          </td>`;
content = content.replace(actionButtonsRegex, actionButtonsReplacement);


fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Refactored Dashboard.");
