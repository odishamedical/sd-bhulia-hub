"use client";

import React, { useState } from "react";

// Placeholder data for Audit Logs
const MOCK_AUDIT_LOGS = [
  {
    id: "log_1",
    timestamp: "2026-06-09T09:14:00Z",
    actorName: "Rahul Weaver (Staff)",
    actorRole: "weaver_staff",
    action: "UPLOADED_PRODUCT",
    target: "Product #PRD-8829",
    ipAddress: "192.168.1.104",
    status: "success",
  },
  {
    id: "log_2",
    timestamp: "2026-06-09T08:45:00Z",
    actorName: "Super Admin",
    actorRole: "super_admin",
    action: "VERIFIED_KYC",
    target: "Store UID: vn_882910",
    ipAddress: "System",
    status: "success",
  },
  {
    id: "log_3",
    timestamp: "2026-06-08T18:30:00Z",
    actorName: "System Automation",
    actorRole: "system",
    action: "ESCROW_PAYOUT",
    target: "Weaver Payout Batch #992",
    ipAddress: "Server",
    status: "success",
  },
  {
    id: "log_4",
    timestamp: "2026-06-08T14:12:00Z",
    actorName: "Unknown IP",
    actorRole: "anonymous",
    action: "FAILED_LOGIN",
    target: "Admin Portal",
    ipAddress: "45.22.19.8",
    status: "warning",
  },
  {
    id: "log_5",
    timestamp: "2026-06-08T10:05:00Z",
    actorName: "Priya (Reseller)",
    actorRole: "reseller",
    action: "GENERATED_LINK",
    target: "Storefront Proxy Link",
    ipAddress: "103.44.12.9",
    status: "success",
  }
];

export default function AuditLogPage() {
  const [filter, setFilter] = useState("all");

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    if (filter === "all") return true;
    if (filter === "security") return log.status === "warning";
    if (filter === "staff") return log.actorRole.includes("staff");
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Global Audit Log</h1>
          <p className="text-gray-500 mt-2 font-medium">Zero-Error Protocol tracking. Monitor every action across the Bhulia Hub ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm outline-none focus:border-[#0070F3]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="security">Security Alerts</option>
            <option value="staff">Staff Activity</option>
          </select>
          <button className="bg-[#1f2937] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-black transition-colors">
            Export CSV
          </button>
        </div>
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest w-48">Timestamp</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Actor & Role</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Target Object</th>
                <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">IP / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5">
                    <p className="text-sm font-bold text-gray-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                        log.actorRole === "super_admin" ? "bg-purple-100 text-purple-700" :
                        log.actorRole.includes("staff") ? "bg-orange-100 text-orange-700" :
                        log.actorRole === "system" ? "bg-gray-800 text-white" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {log.actorName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{log.actorName}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">{log.actorRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-medium text-gray-700">{log.target}</p>
                  </td>
                  <td className="p-5 text-right">
                    <p className="text-xs font-mono text-gray-500 mb-1">{log.ipAddress}</p>
                    {log.status === "warning" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        ALERT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 font-medium">
                    No audit logs match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
