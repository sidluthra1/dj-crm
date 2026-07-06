"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import { AuthShell, AuthError } from "@/components/auth-shell";
import { Button, Field, Input } from "@/components/ui/kit";

export default function StaffSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const establishSession = async () => {
      // Supabase sends invites as either:
      //   PKCE flow:     /staff/setup?code=...
      //   Implicit flow: /staff/setup#access_token=...&refresh_token=...
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return setError(`Invite link error: ${error.message}`);
        window.history.replaceState({}, "", "/staff/setup");
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) return setError(`Invite link error: ${error.message}`);
        window.history.replaceState({}, "", "/staff/setup");
      } else {
        return setError("Invalid or expired invite link. Please contact your administrator.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return setError("Invalid or expired invite link. Please contact your administrator.");
      }

      setUserEmail(session.user.email ?? null);
      setSessionReady(true);
    };

    establishSession();
  }, [supabase]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match. Please try again.");

    setIsSubmitting(true);

    // 1. Set the password on the invite session
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(`Failed to set password: ${updateError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 2. Sign out the invite session, then verify the new credentials work
    await supabase.auth.signOut();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail!,
      password,
    });

    if (signInError) {
      setError(`Account setup failed: ${signInError.message}. Please contact your administrator.`);
      setIsSubmitting(false);
      return;
    }

    router.push("/staff/dashboard");
  };

  return (
    <AuthShell
      title="Welcome to the crew"
      subtitle="Set your password to access your gig schedule and pack lists."
    >
      <AuthError message={error} />
      {!error && !sessionReady ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-7 animate-spin text-accent" />
        </div>
      ) : sessionReady ? (
        <form onSubmit={handleSetPassword} className="space-y-5">
          <Field label="Create password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Setting up..." : "Set password & enter portal"}
            {!isSubmitting && <ArrowRight className="size-4" />}
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
}
