const fs = require('fs');
const path = require('path');

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
  
  if (content.includes(': unknown')) {
    content = content.replace(/: unknown/g, ': any');
    changed = true;
  }
  if (content.includes('<unknown>')) {
    content = content.replace(/<unknown>/g, '<any>');
    changed = true;
  }
  
  if (changed) fs.writeFileSync(file, content);
});
