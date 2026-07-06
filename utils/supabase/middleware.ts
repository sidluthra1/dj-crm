import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // If Supabase's redirect allowlist rejects our redirectTo, it falls back to
  // the Site URL and the OAuth ?code= lands on "/". Forward it to the callback
  // so the code is exchanged server-side and the user is routed by tier
  // instead of being stranded on the landing page.
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isOwnerDashboard = path.startsWith("/dashboard");
  const isStaffDashboard = path.startsWith("/staff/dashboard");
  const isAuthRoute = path === "/login" || path === "/signup";

  const redirect = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    return NextResponse.redirect(url);
  };

  // Not logged in: protected areas bounce to the right login page.
  if (!user) {
    if (isOwnerDashboard) return redirect("/login");
    if (isStaffDashboard) return redirect("/staff/login");
    return supabaseResponse;
  }

  // Logged in: only query the profile when a decision depends on it.
  if (isOwnerDashboard || isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const tier = profile?.subscription_tier;

    if (isOwnerDashboard && tier !== "crm") {
      return redirect("/pricing");
    }

    if (isAuthRoute) {
      return redirect(tier === "crm" ? "/dashboard" : "/pricing");
    }
  }

  return supabaseResponse;
}
