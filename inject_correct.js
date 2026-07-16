const fs = require('fs');

let lines = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8').split('\n');

// Find index for import
let importIndex = lines.findIndex(line => line.includes('import SellerSetupHub'));
if (importIndex !== -1) {
    lines.splice(importIndex + 1, 0, 'import SaaSUpgraderModal from "@/components/SaaSUpgraderModal";');
}

// Find SellerDashboard function
let sellerDashboardStart = lines.findIndex(line => line.includes('function SellerDashboard'));

if (sellerDashboardStart !== -1) {
    // Inject state inside SellerDashboard
    let stateIndex = lines.findIndex((line, i) => i > sellerDashboardStart && line.includes('const [canSellWholesale, setCanSellWholesale]'));
    if (stateIndex !== -1) {
        lines.splice(stateIndex + 1, 0, '  const [isUpgraderOpen, setIsUpgraderOpen] = useState(false);');
    }

    // Inject modal render inside SellerDashboard return statement
    let returnIndex = lines.findIndex((line, i) => i > sellerDashboardStart && line.includes('return (') && lines[i+1].includes('space-y-6'));
    if (returnIndex !== -1) {
        lines[returnIndex + 1] = lines[returnIndex + 1].replace('space-y-6', 'space-y-6 relative');
        lines.splice(returnIndex + 2, 0, '      <SaaSUpgraderModal isOpen={isUpgraderOpen} onClose={() => setIsUpgraderOpen(false)} />');
    }

    // Inject banner inside activeTab === "home"
    let homeTabIndex = lines.findIndex((line, i) => i > sellerDashboardStart && line.includes('activeTab === "home"'));
    if (homeTabIndex !== -1) {
        // Look for the grid grid-cols-1 md:grid-cols-3 line
        let gridIndex = lines.findIndex((line, i) => i > homeTabIndex && i < homeTabIndex + 10 && line.includes('grid grid-cols-1 md:grid-cols-3 gap-6'));
        if (gridIndex !== -1) {
            const banner = `
          {/* UPGRADE BANNER */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
              <div className="w-48 h-48 bg-white rounded-full"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-2">🚀 Upgrade to Pro Seller</h2>
              <p className="text-blue-200 font-medium max-w-xl text-sm leading-relaxed">
                Unlock automated Shiprocket logistics, B2B wholesale selling, and unlimited product uploads. Supercharge your business today!
              </p>
            </div>
            <button 
              onClick={() => setIsUpgraderOpen(true)}
              className="relative z-10 shrink-0 bg-white text-blue-900 px-8 py-3 rounded-xl font-black shadow-lg hover:bg-gray-50 transition-colors transform hover:-translate-y-1"
            >
              Upgrade Now (₹999)
            </button>
          </div>
`;
            lines.splice(gridIndex, 0, banner);
        }
    }
}

fs.writeFileSync('src/app/dashboard/page.tsx', lines.join('\n'));
console.log('Injection completed');
