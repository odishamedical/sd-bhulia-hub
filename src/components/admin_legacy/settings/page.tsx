"use client";

import React, { useState, useEffect } from "react";
import { useGlobalSettings, updateGlobalSettings } from "@/lib/db-hooks";

export default function GlobalSettingsPage() {
  const { settings, loading } = useGlobalSettings();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [allowNewsletterSignup, setAllowNewsletterSignup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (settings && !loading) {
      setMaintenanceMode(settings.maintenanceMode || false);
      setMaintenanceMessage(settings.maintenanceMessage || "");
      setAllowNewsletterSignup(settings.allowNewsletterSignup || false);
    }
  }, [settings, loading]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateGlobalSettings({
      maintenanceMode,
      maintenanceMessage,
      allowNewsletterSignup
    });
    setIsSaving(false);
    
    if (res.success) {
      setToast("Settings saved successfully!");
      setTimeout(() => setToast(""), 3000);
    } else {
      setToast("Error saving settings.");
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-blue-500 animate-pulse font-bold tracking-widest uppercase">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
          <p className="text-sm text-gray-500">Manage platform-wide configurations</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {toast && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{toast}</span>
        </div>
      )}

      {/* Maintenance Mode Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Maintenance Mode</h2>
            <p className="text-sm text-gray-500 max-w-lg mt-1">
              Enable this to take the public website offline. Only users accessing the /admin panel will be able to bypass this screen.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} className="sr-only peer" />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        {maintenanceMode && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Custom Maintenance Message</label>
              <textarea 
                value={maintenanceMessage} 
                onChange={e => setMaintenanceMessage(e.target.value)} 
                rows={3} 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-blue-500" 
                placeholder="e.g. We are currently upgrading the platform. We will be back shortly!"
              ></textarea>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input 
                type="checkbox" 
                checked={allowNewsletterSignup} 
                onChange={e => setAllowNewsletterSignup(e.target.checked)} 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded" 
              />
              <div>
                <label className="text-sm font-bold text-gray-900">Show Email & WhatsApp Subscriber Form</label>
                <p className="text-xs text-gray-500">Allows visitors to leave their contact info to be notified when the site is back online.</p>
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
