const fs = require('fs');

const filePath = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startPattern = /^\s*\{activeTab === "products" && \(\n\s*<div className="bg-white p-8 rounded-3xl/m;
const endPattern = /<\/form>\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\)\}/;

const startMatch = content.match(startPattern);
if (!startMatch) {
    console.log('Start pattern not found!');
    process.exit(1);
}

const startIdx = startMatch.index;
const contentFromStart = content.slice(startIdx);
const endMatch = contentFromStart.match(endPattern);

if (!endMatch) {
    console.log('End pattern not found!');
    process.exit(1);
}

const endIdx = startIdx + endMatch.index + endMatch[0].length;

const replacement = `      {activeTab === "products" && (
        <ProductManager 
          subscriptionTier={subscriptionTier}
          setIsUpgraderOpen={setIsUpgraderOpen}
          sellerProductsRaw={sellerProductsRaw}
          sellerRole={actualRole}
          isAutoApprovedUser={subscriptionTier !== "free"}
          storeName={userData?.personalName || ""}
        />
      )}`;

let newContent = content.slice(0, startIdx) + replacement + content.slice(endIdx);

const importStmt = 'import ProductManager from "@/components/dashboard/ProductManager";\n';
if (!newContent.includes(importStmt)) {
    const importIdx = newContent.indexOf('import OrderManager');
    if (importIdx !== -1) {
        newContent = newContent.slice(0, importIdx) + importStmt + newContent.slice(importIdx);
    }
}

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('Successfully replaced products tab and added import.');
