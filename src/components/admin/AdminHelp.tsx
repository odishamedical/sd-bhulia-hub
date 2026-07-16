import React from 'react';

export default function AdminHelp() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">System Guide & Documentation</h1>
        <p className="text-gray-500 text-sm">Comprehensive manual for the Bhulia Enterprise Engine Admin Hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="text-lg font-bold text-gray-900">1. Overview & Insights</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">The command center of your entire platform. This page aggregates data from all modules to give you a bird's-eye view.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>Global Dashboard:</strong> Shows top-level metrics like Total Catalog Value and Verified counts. Approves pending accounts directly from the queue.</li>
          </ul>
        </div>

        {/* Module 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👥</span>
            <h2 className="text-lg font-bold text-gray-900">2. User Identity & CRM</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Manage all human interaction on the platform. Review identities, manage profiles, and track lifetime value.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>User Directory:</strong> Search and filter through Customers, Stores, Resellers, and Weavers. Edit their profiles or ban them.</li>
            <li><strong>Verification Queue:</strong> Dedicated queue for approving submitted KYC documents (Aadhaar, GSTIN).</li>
            <li><strong>Ecosystem Guidelines:</strong> Rules of engagement for the community.</li>
          </ul>
        </div>

        {/* Module 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛍️</span>
            <h2 className="text-lg font-bold text-gray-900">3. Catalog & Commerce</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Manage everything that can be bought or sold on the platform.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>Product Catalog:</strong> Review and approve products submitted by weavers and sellers.</li>
            <li><strong>Live Inventory DB:</strong> Track stock levels across all distributed warehouses and stores.</li>
            <li><strong>Bhulia.com Audit:</strong> Quality assurance checks for product listings.</li>
          </ul>
        </div>

        {/* Module 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📦</span>
            <h2 className="text-lg font-bold text-gray-900">4. Orders & Fulfillment</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Track the physical movement of goods from sellers to buyers.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>All Orders:</strong> Master ledger of all transactions. Track payment status and fulfillment progress.</li>
            <li><strong>Active Dispatch:</strong> Orders currently being shipped by logistics partners.</li>
            <li><strong>Returns & B2B:</strong> Manage reverse logistics and bulk B2B wholesale orders.</li>
          </ul>
        </div>

        {/* Module 5 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💰</span>
            <h2 className="text-lg font-bold text-gray-900">5. Finance & Revenue</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">The financial heartbeat of the platform. Track money flowing in and out.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>Seller Payouts:</strong> Release funds to weavers after successful deliveries.</li>
            <li><strong>Reseller Commissions:</strong> Calculate and distribute earnings to network marketers.</li>
            <li><strong>SaaS Subscriptions:</strong> Manage premium plans for stores and sellers.</li>
            <li><strong>Tax & Compliance:</strong> GST reports and tax deduction at source (TDS) filings.</li>
          </ul>
        </div>

        {/* Module 6 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📢</span>
            <h2 className="text-lg font-bold text-gray-900">6. Growth & Engagement</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Tools to drive traffic and increase sales conversions.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>Global Ads:</strong> Upload hero banners, configure popup ads, and schedule promotional campaigns across the storefront.</li>
            <li><strong>Coupons & Offers:</strong> Create discount codes and festive season sales.</li>
            <li><strong>Google Importer:</strong> Pull in data from external sources to enrich the directory.</li>
          </ul>
        </div>

        {/* Module 7 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-lg font-bold text-gray-900">7. Support & Disputes</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Resolve conflicts and maintain trust in the ecosystem.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>Customer Tickets:</strong> Respond to help requests from buyers.</li>
            <li><strong>Disputes:</strong> Mediate disagreements between buyers and sellers regarding quality or returns.</li>
            <li><strong>Fraud Analysis:</strong> AI-flagged suspicious accounts or high-risk orders.</li>
          </ul>
        </div>

        {/* Module 8 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-lg font-bold text-gray-900">8. Platform Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Core technical configurations and security audits.</p>
          <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
            <li><strong>Visual Page Builder:</strong> Edit the UI of static landing pages using the drag-and-drop CMS.</li>
            <li><strong>Global Audit Log:</strong> A tamper-proof history of every action taken by every Admin.</li>
            <li><strong>Staff Delegation:</strong> Add new admins and restrict their permissions to specific modules.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
