import { requireAdmin, getServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import InquiryList from '@/components/admin/InquiryList'
import type { Inquiry } from '@/types/inquiry'

export default async function AdminInquiriesPage() {
  await requireAdmin()

  const { tenant, raw: supabase } = await getServerSupabase()

  // 문의 목록 조회
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('문의 조회 실패:', error)
  }

  // 상태별 카운트
  const { data: statusCounts } = await supabase
    .from('inquiries')
    .select('status')
    .eq('tenant_id', tenant.id)

  const counts = {
    total: statusCounts?.length || 0,
    pending: statusCounts?.filter((i) => i.status === 'pending').length || 0,
    contacted: statusCounts?.filter((i) => i.status === 'contacted').length || 0,
    completed: statusCounts?.filter((i) => i.status === 'completed').length || 0,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 관리자
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">문의 관리</h1>
        <p className="mt-2 text-gray-600">
          고객 문의를 확인하고 처리 상태를 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">전체</p>
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
          <p className="text-sm text-yellow-700">대기</p>
          <p className="text-2xl font-bold text-yellow-800">{counts.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
          <p className="text-sm text-blue-700">연락완료</p>
          <p className="text-2xl font-bold text-blue-800">{counts.contacted}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <p className="text-sm text-green-700">처리완료</p>
          <p className="text-2xl font-bold text-green-800">{counts.completed}</p>
        </div>
      </div>

      {/* 문의 목록 */}
      {inquiries && inquiries.length > 0 ? (
        <InquiryList inquiries={inquiries as unknown as Inquiry[]} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">아직 문의가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
