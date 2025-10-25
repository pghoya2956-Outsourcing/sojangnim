import { supabase } from '@/lib/supabase/client'
import CategorySidebar from '@/components/CategorySidebar'
import ProductCard from '@/components/ProductCard'
import type { ProductWithCategory } from '@/types/product'

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const categorySlug = params.category

  // Fetch products with category information
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  // Filter by category if specified
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  const { data: products, error } = await query

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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
              {categorySlug ? '카테고리별 제품' : '전체 제품'}
            </h1>
            <p className="text-sm text-[#666]">
              총 {products?.length || 0}개의 제품
            </p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: ProductWithCategory) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
