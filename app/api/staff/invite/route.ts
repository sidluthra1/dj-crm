import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. AUTHENTICATE the caller — this route uses the service key, so it must
    //    never be callable anonymously.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // 2. AUTHORIZE — only CRM-tier owners can invite staff.
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_tier !== "crm") {
      return NextResponse.json(
        { error: "Your plan does not include staff management." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { full_name, stage_name, email, phone, address, birthday, role, contract_url } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { error: "Full name and email are required to invite staff." },
        { status: 400 }
      );
    }

    // 3. Service-role client for the admin invite (server-only).
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin || "http://localhost:3000";

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name, role },
        redirectTo: `${siteUrl}/staff/setup`,
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 4. Insert the staff row, owned by the inviting user.
    const { error: dbError } = await supabaseAdmin.from("staff").insert([
      {
        owner_id: user.id,
        user_id: authData.user.id,
        full_name,
        stage_name: stage_name || null,
        email,
        phone: phone || null,
        address: address || null,
        birthday: birthday || null,
        role: role || "DJ",
        contract_url: contract_url || null,
        status: "Active",
      },
    ]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: "Failed to invite staff member." }, { status: 500 });
  }
}
