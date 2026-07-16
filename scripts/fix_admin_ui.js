const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

// 1. Fix all invisible subtitles in admin pages
walkDir('src/app/admin', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('className="text-gray-500 mt-2 font-medium"')) {
      content = content.replace(/className="text-gray-500 mt-2 font-medium"/g, 'className="text-gray-800 mt-2 font-semibold"');
      changed = true;
    }
    
    // Also fix the Staff & Delegation page specifically if it uses a different class
    if (content.includes('className="text-gray-500 mt-2"')) {
      content = content.replace(/className="text-gray-500 mt-2"/g, 'className="text-gray-800 mt-2 font-semibold"');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
    }
  }
});

// 2. Make the "Uploaded By" text clickable
let adminProducts = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');
const unclickable = `<td className="px-6 py-4 font-medium">
                      <div className="text-gray-900 font-bold">{product.vendorName || "Admin"}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{product.sellerType || "system"}</div>
                    </td>`;
const clickable = `<td className="px-6 py-4 font-medium">
                      <a href={product.sellerType === 'weaver' ? '/admin/weavers' : '/admin/stores'} className="hover:bg-gray-100 p-2 -ml-2 rounded-lg transition-colors inline-block">
                        <div className="text-[#0070F3] hover:text-[#005BB5] font-bold">{product.vendorName || "Admin"}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{product.sellerType || "system"}</div>
                      </a>
                    </td>`;
adminProducts = adminProducts.split(unclickable).join(clickable);
fs.writeFileSync('src/app/admin/products/page.tsx', adminProducts);

console.log("Global subtitle fixes and clickable uploader completed.");
