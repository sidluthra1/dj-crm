"use client"; // Must be the first line to enable browser-side logic 🚀

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Importing the connection we built
import { Music, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // 1. Set up state to track user input and loading/error status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirects to our secure callback tunnel after Google approves
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // 2. Attempt to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else if (data.user) {
      // 3. Smart Routing: Check their tier before sending them anywhere!
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', data.user.id)
        .single();

      if (!profile || profile.subscription_tier === 'none') {
        router.push("/pricing");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center px-6">
      
      <Link href="/" className="mb-8 flex items-center gap-3">
        <span className="text-4xl font-light tracking-[0.2em] uppercase text-white">NEXORA</span>
      </Link>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your account to continue</p>
        </div>

        {/* Google Sign-In Button */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-full mb-6 hover:bg-gray-200 transition-all transform hover:scale-[1.02]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="size-5" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">or email</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        {/* Error Message Display */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="size-5 shrink-0 text-red-400" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dj@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm"
              required
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="size-4 rounded border-white/20 bg-white/5 checked:bg-purple-600 transition-all cursor-pointer accent-purple-500" 
              />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <Link href="/forgot-password">
              <button type="button" className="text-sm text-purple-400 hover:text-purple-300 font-bold transition-colors">
                Forgot password?
              </button>
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-black uppercase tracking-widest py-5 rounded-full transition-all transform shadow-xl mt-2 ${
              isLoading ? "bg-purple-600/50 cursor-not-allowed text-white/50" : "bg-purple-600 hover:bg-purple-700 text-white hover:scale-[1.02]"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}