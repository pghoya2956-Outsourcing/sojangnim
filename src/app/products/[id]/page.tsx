import { getServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import type { ProductWithCategory } from '@/types/product'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

const BADGE_COLORS = {
  '신제품': 'bg-blue-500',
  '베스트': 'bg-red-500',
  '프리미엄': 'bg-purple-500',
  '할인': 'bg-green-500',
} as const

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params

  // Get tenant-aware Supabase client
  const { tenant, raw: supabase } = await getServerSupabase()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .eq('tenant_id', tenant.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const typedProduct = product as ProductWithCategory

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-[#666]">
        <Link href="/products" className="hover:text-[#1a1a1a]">제품</Link>
        {typedProduct.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${typedProduct.category.slug}`}
              className="hover:text-[#1a1a1a]"
            >
              {typedProduct.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-[#1a1a1a]">{typedProduct.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12">
          {/* Product Image */}
          <div className="bg-[#fafafa] rounded-lg flex items-center justify-center aspect-square">
            {typedProduct.image_url ? (
              <img
                src={typedProduct.image_url}
                alt={typedProduct.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-9xl">🔨</span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              {typedProduct.category && (
                <div className="text-xs text-[#888] uppercase tracking-widest mb-3 font-semibold">
                  {typedProduct.category.name}
                </div>
              )}
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight">
                {typedProduct.name}
              </h1>
              {typedProduct.badge && (
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium text-white ${
                    BADGE_COLORS[typedProduct.badge]
                  }`}
                >
                  {typedProduct.badge}
                </span>
              )}
            </div>

            {typedProduct.description && (
              <p className="text-[#666] mb-8 text-base leading-relaxed">
                {typedProduct.description}
              </p>
            )}

            {/* Specs */}
            {typedProduct.specs && Object.keys(typedProduct.specs).length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">제품 사양</h2>
                <div className="bg-[#f9f9f9] rounded-md p-4 space-y-3">
                  {Object.entries(typedProduct.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-[#888] font-medium">{key}</span>
                      <span className="text-[#1a1a1a] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-8 p-8 bg-[#fafafa] rounded-lg border-t border-[#f0f0f0]">
              <p className="text-sm text-[#888] mb-2">제품 가격</p>
              <p className="text-5xl font-bold text-[#1a1a1a] mb-2">
                {typedProduct.price.toLocaleString('ko-KR')}원
              </p>
              <p className="text-sm text-[#666]">VAT 별도</p>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-auto">
              <AddToCartButton product={typedProduct} />
            </div>
          </div>
        </div>
      </div>

      {/* Back to List */}
      <div className="mt-8">
        <Link
          href="/products"
          className="inline-flex items-center text-[#666] hover:text-[#1a1a1a] font-medium transition-colors"
        >
          <span className="mr-2">←</span>
          제품 목록으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
