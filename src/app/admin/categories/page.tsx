import Link from 'next/link'
import { requireAdmin, getServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  created_at: string
  product_count: number
}

interface CategoryRow {
  id: string
  name: string
  slug: string
  created_at: string
  tenant_id: string
}

async function getCategories(tenantId: string): Promise<Category[]> {
  const { raw: supabase } = await getServerSupabase()

  // 카테고리와 각 카테고리의 제품 수를 가져옴 (테넌트 필터)
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true }) as { data: CategoryRow[] | null, error: Error | null }

  if (error || !categories) {
    console.error('Error fetching categories:', error)
    return []
  }

  // 각 카테고리별 제품 수 계산 (테넌트 필터)
  const { data: products } = await supabase
    .from('products')
    .select('category_id')
    .eq('tenant_id', tenantId) as { data: { category_id: string | null }[] | null }

  const productCountMap = new Map<string, number>()
  products?.forEach(p => {
    if (p.category_id) {
      const count = productCountMap.get(p.category_id) || 0
      productCountMap.set(p.category_id, count + 1)
    }
  })

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    created_at: cat.created_at,
    product_count: productCountMap.get(cat.id) || 0
  }))
}

async function deleteCategory(formData: FormData) {
  'use server'
  const { tenant } = await requireAdmin()
  const { raw: supabase } = await getServerSupabase()

  const categoryId = formData.get('categoryId') as string

  // 해당 카테고리의 제품 수 확인 (테넌트 필터)
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('tenant_id', tenant.id)

  if (count && count > 0) {
    redirect('/admin/categories?error=' + encodeURIComponent('제품이 있는 카테고리는 삭제할 수 없습니다'))
  }

  // 테넌트 검증 후 삭제
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('tenant_id', tenant.id)

  if (error) {
    redirect('/admin/categories?error=' + encodeURIComponent('카테고리 삭제에 실패했습니다'))
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories?success=' + encodeURIComponent('카테고리가 삭제되었습니다'))
}

export default async function AdminCategoriesPage() {
  const { tenant } = await requireAdmin()
  const categories = await getCategories(tenant.id)

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">카테고리 관리</h1>
          <p className="text-[#666] mt-1">
            총 {categories.length}개의 카테고리
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-[#333] transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>새 카테고리</span>
        </Link>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f7f7f7] border-b border-[#e5e5e5]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                이름
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                슬러그
              </th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                제품 수
              </th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                생성일
              </th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-[#e5e5e5] last:border-b-0 hover:bg-[#fafafa] transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-[#1a1a1a]">
                    {category.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="bg-[#f0f0f0] px-2 py-1 rounded text-sm text-[#666]">
                    {category.slug}
                  </code>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {category.product_count}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-[#666]">
                  {new Date(category.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      수정
                    </Link>
                    {category.product_count === 0 ? (
                      <form action={deleteCategory}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                        >
                          삭제
                        </button>
                      </form>
                    ) : (
                      <span className="text-sm text-gray-400 px-3 py-1.5" title="제품이 있는 카테고리는 삭제할 수 없습니다">
                        삭제 불가
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#666]">
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>참고:</strong> 제품이 등록된 카테고리는 삭제할 수 없습니다.
          먼저 해당 카테고리의 모든 제품을 다른 카테고리로 이동하거나 삭제해주세요.
        </p>
      </div>
    </div>
  )
}
