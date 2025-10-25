import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import ProductCard from '@/components/ProductCard'
import type { ProductWithCategory } from '@/types/product'

export default async function Home() {
  // Fetch featured products (products with badges)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .not('badge', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4)

  // Fetch recent products
  const { data: recentProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">소장님 제품 카탈로그</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            전문 공구 및 산업용품을 한눈에 확인하고 견적서를 출력하세요
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              제품 둘러보기
            </Link>
            <Link
              href="/cart"
              className="bg-gray-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              장바구니 확인
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#1a1a1a]">추천 제품</h2>
            <Link
              href="/products"
              className="text-[#555] hover:text-[#1a1a1a] font-medium"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredProducts.map((product: ProductWithCategory) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Products */}
      {recentProducts && recentProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#1a1a1a]">최신 제품</h2>
            <Link
              href="/products"
              className="text-[#555] hover:text-[#1a1a1a] font-medium"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recentProducts.map((product: ProductWithCategory) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">견적서가 필요하신가요?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            원하시는 제품을 장바구니에 담고 간편하게 견적서를 출력하세요
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            제품 선택하기
          </Link>
        </div>
      </section>
    </div>
  )
}
