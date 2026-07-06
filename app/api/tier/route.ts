import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const VALID_TIERS = ["free", "premium", "crm"] as const;
type Tier = (typeof VALID_TIERS)[number];
const PAID_TIERS: Tier[] = ["premium", "crm"];

/**
 * POST /api/tier  { tier: "free" | "premium" | "crm" }
 *
 * The ONLY place subscription_tier may change. A DB trigger rejects any
 * client-side update, so this route uses the service role after verifying
 * the caller.
 *
 * Paid tiers are gated behind payments. Until Stripe is integrated, set
 * ALLOW_DEV_TIER_OVERRIDE=true in .env.local to self-assign paid tiers
 * while developing. When Stripe lands, this route becomes the webhook's
 * companion and the override flag is removed.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let tier: string;
  try {
    ({ tier } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!VALID_TIERS.includes(tier as Tier)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  const devOverride = process.env.ALLOW_DEV_TIER_OVERRIDE === "true";
  if (PAID_TIERS.includes(tier as Tier) && !devOverride) {
    return NextResponse.json(
      {
        error:
          "Payments aren't live yet — paid plans can't be self-assigned. (Developers: set ALLOW_DEV_TIER_OVERRIDE=true to test.)",
      },
      { status: 402 }
    );
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ subscription_tier: tier })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, tier });
}
