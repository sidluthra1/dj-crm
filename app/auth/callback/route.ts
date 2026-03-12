// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // 1. Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError && session) {
      // 2. Fetch the user's tier from the profiles table we just created
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single()

      // 3. Logic Fork: If they haven't picked a tier, send to pricing
      if (!profile || profile.subscription_tier === 'none') {
        return NextResponse.redirect(`${origin}/pricing`)
      }

      // 4. Otherwise, send them straight to the dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Fallback redirect if something goes wrong
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}