const fs = require('fs');

let dashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Using regex to replace the specific span and its parent div
const regex = /<div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">\s*<span className="text-gray-500 font-medium text-sm">Click to upload or drag and drop your document file here<\/span>\s*<\/div>/g;

const realUploader = `<input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0070F3] file:text-white hover:file:bg-[#005BB5] border border-gray-200 rounded-xl p-2 cursor-pointer bg-white transition-all shadow-sm" accept=".pdf,.jpg,.jpeg,.png" required />`;

if (regex.test(dashboard)) {
    dashboard = dashboard.replace(regex, realUploader);
    fs.writeFileSync('src/app/dashboard/page.tsx', dashboard);
    console.log("Uploader successfully replaced using regex!");
} else {
    console.log("Regex did not match. Trying fallback...");
    // Fallback: Just replace the span line, and maybe the div is left over, but it will work
    dashboard = dashboard.replace(/<span className="text-gray-500 font-medium text-sm">Click to upload or drag and drop your document file here<\/span>/g, realUploader);
    fs.writeFileSync('src/app/dashboard/page.tsx', dashboard);
    console.log("Fallback replacement done.");
}
