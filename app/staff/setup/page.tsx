"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Music, Lock, Loader2, ArrowRight } from "lucide-react";

export default function StaffSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const establishSession = async () => {
      // Read invite tokens from the URL before touching any existing session.
      // Supabase sends invites as either:
      //   PKCE flow:     /staff/setup?code=...
      //   Implicit flow: /staff/setup#access_token=...&refresh_token=...
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        // PKCE: exchangeCodeForSession replaces whatever session is currently active
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(`Invite link error: ${error.message}`);
          return;
        }
        window.history.replaceState({}, "", "/staff/setup");
      } else if (accessToken && refreshToken) {
        // Implicit: setSession replaces the current session with the staff member's tokens
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          setError(`Invite link error: ${error.message}`);
          return;
        }
        window.history.replaceState({}, "", "/staff/setup");
      } else {
        // No invite tokens in URL at all — link is invalid or already used
        setError("Invalid or expired invite link. Please contact your administrator.");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired invite link. Please contact your administrator.");
        return;
      }

      setUserEmail(session.user.email ?? null);
      setSessionReady(true);
    };

    establishSession();
  }, [supabase]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setIsSubmitting(true);

    // 1. Set the password on the current (invite) session
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(`Failed to set password: ${updateError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 2. Sign out the invite session
    await supabase.auth.signOut();

    // 3. Immediately sign in with the new credentials to verify the password was saved
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail!,
      password,
    });

    if (signInError) {
      // Password wasn't persisted by Supabase — surface the real error
      setError(`Account setup failed: ${signInError.message}. Please contact your administrator.`);
      setIsSubmitting(false);
      return;
    }

    // 4. Password verified and session established — go straight to the portal
    router.push("/staff/dashboard");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Music className="text-purple-400 size-8" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome to the Crew</h1>
          <p className="text-gray-400">Set your password to access your gig schedule and pack lists.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 font-bold text-sm">{error}</p>
            </div>
          ) : !sessionReady ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-purple-400" size={32} />
            </div>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Lock size={14} /> Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Lock size={14} /> Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Set Password & Enter Portal <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
