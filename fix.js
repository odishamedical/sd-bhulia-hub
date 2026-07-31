const fs = require('fs');
const path = require('path');

const filesToFix = [
  'e:/web-app-projects-2026/sd-bhulia-hub/src/app/dashboard/page.tsx',
  'e:/web-app-projects-2026/sd-bhulia-hub/src/app/dashboard/supplier/page.tsx',
  'e:/web-app-projects-2026/sd-bhulia-hub/src/app/dashboard/wholesaler/page.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // The corrupted string looks exactly like:
  // " undefined\ ? (localStorage.getItem(\admin_impersonating_shop\) || localStorage.getItem(\sd_boss_uid\)) : null
  
  // We want to replace it with:
  // "undefined" ? (localStorage.getItem("admin_impersonating_shop") || localStorage.getItem("sd_boss_uid")) : null

  content = content.replace(/" undefined\\ \? \(localStorage\.getItem\(\\admin_impersonating_shop\\\) \|\| localStorage\.getItem\(\\sd_boss_uid\\\)\) : null/g, '"undefined" ? (localStorage.getItem("admin_impersonating_shop") || localStorage.getItem("sd_boss_uid")) : null');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
});
