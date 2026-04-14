import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const body = await request.json();
    const { 
      full_name, stage_name, email, phone, 
      address, birthday, role, contract_url 
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required to invite staff." }, { status: 400 });
    }

    // Determine the base URL (localhost for dev, or your production domain)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Generate user and send invite email WITH the custom redirect link
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
      redirectTo: `${siteUrl}/staff/setup`
    });

    if (authError) throw authError;

    // 2. Insert their profile into your public 'staff' table
    const { error: dbError } = await supabaseAdmin.from('staff').insert([{
      user_id: authData.user.id,
      full_name,
      stage_name: stage_name || null,
      email,
      phone: phone || null,
      address: address || null,
      birthday: birthday || null,
      role,
      contract_url: contract_url || null,
      status: 'Active'
    }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, user: authData.user });

  } catch (error: any) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}