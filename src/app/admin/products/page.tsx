import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin, createClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'

export default async function AdminProductsPage() {
  const { authorized } = await requireAdmin()

  if (!authorized) {
    redirect('/admin/login')
  }

  const supabaseClient = await createClient()
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading products</div>
  }

  async function deleteProduct(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    await supabase.from('products').delete().eq('id', id)
    redirect('/admin/products')
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">제품 관리</h1>
        <Link
          href="/admin/products/new"
          className="bg-[#1a1a1a] text-white px-6 py-3 rounded-md hover:bg-black transition-colors font-semibold"
        >
          + 새 제품 추가
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#fafafa] border-b border-[#e0e0e0]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1a1a1a]">
                제품명
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1a1a1a]">
                카테고리
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1a1a1a]">
                가격
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1a1a1a]">
                뱃지
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[#1a1a1a]">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e0e0]">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-[#fafafa]">
                <td className="px-6 py-4 text-sm text-[#1a1a1a] font-medium">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-[#666]">
                  {product.category?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-[#1a1a1a] font-semibold">
                  {product.price.toLocaleString('ko-KR')}원
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.badge ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {product.badge}
                    </span>
                  ) : (
                    <span className="text-[#999]">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm text-[#1a1a1a] hover:underline font-medium"
                    >
                      수정
                    </Link>
                    <form action={deleteProduct} className="inline">
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:underline font-medium"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products?.length === 0 && (
          <div className="text-center py-12 text-[#666]">
            <p>등록된 제품이 없습니다.</p>
            <Link
              href="/admin/products/new"
              className="text-[#1a1a1a] hover:underline mt-2 inline-block"
            >
              첫 제품 추가하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
