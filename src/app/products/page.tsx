import { supabase } from '@/lib/supabase/client'
import CategorySidebar from '@/components/CategorySidebar'
import ProductCard from '@/components/ProductCard'
import ProductSearch from '@/components/ProductSearch'
import Pagination from '@/components/Pagination'
import type { ProductWithCategory } from '@/types/product'

const PAGE_SIZE = 12

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const categorySlug = params.category
  const searchQuery = params.search
  const page = Number(params.page) || 1

  // Calculate pagination
  const offset = (page - 1) * PAGE_SIZE

  // Build count query (for total products)
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Build data query (for fetching products)
  let dataQuery = supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  // Get category ID if category slug is specified
  let categoryId: string | null = null
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (category) {
      categoryId = category.id
    }
  }

  // Apply filters to both queries
  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId)
    dataQuery = dataQuery.eq('category_id', categoryId)
  }

  if (searchQuery) {
    countQuery = countQuery.ilike('name', `%${searchQuery}%`)
    dataQuery = dataQuery.ilike('name', `%${searchQuery}%`)
  }

  // Apply pagination to data query
  dataQuery = dataQuery.range(offset, offset + PAGE_SIZE - 1)

  // Execute queries
  const [{ count: totalCount }, { data: products, error }] = await Promise.all([
    countQuery,
    dataQuery,
  ])

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE)

  if (error) {
    console.error('Failed to fetch products:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">제품을 불러오는데 실패했습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-[240px] flex-shrink-0">
          <CategorySidebar currentCategorySlug={categorySlug} />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Search Bar */}
          <ProductSearch />

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
              {searchQuery ? `'${searchQuery}' 검색 결과` : categorySlug ? '카테고리별 제품' : '전체 제품'}
            </h1>
            <p className="text-sm text-[#666]">
              총 {totalCount || 0}개의 제품
              {totalPages > 1 && ` (${page}/${totalPages} 페이지)`}
            </p>
          </div>

          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: ProductWithCategory) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination currentPage={page} totalPages={totalPages} />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-12 text-center">
              <p className="text-[#666]">표시할 제품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
