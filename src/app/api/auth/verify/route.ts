import { NextRequest, NextResponse } from 'next/server'

// 쿠키 유효 기간 (30일)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const sitePassword = process.env.SITE_PASSWORD

    // 환경변수가 없으면 항상 통과
    if (!sitePassword) {
      return NextResponse.json({ success: true })
    }

    // 비밀번호 검증
    if (password !== sitePassword) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 성공 - 쿠키 설정
    const response = NextResponse.json({ success: true })
    response.cookies.set('site_auth', sitePassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
