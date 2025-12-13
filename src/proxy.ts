import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 비밀번호 보호에서 제외할 경로
const PUBLIC_PATHS = [
  '/auth',           // 비밀번호 입력 페이지
  '/api/auth',       // 인증 API
  '/api/health',     // 헬스체크
  '/admin/login',    // 어드민 로그인
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ===================================
  // 1. 사이트 비밀번호 보호 체크
  // ===================================
  const sitePassword = process.env.SITE_PASSWORD

  // 비밀번호가 설정되어 있고, 공개 경로가 아닌 경우
  if (sitePassword && !PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    const authCookie = request.cookies.get('site_auth')

    if (authCookie?.value !== sitePassword) {
      // 인증 안 됨 → 비밀번호 페이지로 리다이렉트
      const authUrl = new URL('/auth', request.url)
      authUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(authUrl)
    }
  }

  // ===================================
  // 2. Admin 인증 체크
  // ===================================
  // /admin/login은 인증 체크 제외
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // /admin/* 경로는 인증 필요
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Admin 권한 체크
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email)
      .single()

    if (!adminData) {
      return NextResponse.redirect(
        new URL('/admin/login?error=unauthorized', request.url)
      )
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg).*)',
  ],
}
