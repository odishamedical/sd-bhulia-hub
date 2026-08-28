import re
import os

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_pattern = r'^\s*\{activeTab === "products" && \(\n\s*<div className="bg-white p-8 rounded-3xl'
end_pattern = r'</form>\n\s*</div>\n\s*\)\}\n\s*</div>\n\s*\)\}'

matches = list(re.finditer(start_pattern, content, re.MULTILINE))
if not matches:
    print('Start pattern not found!')
else:
    start_idx = matches[0].start()
    
    end_matches = list(re.finditer(end_pattern, content[start_idx:], re.MULTILINE))
    if not end_matches:
        print('End pattern not found!')
    else:
        end_idx = start_idx + end_matches[0].end()
        
        # Replacement code
        replacement = """      {activeTab === "products" && (
        <ProductManager 
          subscriptionTier={subscriptionTier}
          setIsUpgraderOpen={setIsUpgraderOpen}
          sellerProductsRaw={sellerProductsRaw}
          sellerRole={actualRole}
          isAutoApprovedUser={subscriptionTier !== "free"}
          storeName={userData?.personalName || ""}
        />
      )}"""
        
        new_content = content[:start_idx] + replacement + content[end_idx:]
        
        # Add import
        import_stmt = 'import ProductManager from "@/components/dashboard/ProductManager";\n'
        if import_stmt not in new_content:
            import_idx = new_content.find('import OrderManager')
            if import_idx != -1:
                new_content = new_content[:import_idx] + import_stmt + new_content[import_idx:]
        
        with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Successfully replaced products tab and added import.')
