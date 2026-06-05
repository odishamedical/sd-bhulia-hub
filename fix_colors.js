const fs = require('fs');
let cartDrawer = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
cartDrawer = cartDrawer.replace(/from-\[#E57138\] to-\[#D56128\]/g, 'bg-[#0070F3] hover:bg-[#005BB5]');
cartDrawer = cartDrawer.replace(/bg-gradient-to-r /g, '');
fs.writeFileSync('src/components/CartDrawer.tsx', cartDrawer);

let checkoutPage = fs.readFileSync('src/app/checkout/page.tsx', 'utf8');
checkoutPage = checkoutPage.replace(/from-\[#996515\] to-\[#C5A059\]/g, 'bg-[#0070F3] hover:bg-[#005BB5]');
checkoutPage = checkoutPage.replace(/from-\[#E57138\] to-\[#D56128\]/g, 'bg-[#0070F3] hover:bg-[#005BB5]');
checkoutPage = checkoutPage.replace(/bg-gradient-to-r /g, '');
fs.writeFileSync('src/app/checkout/page.tsx', checkoutPage);

console.log("Colors updated in CartDrawer and checkout");
