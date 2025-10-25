import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서는 cookies를 설정할 수 없음
          }
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function isAdmin(email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('email, role')
    .eq('email', email)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

export async function requireAdmin() {
  const user = await getUser()

  if (!user) {
    return { authorized: false, user: null, role: null }
  }

  const supabase = await createClient()
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('email, role')
    .eq('email', user.email)
    .single()

  if (!adminData) {
    return { authorized: false, user, role: null }
  }

  return { authorized: true, user, role: adminData.role }
}
