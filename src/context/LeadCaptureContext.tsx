"use client";

import React, { createContext, useContext, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import { useRouter } from "next/navigation";

interface LeadCaptureContextType {
  requireLeadCapture: (callback: () => void, intent?: "cart" | "wishlist") => void;
}

const LeadCaptureContext = createContext<LeadCaptureContextType>({
  requireLeadCapture: () => {},
});

export const useLeadCapture = () => useContext(LeadCaptureContext);

export const LeadCaptureProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [intent, setIntent] = useState<"cart" | "wishlist">("cart");

  const requireLeadCapture = (callback: () => void, actionIntent: "cart" | "wishlist" = "cart") => {
    // 1. If not logged in at all, redirect to login
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // 2. If logged in but missing whatsapp, show modal
    if (!userData?.whatsapp) {
      setIntent(actionIntent);
      setPendingCallback(() => callback);
      setIsOpen(true);
      return;
    }

    // 3. If they have a whatsapp number, execute immediately
    callback();
  };

  const handleSuccess = () => {
    setIsOpen(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  return (
    <LeadCaptureContext.Provider value={{ requireLeadCapture }}>
      {children}
      <LeadCaptureModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={handleSuccess}
        title="Verify Your Number"
        description={`Please enter your WhatsApp number to save items to your ${intent === "cart" ? "cart" : "wishlist"} and receive updates.`}
      />
    </LeadCaptureContext.Provider>
  );
};
