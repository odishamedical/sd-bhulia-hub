const fs = require('fs');

let dashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. View Storefront for Vendor
const vendorHubRegex = /<h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Vendor Hub<\/h1>\s*<p className="text-gray-500 mt-2 font-medium">Manage your retail inventory and dispatch operations\.<\/p>/g;
const vendorHubReplacement = `<h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Vendor Hub</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-500 font-medium">Manage your retail inventory and dispatch operations.</p>
            <a href={"/vendor/" + (storeName?.toLowerCase().replace(/\\s+/g, '-') || 'demo')} target="_blank" className="text-xs font-bold text-[#0070F3] hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              View Storefront ↗
            </a>
          </div>`;

dashboard = dashboard.replace(vendorHubRegex, vendorHubReplacement);

// 2. View Storefront for Weaver
const weaverHubRegex = /<h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Master Weaver Hub<\/h1>\s*<p className="text-gray-500 mt-2 font-medium">Manage your digital storefront and orders\.<\/p>/g;
const weaverHubReplacement = `<h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Master Weaver Hub</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-500 font-medium">Manage your digital storefront and orders.</p>
            <a href={"/weaver/" + (auth.currentUser?.displayName?.toLowerCase().replace(/\\s+/g, '-') || 'demo')} target="_blank" className="text-xs font-bold text-[#0070F3] hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              View Storefront ↗
            </a>
          </div>`;

dashboard = dashboard.replace(weaverHubRegex, weaverHubReplacement);

// 3. View Live link in Vendor Catalog
const catalogEditRegex = /<button onClick=\{\(\) => handleEditClick\(product\)\} className="text-\[#0070F3\] font-bold text-xs hover:underline">\s*Edit\s*<\/button>/g;
const catalogEditReplacement = `<a href={"/product/" + product.id} target="_blank" className="text-gray-500 font-bold text-xs hover:text-gray-900 hover:underline mr-4">View Live ↗</a>
                            <button onClick={() => handleEditClick(product)} className="text-[#0070F3] font-bold text-xs hover:underline">
                              Edit
                            </button>`;

dashboard = dashboard.replace(catalogEditRegex, catalogEditReplacement);

fs.writeFileSync('src/app/dashboard/page.tsx', dashboard);
console.log("Storefront links forcefully injected.");
