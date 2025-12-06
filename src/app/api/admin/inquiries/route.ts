import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, getUser, isAdmin } from '@/lib/supabase/server'

/**
 * GET /api/admin/inquiries
 * 문의 목록 조회 (관리자용)
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const isAdminUser = await isAdmin(user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    const { tenant, raw: supabase } = await getServerSupabase()

    // 카운트 쿼리
    let countQuery = supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)

    // 데이터 쿼리
    let dataQuery = supabase
      .from('inquiries')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 상태 필터
    if (status) {
      countQuery = countQuery.eq('status', status)
      dataQuery = dataQuery.eq('status', status)
    }

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ])

    if (error) {
      console.error('문의 조회 실패:', error)
      return NextResponse.json(
        { error: '문의 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      inquiries: data || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('문의 목록 조회 중 오류:', error)
    return NextResponse.json(
      { error: '문의 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
