const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');

let content = fs.readFileSync(targetFile, 'utf8');

// Match precisely: <div className="bg-white p-6 rounded-3xl ...">
// <h3 ...>TITLE</h3>
// <p ...>VALUE</p>
// </div>
// without allowing inner divs or svgs to mess it up.
const regex = /<div className="bg-white p-6 rounded-3xl[^>]*?>\s*<h3[^>]*?>([^<]+)<\/h3>\s*<p[^>]*?>([^<]+)<\/p>\s*<\/div>/g;

let matchCount = 0;
const newContent = content.replace(regex, (match, title, value) => {
    matchCount++;
    // We already know value has no tags because of ([^<]+)
    return `<PremiumMetricCard title="${title.trim()}" value={<>${value.trim()}</>} index={${matchCount - 1}} />`;
});

if (content !== newContent) {
    let lines = newContent.split('\n');
    let hasImport = lines.some(l => l.includes('import PremiumMetricCard'));
    if (!hasImport) {
        let firstImportIdx = lines.findIndex(l => l.startsWith('import '));
        if (firstImportIdx === -1) {
            firstImportIdx = lines.findIndex(l => !l.startsWith('"use client"'));
            if(firstImportIdx === -1) firstImportIdx = 0;
        }
        lines.splice(firstImportIdx, 0, `import PremiumMetricCard from "@/components/PremiumMetricCard";`);
    }

    fs.writeFileSync(targetFile, lines.join('\n'), 'utf8');
    console.log(`Updated ${targetFile} with ${matchCount} replacements.`);
} else {
    console.log("No matches found or no changes made.");
}
