"use client";

import Image from "next/image";
import { useState, Suspense, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push(redirectUrl);
      }
    });
    return () => unsubscribe();
  }, [router, redirectUrl]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage("Account created! Please check your email to verify your address.");
        // We will still redirect them, but they'll see the banner in the dashboard.
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bhulia-premium-card p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display bhulia-gold-text">BHULIA</h1>
        <p className="text-gray-300 mt-2">{isRegistering ? "Create your account" : "Sign in to your account"}</p>
      </div>
      
      {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
      {message && <div className="bg-green-900/50 border border-green-500 text-green-200 p-3 rounded mb-4 text-sm">{message}</div>}
      
      <button 
        onClick={handleGoogleSignIn}
        className="w-full bg-white text-black font-semibold py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-6"
      >
        <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" width={20} height={20} />
        Continue with Google
      </button>
      
      <div className="mb-6 flex items-center justify-center">
        <span className="h-px bg-gray-700 flex-1"></span>
        <span className="px-4 text-gray-500 text-sm">OR</span>
        <span className="h-px bg-gray-700 flex-1"></span>
      </div>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input 
            type="email" 
            required
            className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-[#051815] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bhulia-gold-button py-3 rounded">
          {isRegistering ? "Register" : "Sign In"}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-400">
        {isRegistering ? "Already have an account? " : "Don't have an account? "}
        <button onClick={() => setIsRegistering(!isRegistering)} className="text-[#C5A059] hover:underline">
          {isRegistering ? "Sign In" : "Register"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bhulia-bg px-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
