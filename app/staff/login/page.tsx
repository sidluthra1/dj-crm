"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AuthShell, AuthError, AuthSuccess } from "@/components/auth-shell";
import { Button, Field, Input } from "@/components/ui/kit";

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(() =>
    searchParams.get("setup") === "complete"
      ? "Account set up! Log in with your new password below."
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      router.push("/staff/dashboard");
      router.refresh();
    }
  };

  return (
    <AuthShell
      title="Crew login"
      subtitle="Access your upcoming gigs and pack lists."
      footer={
        <>
          Need an account? <span className="text-ink-tertiary">Wait for your admin invite email.</span>
        </>
      }
    >
      <AuthSuccess message={successMessage} />
      <AuthError message={error} />

      <form onSubmit={handleLogin} className="space-y-5">
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in to portal"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense>
      <StaffLoginForm />
    </Suspense>
  );
}
