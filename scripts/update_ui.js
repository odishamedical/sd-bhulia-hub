const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src', 'app', 'admin'));

let updatedFiles = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Main containers
    content = content.replace(/bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden/g, 'bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden');
    
    // 2. Main containers without overflow-hidden (if any)
    content = content.replace(/bg-white rounded-2xl shadow-sm border border-gray-200/g, 'bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100');

    // 3. Error/Denied containers
    content = content.replace(/bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm/g, 'bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
        updatedFiles++;
    }
}

console.log(`Updated ${updatedFiles} files.`);
