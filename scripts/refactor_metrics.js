const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function scanAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Regex to match the metric card pattern
            const regex = /<div className="bg-white p-6 rounded-3xl[^>]*?>[\s\S]*?<h3[^>]*?>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*?>([\s\S]*?)<\/p>[\s\S]*?<\/div>/g;
            
            let matchCount = 0;
            const newContent = content.replace(regex, (match, title, value) => {
                matchCount++;
                return `<PremiumMetricCard title="${title.trim()}" value={<>${value.trim()}</>} index={${matchCount - 1}} />`;
            });

            if (content !== newContent) {
                // If it doesn't already import PremiumMetricCard, add it
                if (!newContent.includes('PremiumMetricCard')) {
                    const importStatement = `import PremiumMetricCard from "@/components/PremiumMetricCard";\n`;
                    // Add it after "use client" or other imports
                    const lines = newContent.split('\n');
                    let insertIndex = lines.findIndex(line => line.includes('import '));
                    if (insertIndex === -1) insertIndex = 0; // if no imports, put at top
                    // wait, find the last import or just the first import
                    lines.splice(insertIndex, 0, importStatement);
                    content = lines.join('\n');
                } else {
                    content = newContent;
                }
                
                // One little detail: if `matchCount` resets per file, it might just start index={0} per grid, which is perfect!
                // But we must fix the import logic: only add if we matched.
                // Re-evaluate content because we might have modified it in the if block.
                
                let lines2 = newContent.split('\n');
                let hasImport = lines2.some(l => l.includes('import PremiumMetricCard'));
                if (!hasImport) {
                     let firstImportIdx = lines2.findIndex(l => l.startsWith('import '));
                     if (firstImportIdx === -1) {
                         firstImportIdx = lines2.findIndex(l => !l.startsWith('"use client"'));
                         if(firstImportIdx === -1) firstImportIdx = 0;
                     }
                     lines2.splice(firstImportIdx, 0, `import PremiumMetricCard from "@/components/PremiumMetricCard";`);
                }

                fs.writeFileSync(fullPath, lines2.join('\n'), 'utf8');
                console.log(`Updated ${fullPath} with ${matchCount} replacements.`);
                modified = true;
            }
        }
    }
}

scanAndReplace(srcDir);
console.log('Global metric card replacement complete.');
