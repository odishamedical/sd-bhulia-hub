const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/register-franchise/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/admin/users/page.tsx',
  'src/app/admin/stores/page.tsx',
  'src/app/admin/franchises/page.tsx',
  'src/app/admin/dashboard/page.tsx',
  'src/app/admin/finance/subscriptions/page.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hooks
    content = content.replace(/useStores/g, 'useVendors');
    content = content.replace(/useFranchises/g, 'useResellers');
    content = content.replace(/addStore/g, 'addVendor');
    content = content.replace(/addFranchise/g, 'addReseller');
    content = content.replace(/deleteStore/g, 'deleteVendor');
    content = content.replace(/deleteFranchise/g, 'deleteReseller');
    
    // Replace destructured variables
    content = content.replace(/const { stores/g, 'const { vendors: stores');
    content = content.replace(/const { franchises/g, 'const { resellers: franchises');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
