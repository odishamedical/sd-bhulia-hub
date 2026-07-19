"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, EmailAuthProvider, linkWithCredential, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SecurityTab() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const checkProvider = (user: any) => {
      if (user) {
        const providers = user.providerData.map((p: any) => p.providerId);
        setIsGoogleUser(providers.includes("google.com") && !providers.includes("password"));
      }
    };
    checkProvider(auth.currentUser);
    const unsubscribe = onAuthStateChanged(auth, checkProvider);
    return () => unsubscribe();
  }, []);

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (!auth.currentUser || !auth.currentUser.email) return;

    setLoading(true);
    setMessage("");
    try {
      if (isGoogleUser) {
        // Link Google Account with an Email/Password credential
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        await linkWithCredential(auth.currentUser, credential);
        setMessage("Success! You can now log in using your email and this password.");
        setIsGoogleUser(false);
      } else {
        // Just update existing password
        await updatePassword(auth.currentUser, password);
        setMessage("Password updated successfully.");
      }
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to update security settings.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Security & Login</h2>
      <p className="text-sm text-gray-500 font-medium mb-6">Manage your account security and login methods.</p>

      {message && (
        <div className={"p-4 rounded-xl text-sm font-bold "}>
          {message}
        </div>
      )}

      {isGoogleUser ? (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-blue-900 flex items-center gap-2"><span>🛡️</span> Google Connected Account</h3>
          <p className="text-sm text-blue-700 mt-1">You currently log in using Google. Set a password below to enable Email/Password login as a backup.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-300 shadow-sm font-medium focus:ring-4 focus:ring-[#0070F3]/15 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><span>🔑</span> Email & Password Account</h3>
          <p className="text-sm text-gray-600 mt-1">Change your password below to keep your account secure.</p>
        </div>
      )}

      <form onSubmit={handleUpdateSecurity} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium shadow-sm focus:ring-4 focus:ring-[#0070F3]/15 focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" placeholder="••••••••" />
        </div>
        <button disabled={loading} type="submit" className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50">
          {loading ? "Saving..." : isGoogleUser ? "Add Password Login" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
