import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'
import { sendInquiryNotification } from '@/lib/email/send'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import type { CreateInquiryRequest } from '@/types/inquiry'

// Rate Limit 설정: 1분에 3번까지 허용
const RATE_LIMIT_CONFIG = {
  maxRequests: 3,
  windowMs: 60 * 1000, // 1분
}

/**
 * POST /api/inquiries
 * 고객 문의 생성
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limit 체크
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIG)

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const body: CreateInquiryRequest = await request.json()

    // 2. Honeypot 체크 (봇이 채우는 숨겨진 필드)
    if (body.website) {
      // 봇이 website 필드를 채웠으면 조용히 성공 응답 (봇은 성공한 줄 앎)
      console.log('Honeypot triggered - bot detected:', clientIP)
      return NextResponse.json(
        { success: true, inquiry_id: 'blocked' },
        { status: 201 }
      )
    }

    // 3. 유효성 검사
    if (!body.customer_name || body.customer_name.trim().length < 2) {
      return NextResponse.json(
        { error: '이름/회사명은 최소 2자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    if (!body.customer_contact || body.customer_contact.trim().length === 0) {
      return NextResponse.json(
        { error: '연락처를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: '장바구니가 비어있습니다.' },
        { status: 400 }
      )
    }

    // 테넌트 정보 및 Supabase 클라이언트
    const { tenant, raw: supabase } = await getServerSupabase()

    // 문의 저장
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        tenant_id: tenant.id,
        customer_name: body.customer_name.trim(),
        customer_contact: body.customer_contact.trim(),
        message: body.message?.trim() || null,
        items: JSON.parse(JSON.stringify(body.items)),
        total_amount: body.total_amount,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('문의 저장 실패:', error)
      return NextResponse.json(
        { error: '문의 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 이메일 발송 (비동기 - 실패해도 문의 저장은 성공)
    try {
      await sendInquiryNotification({
        customerName: body.customer_name.trim(),
        customerContact: body.customer_contact.trim(),
        message: body.message?.trim(),
        items: body.items,
        totalAmount: body.total_amount,
        tenantName: tenant.name,
      })
    } catch (emailError) {
      // 이메일 발송 실패는 로그만 남기고 진행
      console.error('이메일 발송 실패:', emailError)
    }

    return NextResponse.json(
      { success: true, inquiry_id: inquiry.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('문의 처리 중 오류:', error)
    return NextResponse.json(
      { error: '문의 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
