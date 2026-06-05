const fs = require('fs');

// 1. Fix Admin Dashboard Subtitle Visibility
let adminDashboard = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');
adminDashboard = adminDashboard.replace('text-gray-500 mt-2 font-medium', 'text-gray-800 mt-2 font-semibold');
fs.writeFileSync('src/app/admin/dashboard/page.tsx', adminDashboard);

// 2. Fix Vendor/Weaver Dashboard Layout Sidebar Colors
let dashboardLayout = fs.readFileSync('src/components/DashboardLayout.tsx', 'utf8');
dashboardLayout = dashboardLayout.split('"bg-[#FFF4ED] text-[#E57138]"').join('"bg-[#0070F3] text-white"');
fs.writeFileSync('src/components/DashboardLayout.tsx', dashboardLayout);

// 3. Fix Admin Layout Sidebar Colors
let adminLayout = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');
adminLayout = adminLayout.split("isPathActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'").join("isPathActive ? 'bg-[#0070F3] text-white' : 'hover:bg-gray-50'");
adminLayout = adminLayout.split("isPathActive ? 'text-blue-700' : 'text-gray-700'").join("isPathActive ? 'text-white' : 'text-gray-700'");
adminLayout = adminLayout.split("'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'").join("'bg-[#0070F3] text-white shadow-md border border-[#005BB5]'");
adminLayout = adminLayout.split("'text-blue-700 bg-blue-50/50'").join("'text-white font-bold bg-[#0070F3]'");
fs.writeFileSync('src/app/admin/layout.tsx', adminLayout);

// 4. Fix Dummy KYC Uploader to Real File Input
let vendorDashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
const dummyUploader = `<div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-500 font-medium text-sm">Click to upload or drag and drop your document file here</span>
                  </div>`;
const realUploader = `<input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0070F3] file:text-white hover:file:bg-[#005BB5] border border-gray-200 rounded-xl p-2 cursor-pointer bg-white transition-all shadow-sm" accept=".pdf,.jpg,.jpeg,.png" required />`;
vendorDashboard = vendorDashboard.split(dummyUploader).join(realUploader);
fs.writeFileSync('src/app/dashboard/page.tsx', vendorDashboard);

console.log("All UI issues fixed!");
