const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/admin/developer/page.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/useState<ApiKey \| Webhook\[\]>/g, 'useState<any[]>');

fs.writeFileSync(file, content);
