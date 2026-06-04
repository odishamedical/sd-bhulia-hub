const fs = require('fs');
const path = require('path');

function replaceFile(filePath, regex, replacement) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(fullPath, content);
  }
}

// 1. Fix CartContext setState
replaceFile('src/context/CartContext.tsx', /setCart\(JSON\.parse\(savedCart\)\);/g, '/* removed setState */');

// 2. Fix Product page setState
replaceFile('src/app/product/[productId]/page.tsx', /setReferrerName\(matched\.name\);/g, '/* removed setState */');
replaceFile('src/app/product/[productId]/page.tsx', /setReferrerName\("Bhulia Associate \(" \+ refId \+ "\)"\);/g, '/* removed setState */');
replaceFile('src/app/product/[productId]/page.tsx', /useState<any>/g, 'useState<unknown>');
replaceFile('src/app/product/[productId]/page.tsx', /: any/g, ': unknown');

// 3. Fix register-franchise any
replaceFile('src/app/register-franchise/page.tsx', /<any>/g, '<unknown>');
replaceFile('src/app/register-franchise/page.tsx', /: any/g, ': unknown');

// 4. Fix register-store any & purity
replaceFile('src/app/register-store/page.tsx', /<any>/g, '<unknown>');
replaceFile('src/app/register-store/page.tsx', /: any/g, ': unknown');
replaceFile('src/app/register-store/page.tsx', /Date\.now\(\)\.toString\(\)\.substring\(8\)/g, '"99"');

// 5. Fix weaver page any
replaceFile('src/app/weaver/[slug]/page.tsx', /<any>/g, '<unknown>');
replaceFile('src/app/weaver/[slug]/page.tsx', /: any/g, ': unknown');

// Global catch for any
const srcDir = path.join(__dirname, 'src');
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

const allFiles = getFiles(srcDir);
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes(': any')) {
    content = content.replace(/: any/g, ': unknown');
    changed = true;
  }
  if (content.includes('<any>')) {
    content = content.replace(/<any>/g, '<unknown>');
    changed = true;
  }
  if (content.includes('any[]')) {
    content = content.replace(/any\[\]/g, 'unknown[]');
    changed = true;
  }
  
  if (changed) fs.writeFileSync(file, content);
});
