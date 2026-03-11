"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we simulate a successful signup and redirect to pricing
    router.push("/pricing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center px-6 py-12">
      
      {/* 1. NEXORA Logo */}
      <Link href="/" className="mb-8">
        <span className="text-4xl font-light tracking-[0.2em] uppercase text-white">NEXORA</span>
      </Link>

      {/* 2. Create Account Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Get started with Nexora for your business</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              placeholder="dj@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm"
              required
            />
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest py-5 rounded-full transition-all transform hover:scale-[1.02] shadow-xl mt-4">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}