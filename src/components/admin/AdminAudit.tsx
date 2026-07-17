"use client";

import React, { useState, useEffect } from "react";

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");

  useEffect(() => {
    // Mocking an immutable audit log
    setTimeout(() => {
      setLogs([
        {
          id: "LOG-1004",
          adminId: "ADM-001",
          adminName: "Super Admin",
          action: "DELETE",
          resource: "Coupon",
          details: "Deleted coupon DIWALI20",
          ipAddress: "192.168.1.45",
          timestamp: new Date().toISOString()
        },
        {
          id: "LOG-1003",
          adminId: "ADM-002",
          adminName: "Support Staff (Rahul)",
          action: "UPDATE",
          resource: "Order",
          details: "Changed status of ORD-8821 from processing to shipped",
          ipAddress: "10.0.0.12",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "LOG-1002",
          adminId: "ADM-001",
          adminName: "Super Admin",
          action: "UPDATE",
          resource: "System",
          details: "Updated HeroSlider configuration in Visual Page Builder",
          ipAddress: "192.168.1.45",
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: "LOG-1001",
          adminId: "ADM-003",
          adminName: "Finance (Priya)",
          action: "PAYOUT",
          resource: "Ledger",
          details: "Settled ₹15,000 to weaver ID WVR-991",
          ipAddress: "10.0.0.44",
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const filteredLogs = logs.filter(log => filterAction === "all" || log.action === filterAction);

  const getActionColor = (action: string) => {
    switch (action) {
      case "DELETE": return "text-red-600 bg-red-50 border-red-200";
      case "UPDATE": return "text-blue-600 bg-blue-50 border-blue-200";
      case "PAYOUT": return "text-green-600 bg-green-50 border-green-200";
      case "CREATE": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Global Audit Logs</h2>
          <p className="text-gray-500 text-sm">Immutable ledger of all administrative actions for security and accountability.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">Filter:</span>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletions</option>
            <option value="PAYOUT">Payouts</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <span className="font-bold">Security Note:</span> Audit logs are immutable and cannot be deleted or modified by any administrator, ensuring complete transparency for staff delegation.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Admin Identity</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors font-mono text-xs">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{log.adminName}</div>
                        <div className="text-gray-500 mt-1">IP: {log.ipAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-gray-800 break-words max-w-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
