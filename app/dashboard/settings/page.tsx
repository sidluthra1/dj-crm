"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, Shield, Lock, LogOut, Save } from "lucide-react";
import { Button, Card, Field, Input, Badge } from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  premium: "Premium Tools",
  crm: "CRM",
  company: "Company",
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [tier, setTier] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, subscription_tier")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setTier(profile.subscription_tier ?? "none");
      }
      setIsLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    // Keep auth metadata in sync too
    await supabase.auth.updateUser({ data: { full_name: fullName } });

    setIsSavingProfile(false);
    if (error) toast(error.message, "error");
    else toast("Profile updated.", "success");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast("Password must be at least 6 characters.", "error");
    if (newPassword !== confirmPassword) return toast("Passwords do not match.", "error");

    setIsSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSavingPassword(false);

    if (error) {
      toast(error.message, "error");
    } else {
      setNewPassword("");
      setConfirmPassword("");
      toast("Password updated.", "success");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="skeleton h-52 rounded-[1.25rem]" />
        <div className="skeleton h-40 rounded-[1.25rem]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <Enter>
        <div className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Manage your profile, plan, and account security.
          </p>
        </div>
      </Enter>

      {/* Profile */}
      <Enter delay={0.05}>
        <Card className="p-7">
          <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <User className="size-4 text-accent" /> Profile
          </h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={email} disabled className="opacity-60" />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={isSavingProfile}>
                {!isSavingProfile && <Save size={15} />}
                {isSavingProfile ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </Card>
      </Enter>

      {/* Plan */}
      <Enter delay={0.1}>
        <Card className="p-7">
          <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <Shield className="size-4 text-[#5b45b0]" /> Plan
          </h2>
          <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#fafafa] p-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <p className="text-lg font-semibold tracking-tight">
                  {TIER_LABELS[tier] || "No plan selected"}
                </p>
                <Badge tone={tier === "crm" ? "blue" : "neutral"}>Current</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-secondary">
                Plan changes are handled securely on our servers.
              </p>
            </div>
            <Button variant="secondary" onClick={() => router.push("/pricing")}>
              Manage plan
            </Button>
          </div>
        </Card>
      </Enter>

      {/* Password */}
      <Enter delay={0.15}>
        <Card className="p-7">
          <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <Lock className="size-4 text-[#b25000]" /> Change password
          </h2>
          <form onSubmit={savePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="New password">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </Field>
              <Field label="Confirm new password">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" loading={isSavingPassword}>
                {isSavingPassword ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </Card>
      </Enter>

      {/* Sign out */}
      <Enter delay={0.2}>
        <Card className="flex items-center justify-between p-7">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">Sign out</h2>
            <p className="mt-0.5 text-sm text-ink-secondary">Sign out of NEXORA on this device.</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut size={15} /> Sign out
          </Button>
        </Card>
      </Enter>
    </div>
  );
}
