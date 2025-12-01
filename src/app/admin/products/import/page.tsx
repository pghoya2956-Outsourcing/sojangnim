import { requireAdmin } from '@/lib/supabase/server'
import CSVImportForm from '@/components/admin/CSVImportForm'
import Link from 'next/link'

export default async function ImportProductsPage() {
  await requireAdmin()

  return (
    <div className="max-w-[800px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
        >
          ← 제품 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4">CSV 일괄 등록</h1>
        <p className="text-[#666] mt-1">CSV 파일을 업로드하여 여러 제품을 한 번에 등록합니다.</p>
      </div>

      {/* CSV Import Form */}
      <CSVImportForm />

      {/* Help Section */}
      <div className="mt-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">CSV 파일 형식</h3>
          <p className="text-sm text-blue-800 mb-3">
            CSV 파일은 다음 컬럼을 포함해야 합니다:
          </p>
          <div className="bg-white rounded p-3 font-mono text-xs overflow-x-auto">
            <code>name,description,price,category_slug,badge,image_url</code>
          </div>
          <ul className="mt-3 text-sm text-blue-800 space-y-1">
            <li><strong>name</strong>: 제품명 (필수)</li>
            <li><strong>description</strong>: 제품 설명 (선택)</li>
            <li><strong>price</strong>: 가격, 숫자만 (필수)</li>
            <li><strong>category_slug</strong>: 카테고리 슬러그 (선택, 예: power-tools)</li>
            <li><strong>badge</strong>: 배지 (선택, 신제품/베스트/프리미엄/할인 중 하나)</li>
            <li><strong>image_url</strong>: 이미지 URL (선택)</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">주의사항</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 첫 번째 행은 헤더로 인식됩니다</li>
            <li>• UTF-8 인코딩을 사용해주세요</li>
            <li>• 가격에는 콤마(,)를 넣지 마세요</li>
            <li>• 존재하지 않는 카테고리 슬러그는 무시됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
