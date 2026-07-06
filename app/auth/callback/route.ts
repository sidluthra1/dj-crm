// app/auth/callback/route.ts
// Exchanges OAuth / magic-link codes for a session, then routes by tier.
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError && session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", session.user.id)
        .single();

      // No tier picked yet → pricing; CRM users → dashboard.
      if (!profile || profile.subscription_tier === "none") {
        return NextResponse.redirect(`${origin}/pricing`);
      }
      return NextResponse.redirect(
        `${origin}${profile.subscription_tier === "crm" ? "/dashboard" : "/pricing"}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
