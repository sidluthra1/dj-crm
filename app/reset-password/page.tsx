"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AuthShell, AuthError } from "@/components/auth-shell";
import { Button, Field, Input } from "@/components/ui/kit";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Supabase recovery links can arrive as ?code=... (PKCE) or #access_token=... (implicit).
  useEffect(() => {
    const establish = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return setErrorMsg(`Reset link error: ${error.message}`);
        window.history.replaceState({}, "", "/reset-password");
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) return setErrorMsg(`Reset link error: ${error.message}`);
        window.history.replaceState({}, "", "/reset-password");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("Invalid or expired reset link. Request a new one from the sign-in page.");
        return;
      }
      setReady(true);
    };
    establish();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) return setErrorMsg("Password must be at least 6 characters.");
    if (password !== confirm) return setErrorMsg("Passwords do not match.");

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account.">
      <AuthError message={errorMsg} />
      {ready && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="New password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            {isLoading ? "Saving..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
