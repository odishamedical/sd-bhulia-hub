"use client";

import React from "react";
import HelpGuideTab from "@/components/HelpGuideTab";

export default function AdminGuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ecosystem Guidelines</h1>
        <p className="text-gray-600">
          This is the exact guide shown to users in their Dashboards. 
          As an Admin, use this to familiarize yourself with the 8 Master Categories 
          so you can easily assist users when they open support tickets.
        </p>
      </div>

      <HelpGuideTab userRole="Seller & Ecosystem" />
    </div>
  );
}
