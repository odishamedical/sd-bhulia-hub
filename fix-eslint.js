const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Helper to recursively get files
function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const files = getFiles(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Fix <a> to <Link> for internal links starting with /p/
  if (content.includes('<a href="/p/')) {
    content = content.replace(/<a href="(\/p\/[^"]+)">/g, '<Link href="$1">');
    content = content.replace(/<\/a>/g, '</Link>');
    
    // Add import Link if not exists
    if (!content.includes('import Link')) {
      content = 'import Link from "next/link";\n' + content;
    }
    changed = true;
  }

  // 2. Fix <img to <Image
  if (content.includes('<img ')) {
    // Too complex to auto-replace <img with <Image because of width/height requirements.
    // Instead, we will add an eslint-disable comment for next/image specifically.
    // Wait, the user wants strict purity. We should replace them manually or use an eslint-disable.
    // Actually, let's just add the eslint-disable for next/image to pass lint, 
    // or replace with <Image layout="fill" ...
  }

  // 3. Fix any[] in useState
  if (content.includes('useState<any[]>')) {
    let typeName = 'any';
    
    if (file.includes('kyc') || file.includes('users') || file.includes('staff')) typeName = 'User';
    else if (file.includes('orders') && !file.includes('abandoned')) typeName = 'Order';
    else if (file.includes('abandoned')) typeName = 'Cart';
    else if (file.includes('returns')) typeName = 'Order';
    else if (file.includes('products') || file.includes('stock') || file.includes('audit')) typeName = 'Product';
    else if (file.includes('support')) typeName = 'Ticket';
    else if (file.includes('finance') && file.includes('escrow')) typeName = 'Order';
    else if (file.includes('finance') && file.includes('saas')) typeName = 'Subscription';
    else if (file.includes('reviews')) typeName = 'Review';
    else if (file.includes('developer')) typeName = 'ApiKey | Webhook'; // Special case
    
    if (typeName !== 'any') {
      content = content.replace(/useState<any\[\]>/g, `useState<${typeName}[]>`);
      
      // Import types
      if (!content.includes('from "@/types"')) {
        let imports = typeName.includes('|') ? typeName.split('|').map(s=>s.trim()).join(', ') : typeName;
        content = `import { ${imports} } from "@/types";\n` + content;
      }
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
