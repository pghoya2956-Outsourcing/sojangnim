import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase, getUser, isAdmin } from '@/lib/supabase/server'
import type { UpdateInquiryRequest } from '@/types/inquiry'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/inquiries/[id]
 * 문의 상태 업데이트 (관리자용)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // 인증 확인
    const user = await getUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const isAdminUser = await isAdmin(user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body: UpdateInquiryRequest = await request.json()
    const { tenant, raw: supabase } = await getServerSupabase()

    // 업데이트할 데이터 구성
    const updateData: Record<string, unknown> = {}

    if (body.status) {
      const validStatuses = ['pending', 'contacted', 'completed', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: '유효하지 않은 상태입니다.' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.admin_note !== undefined) {
      updateData.admin_note = body.admin_note
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '업데이트할 내용이 없습니다.' },
        { status: 400 }
      )
    }

    // 업데이트 실행
    const { data, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .select()
      .single()

    if (error) {
      console.error('문의 업데이트 실패:', error)
      return NextResponse.json(
        { error: '문의 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, inquiry: data })
  } catch (error) {
    console.error('문의 업데이트 중 오류:', error)
    return NextResponse.json(
      { error: '문의 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
