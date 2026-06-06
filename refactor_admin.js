const fs = require('fs');

let content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

// 1. Add imports and states
const importRegex = /import \{ useProducts, deleteProduct \} from "@\/lib\/db-hooks";/;
const importReplacement = `import { useState } from "react";\nimport { useProducts, deleteProduct } from "@/lib/db-hooks";`;
content = content.replace(importRegex, importReplacement);

const hookRegex = /const \{ products, loading \} = useProducts\(\);/;
const hookReplacement = `const { products, loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.vendorName && p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const productStatus = p.status || "pending";
    let matchesStatus = true;
    if (statusFilter === "in_stock") matchesStatus = p.inStock;
    else if (statusFilter === "out_of_stock") matchesStatus = !p.inStock;
    else if (statusFilter !== "all") matchesStatus = productStatus === statusFilter;

    const matchesSeller = sellerFilter === "all" || p.sellerType === sellerFilter;

    // Simplified date matching
    let matchesDate = true;
    if (dateFilter !== "all" && p.createdAt) {
      const createdDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = createdDate.toDateString() === now.toDateString();
      } else if (dateFilter === "this_month") {
        matchesDate = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "last_month") {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = createdDate.getMonth() === lastMonth.getMonth() && createdDate.getFullYear() === lastMonth.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesSeller && matchesDate;
  });`;
content = content.replace(hookRegex, hookReplacement);

// 2. Replace map with filteredProducts and add Filter UI
const mapRegex = /\{products\.map\(\(product\) => \(/g;
const mapReplacement = `{filteredProducts.map((product) => (`;
content = content.replace(mapRegex, mapReplacement);

const emptyRegex = /\{products\.length === 0 && \(/g;
const emptyReplacement = `{filteredProducts.length === 0 && (`;
content = content.replace(emptyRegex, emptyReplacement);

// 3. Add UI
const tableContainerRegex = /<div className="bg-white shadow-sm border border-gray-200\/80 border border-\[#C5A059\]\/30 rounded-3xl overflow-hidden shadow-xl">/;
const tableContainerReplacement = `<div className="bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID, Title, or Vendor..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none text-sm text-gray-900 bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <select 
              className="flex-1 lg:w-auto py-2 px-4 rounded-xl border border-gray-200 focus:border-[#C5A059] outline-none text-sm bg-gray-50 text-gray-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending QC</option>
              <option value="rejected">Rejected</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select 
              className="flex-1 lg:w-auto py-2 px-4 rounded-xl border border-gray-200 focus:border-[#C5A059] outline-none text-sm bg-gray-50 text-gray-900"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              <option value="all">All Sellers</option>
              <option value="weaver">Master Weavers</option>
              <option value="vendor">Stores / Vendors</option>
            </select>
            <select 
              className="flex-1 lg:w-auto py-2 px-4 rounded-xl border border-gray-200 focus:border-[#C5A059] outline-none text-sm bg-gray-50 text-gray-900"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">`;
content = content.replace(tableContainerRegex, tableContainerReplacement);

// 4. Update the scroll container
const tableScrollRegex = /<div className="overflow-x-auto">/g;
const tableScrollReplacement = `<div className="overflow-x-auto max-h-[700px] overflow-y-auto custom-scrollbar">`;
content = content.replace(tableScrollRegex, tableScrollReplacement);


fs.writeFileSync('src/app/admin/products/page.tsx', content);
console.log("Refactored Admin Products.");
