const fs = require('fs');

let lines = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8').split('\n');

// Find SellerDashboard function
let sellerDashboardStart = lines.findIndex(line => line.includes('function SellerDashboard'));

if (sellerDashboardStart !== -1) {
    let homeTabIndex = lines.findIndex((line, i) => i > sellerDashboardStart && line.includes('activeTab === "home"'));
    if (homeTabIndex !== -1) {
        // Fix the JSX syntax error by wrapping the banner and the grid in a div
        let gridIndex = lines.findIndex((line, i) => i > homeTabIndex && i < homeTabIndex + 30 && line.includes('grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in'));
        if (gridIndex !== -1) {
            lines[gridIndex] = lines[gridIndex].replace(' animate-in fade-in', '');
            lines.splice(gridIndex - 20, 0, '        <div className="space-y-6 animate-in fade-in">');
            
            // Now we need to close this new div after the grid's closing tag
            // The grid closes around 15 lines later, let's find the closing tag
            // Actually, we can just find the end of activeTab === "home" block
            let homeTabEnd = lines.findIndex((line, i) => i > gridIndex && line.includes(')}'));
            if (homeTabEnd !== -1) {
                 lines.splice(homeTabEnd, 0, '        </div>');
            }
        }
    }
}

fs.writeFileSync('src/app/dashboard/page.tsx', lines.join('\n'));
console.log('Fixed JSX');
