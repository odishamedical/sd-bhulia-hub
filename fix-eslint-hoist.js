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
  
  // Fix hoisting issues
  if (content.match(/const fetch[A-Za-z0-9_]+ = async \(\) => \{/)) {
    content = content.replace(/const (fetch[A-Za-z0-9_]+) = async \(\) => \{/g, 'async function $1() {');
    changed = true;
  }
  
  if (changed) fs.writeFileSync(file, content);
});
