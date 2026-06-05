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

// 1. AdminLayout.tsx
replaceInFile('src/app/admin/layout.tsx', [
  { search: /bg-gray-50\/50/g, replace: 'bg-[#051815]' },
  { search: /bg-white/g, replace: 'bg-[#0B2B26]' },
  { search: /bg-gray-50/g, replace: 'bg-[#0A3A35]' },
  { search: /text-gray-800/g, replace: 'text-gray-200' },
  { search: /text-gray-900/g, replace: 'text-white' },
  { search: /text-gray-700/g, replace: 'text-gray-300' },
  { search: /text-gray-600/g, replace: 'text-gray-400' },
  { search: /text-gray-500/g, replace: 'text-gray-500' },
  { search: /border-gray-200/g, replace: 'border-[#C5A059]/30' },
  { search: /border-gray-100/g, replace: 'border-[#C5A059]/20' },
  { search: /text-blue-600/g, replace: 'text-[#C5A059]' },
  { search: /bg-blue-600/g, replace: 'bg-[#C5A059]' },
  { search: /text-blue-700/g, replace: 'text-[#C5A059]' },
  { search: /bg-blue-50/g, replace: 'bg-[#0A3A35]' },
  { search: /border-blue-100\/50/g, replace: 'border-[#C5A059]/40' },
  { search: /from-blue-500 to-blue-700/g, replace: 'from-[#996515] to-[#C5A059]' },
  { search: /bg-gradient-to-br from-\[#996515\] to-\[#C5A059\]/g, replace: 'bg-gradient-to-br from-[#996515] to-[#C5A059] text-[#0A1021]' }, // Ensure text color is dark on gold
  { search: /Trust Blue Enterprise Engine/g, replace: 'Bhulia Premium Enterprise' },
  { search: /border-blue-200/g, replace: 'border-[#C5A059]' }
]);

// 2. Staff Page
replaceInFile('src/app/admin/staff/page.tsx', [
  { search: /bg-white/g, replace: 'bg-[#0B2B26]' },
  { search: /bg-gray-50/g, replace: 'bg-[#0A3A35]' },
  { search: /text-gray-900/g, replace: 'text-white' },
  { search: /text-gray-700/g, replace: 'text-gray-300' },
  { search: /text-gray-600/g, replace: 'text-gray-400' },
  { search: /text-gray-500/g, replace: 'text-gray-500' },
  { search: /border-gray-200/g, replace: 'border-[#C5A059]/30' },
  { search: /border-gray-100/g, replace: 'border-[#C5A059]/20' },
  { search: /bg-blue-600/g, replace: 'bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021]' },
  { search: /hover:bg-blue-700/g, replace: 'hover:opacity-90' },
  { search: /text-blue-600/g, replace: 'text-[#C5A059]' },
  { search: /bg-blue-100/g, replace: 'bg-[#C5A059]/20' },
  { search: /text-blue-800/g, replace: 'text-[#C5A059]' },
  { search: /from-blue-500 to-purple-600/g, replace: 'from-[#996515] to-[#C5A059]' },
  { search: /bg-gray-300 text-gray-700/g, replace: 'bg-[#051815] text-[#C5A059] border border-[#C5A059]/30' },
  { search: /border-blue-100/g, replace: 'border-[#C5A059]/40' },
  { search: /bg-blue-50/g, replace: 'bg-[#0A3A35]' },
  { search: /text-blue-500/g, replace: 'text-[#C5A059]' },
  { search: /bg-blue-500/g, replace: 'bg-[#C5A059]' }
]);

console.log("Admin Theme Upgraded!");
