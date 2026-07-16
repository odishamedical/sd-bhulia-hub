const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Inject Weaver variables
code = code.replace(
  'const [productDesc, setProductDesc] = useState("");',
  'const [productDesc, setProductDesc] = useState("");\n  const [stockQuantity, setStockQuantity] = useState(1);\n  const [allowResellerMargin, setAllowResellerMargin] = useState(false);\n  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);\n  const [productImage, setProductImage] = useState("");'
);

// Update Weaver handleUpload
const weaverUploadTarget = 'sellerType: "weaver",\n        status: "pending",';
const weaverUploadReplace = 'sellerType: "weaver",\n        status: "pending",\n        stockQuantity: Number(stockQuantity),\n        inStock: Number(stockQuantity) > 0,\n        img: productImage || "https://images.unsplash.com/photo-1605814526362-790100f91eb8?w=800&q=80",\n        isBhuliaVerified: true,\n        escrowStatus: "Payment Protected",\n        allowResellerMargin,\n        resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,\n        resellerPrice: allowResellerMargin ? String(Math.floor(Number(productPrice) * (1 - Number(resellerMarginPercentage) / 100))) : undefined,';
code = code.replace(weaverUploadTarget, weaverUploadReplace);

// Inject Vendor variables
code = code.replace(
  'const [editingProductId, setEditingProductId] = useState<string | null>(null);',
  'const [editingProductId, setEditingProductId] = useState<string | null>(null);\n  const [stockQuantity, setStockQuantity] = useState(1);\n  const [allowResellerMargin, setAllowResellerMargin] = useState(false);\n  const [resellerMarginPercentage, setResellerMarginPercentage] = useState(5);'
);

// Update Vendor productData
const vendorDataTarget = 'img4: img4,\n      };';
const vendorDataReplace = 'img4: img4,\n        stockQuantity: Number(stockQuantity),\n        inStock: Number(stockQuantity) > 0,\n        allowResellerMargin,\n        resellerMarginPercentage: allowResellerMargin ? Number(resellerMarginPercentage) : 0,\n        resellerPrice: allowResellerMargin ? String(Math.floor(Number(productPrice) * (1 - Number(resellerMarginPercentage) / 100))) : undefined,\n      };';
code = code.replace(vendorDataTarget, vendorDataReplace);

// UI Styles Replacements
code = code.replace(/bg-\[#E57138\] hover:bg-\[#D56128\]/g, 'bg-gradient-to-r from-[#E57138] to-[#D56128] shadow-md hover:shadow-lg transform hover:-translate-y-0.5');

// Find all inputs with the old border styles and replace with new premium styles
code = code.replace(/border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-\[#E57138\] focus:ring-1 focus:ring-\[#E57138\] focus:outline-none transition-colors/g, 'border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#E57138] outline-none transition-all');

code = code.replace(/bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:border-\[#E57138\] focus:ring-1 focus:ring-\[#E57138\] focus:outline-none transition-colors/g, 'bg-white border border-gray-300 rounded-xl p-3 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#E57138] outline-none transition-all');

code = code.replace(/border border-gray-200 rounded-xl p-3 text-sm focus:border-\[#E57138\] focus:outline-none/g, 'border border-gray-300 rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#E57138] outline-none transition-all');

// Write back
fs.writeFileSync('src/app/dashboard/page.tsx', code, 'utf8');
