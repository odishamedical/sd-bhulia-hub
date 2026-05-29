"use client";

import React, { useState } from "react";

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // MVP Empty State
  const users: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#C5A059]">System Users</h1>
          <p className="text-gray-300 text-xs mt-1">Manage platform administrators and authenticated users.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg"
        >
          + Invite User
        </button>
      </div>

      <div className="bg-[#0B2B26]/80 border border-[#C5A059]/30 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="text-xs uppercase bg-[#0A3A35] text-[#C5A059] font-bold tracking-widest border-b border-[#C5A059]/30">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Default Super Admin View */}
              <tr className="border-b border-[#C5A059]/10 hover:bg-[#0A3A35]/50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <div className="text-white font-serif">Master Admin</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-mono">odishamedical@gmail.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#0A3A35] border border-[#C5A059]/40 text-[#C5A059] px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold">
                    Super Admin
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono">Just now</td>
                <td className="px-6 py-4 text-right text-gray-500 text-xs italic">
                  Protected
                </td>
              </tr>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-mono text-xs">
                    No other users registered in the system.
                  </td>
                </tr>
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B2B26] border border-[#C5A059]/50 rounded-3xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(197,160,89,0.2)] text-center space-y-4">
            <span className="text-4xl block mb-2">🚧</span>
            <h2 className="text-xl font-serif font-bold text-[#C5A059]">Module Under Construction</h2>
            <p className="text-sm text-gray-300">
              User invitation and RBAC (Role-Based Access Control) via Firebase Auth will be rolled out in the next phase.
            </p>
            <div className="pt-4">
              <button onClick={() => setIsModalOpen(false)} className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 transition-all font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
