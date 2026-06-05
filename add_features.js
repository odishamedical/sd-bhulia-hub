const fs = require('fs');

// 1. Admin Products Page - Add 'Uploaded By' column
let adminProducts = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');
adminProducts = adminProducts.replace('<th className="px-6 py-4">Weaving Time</th>', '<th className="px-6 py-4">Weaving Time</th>\n                  <th className="px-6 py-4">Uploaded By</th>');
adminProducts = adminProducts.replace('<td className="px-6 py-4 text-xs font-mono">{product.time}</td>', `<td className="px-6 py-4 text-xs font-mono">{product.time}</td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-gray-900 font-bold">{product.vendorName || "Admin"}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{product.sellerType || "system"}</div>
                    </td>`);
fs.writeFileSync('src/app/admin/products/page.tsx', adminProducts);

// 2. Vendor Dashboard - Add "View Live" and "View Storefront"
let dashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Add "View Live" link in the products table
dashboard = dashboard.replace(/<button onClick=\{\(\) => handleEditClick\(product\)\} className="text-gray-500 hover:text-gray-700 font-bold text-xs uppercase tracking-wider">/g, `<a href={\`/product/\${product.slug}\`} target="_blank" className="text-[#0070F3] hover:text-[#005BB5] font-bold text-xs uppercase tracking-wider mr-4">View Live</a>\n                        <button onClick={() => handleEditClick(product)} className="text-gray-500 hover:text-gray-700 font-bold text-xs uppercase tracking-wider">`);

// Add "View Storefront" in Vendor header
dashboard = dashboard.replace(/<button onClick=\{handleAddNewClick\} className="bg-\[#0070F3\] text-white hover:bg-\[#005BB5\] transition-all font-bold px-6 py-3 rounded-xl shadow-sm text-sm">/g, `<a href={\`/vendor/\${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "store"}\`} target="_blank" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-bold px-6 py-3 rounded-xl text-sm shadow-sm flex items-center gap-2">View Storefront <span className="text-lg leading-none mb-0.5">↗</span></a>\n          <button onClick={handleAddNewClick} className="bg-[#0070F3] text-white hover:bg-[#005BB5] transition-all font-bold px-6 py-3 rounded-xl shadow-sm text-sm">`);

// Also do it for Weaver header
dashboard = dashboard.replace(/<button onClick=\{handleAddNewClick\} className="bg-\[#0070F3\] text-white px-8 py-3 rounded-xl font-bold hover:bg-\[#005BB5\] transition-colors shadow-\[0_4px_14px_0_rgb\(229,113,56,0\.39\)\]">/g, `<a href={\`/weaver/\${weaverName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "weaver"}\`} target="_blank" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-bold px-6 py-3 rounded-xl text-sm shadow-sm flex items-center gap-2">View Storefront <span className="text-lg leading-none mb-0.5">↗</span></a>\n          <button onClick={handleAddNewClick} className="bg-[#0070F3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005BB5] transition-colors shadow-[0_4px_14px_0_rgb(229,113,56,0.39)]">`);

fs.writeFileSync('src/app/dashboard/page.tsx', dashboard);

console.log("Features added!");
