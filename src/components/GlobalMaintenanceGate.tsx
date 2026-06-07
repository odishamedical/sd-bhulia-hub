"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useGlobalSettings } from "@/lib/db-hooks";
import MaintenanceScreen from "./MaintenanceScreen";

export default function GlobalMaintenanceGate({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useGlobalSettings();
  const pathname = usePathname();

  // If loading, just show children to prevent flicker, or show a tiny spinner
  if (loading) return <>{children}</>;

  // If maintenance mode is OFF, show children
  if (!settings?.maintenanceMode) return <>{children}</>;

  // If maintenance mode is ON, but user is on /admin, show children
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  // Otherwise, block access and show maintenance screen
  return (
    <>
      <MaintenanceScreen 
        message={settings.maintenanceMessage} 
        allowNewsletter={settings.allowNewsletterSignup} 
      />
      {/* We hide the children completely to prevent any interactions */}
      <div className="hidden">{children}</div>
    </>
  );
}
