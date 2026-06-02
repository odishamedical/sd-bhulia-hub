"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const { doc, getDoc, setDoc } = await import("firebase/firestore");
          const { db } = await import("../lib/firebase");
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (currentUser.email === "odishamedical@gmail.com" || currentUser.email === "npfcodisha@gmail.com") {
            // Master Admin Override
            localStorage.setItem("sd_current_user_role", "super_admin");
            
            // Auto-register super admin if they don't exist
            if (!userDocSnap.exists()) {
              await setDoc(userDocRef, {
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email.split("@")[0],
                role: "super_admin",
                createdAt: new Date().toISOString()
              });
            }
          } else if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.role) {
              localStorage.setItem("sd_current_user_role", data.role);
            } else {
              localStorage.setItem("sd_current_user_role", "user");
            }
          } else {
            // Auto-register new general user
            await setDoc(userDocRef, {
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "Unknown User",
              role: "user",
              createdAt: new Date().toISOString()
            });
            localStorage.setItem("sd_current_user_role", "user");
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          if (!localStorage.getItem("sd_current_user_role")) {
            localStorage.setItem("sd_current_user_role", "user");
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("sd_current_user_role");
      localStorage.removeItem("sd_current_user_email");
      localStorage.removeItem("sd_current_user_name");
      localStorage.removeItem("sd_current_user_uid");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
