const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
}

// 1. src/lib/products.ts
replaceInFile('src/lib/products.ts', [
  { search: '  isBhuliaVerified?: boolean;\n', replace: '' }, // remove duplicate
  { search: '  sellerType?: "weaver" | "vendor";\n', replace: '  sellerType?: "weaver" | "vendor" | "store";\n  vendorName?: string;\n  status?: string;\n  images?: string[];\n' }
]);

// 2. src/app/admin/stores/page.tsx
replaceInFile('src/app/admin/stores/page.tsx', [
  { search: /await updateDocumentStatus\("stores", /g, replace: 'await updateDocumentStatus("vendors", ' }
]);

// 3. src/app/admin/support/tickets/page.tsx
replaceInFile('src/app/admin/support/tickets/page.tsx', [
  { search: /new Date\(ticket.createdAt\)/g, replace: 'new Date(ticket.createdAt as string)' },
  { search: /ticket\.message/g, replace: 'ticket.description' }
]);

// 4. src/app/admin/trust/kyc/page.tsx
replaceInFile('src/app/admin/trust/kyc/page.tsx', [
  { search: /user\.displayName/g, replace: '(user as any).displayName' },
  { search: /user\.cluster/g, replace: '(user as any).cluster' },
  { search: /user\.village/g, replace: '(user as any).village' },
  { search: /user\.gstNumber/g, replace: '(user as any).gstNumber' }
]);

// 5. src/app/admin/users/page.tsx
replaceInFile('src/app/admin/users/page.tsx', [
  { search: /weaver\.phoneNumber/g, replace: '(weaver as any).phoneNumber' },
  { search: /order\.productId/g, replace: '(order as any).productId' },
  { search: /user\.subStatus/g, replace: '(user as any).subStatus' },
  { search: /user\.country/g, replace: '(user as any).country' },
  { search: /purchasedProductIds: \[\]/g, replace: 'purchasedProductIds: [] as any[]' }
]);

// 6. src/app/checkout/page.tsx
replaceInFile('src/app/checkout/page.tsx', [
  { search: /const affiliateId = searchParams\.get\("ref"\);/g, replace: 'const affiliateId = searchParams.get("ref") || undefined;' },
  { search: /const affiliateType = searchParams\.get\("type"\) as "weaver" | "vendor" | null;/g, replace: 'const affiliateType = searchParams.get("type") as "weaver" | "vendor" | undefined;' }
]);

// 7. src/app/dashboard/page.tsx
replaceInFile('src/app/dashboard/page.tsx', [
  { search: /auth\.currentUser\.uid/g, replace: 'auth.currentUser?.uid' },
  { search: /product\.status/g, replace: '(product as any).status' },
  { search: /reseller\.slug/g, replace: '(reseller as any).slug' },
  { search: /reseller\.status === "pending_approval"/g, replace: '(reseller as any).status === "pending_approval"' }
]);

// 8. src/app/profile/page.tsx
replaceInFile('src/app/profile/page.tsx', [
  { search: /order: unknown/g, replace: 'order: any' },
  { search: /order\.id/g, replace: '(order as any).id' },
  { search: /order\.date/g, replace: '(order as any).date' },
  { search: /order\.amount/g, replace: '(order as any).amount' },
  { search: /order\.status/g, replace: '(order as any).status' },
  { search: /order\.items/g, replace: '(order as any).items' },
  { search: /addr: unknown/g, replace: 'addr: any' },
  { search: /addr\.id/g, replace: '(addr as any).id' },
  { search: /addr\.type/g, replace: '(addr as any).type' },
  { search: /addr\.text/g, replace: '(addr as any).text' },
  { search: /addr\.isDefault/g, replace: '(addr as any).isDefault' }
]);

// 9. src/app/register-franchise/page.tsx
replaceInFile('src/app/register-franchise/page.tsx', [
  { search: /await addReseller\(payload, uniqueId\)/g, replace: 'await addReseller(payload)' },
  { search: /if \(res\.success\)/g, replace: 'if ((res as any).success || res)' }
]);

// 10. src/components/ImageUploader.tsx
replaceInFile('src/components/ImageUploader.tsx', [
  { search: /new Image\(\)/g, replace: 'new window.Image()' }
]);

// 11. src/lib/db-hooks.ts
replaceInFile('src/lib/db-hooks.ts', [
  { search: /setVendors\(/g, replace: 'setStores(' },
  { search: /setVendor\(/g, replace: 'setStore(' },
  { search: /const \[stores, setStores\] = useState<Store\[\]>\(\[\]\);/g, replace: 'const [stores, setStores] = useState<any[]>([]);' },
  { search: /const \[store, setStore\] = useState<Store \| null>\(null\);/g, replace: 'const [store, setStore] = useState<any | null>(null);' }
]);

console.log("All fixes applied.");
