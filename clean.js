const fs = require('fs');
const files = [
  'src/app/page.tsx',
  'src/app/franchise/[slug]/page.tsx',
  'src/app/product/[productId]/page.tsx',
  'src/app/register-store/page.tsx',
  'src/app/register-weaver/page.tsx',
  'src/app/store/[slug]/layout.tsx',
  'src/app/store/[slug]/page.tsx',
  'src/app/weaver/[slug]/page.tsx',
  'src/app/[slug]/page.tsx',
  'src/app/register-franchise/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/checkout/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove <Header />
  content = content.replace(/<Header \/>/g, '');
  content = content.replace(/import Header from [\'\"]@\/components\/Header[\'\"];?\n?/g, '');
  
  // Remove <header ... </header>
  content = content.replace(/<header[\s\S]*?<\/header>/g, '');
  
  // Remove <footer ... </footer>
  content = content.replace(/<footer[\s\S]*?<\/footer>/g, '');
  
  // Fix empty fragments if left empty by header/footer removal
  
  fs.writeFileSync(file, content);
  console.log('Processed', file);
});
