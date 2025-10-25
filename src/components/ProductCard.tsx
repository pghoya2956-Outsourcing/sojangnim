import Link from 'next/link'
import type { ProductWithCategory } from '@/types/product'

interface ProductCardProps {
  product: ProductWithCategory
}

const BADGE_COLORS = {
  '신제품': 'bg-blue-500',
  '베스트': 'bg-red-500',
  '프리미엄': 'bg-purple-500',
  '할인': 'bg-green-500',
} as const

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Product Image */}
      <div className="w-full h-[182px] bg-[#fafafa] flex items-center justify-center text-[3.5rem]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          '🔨'
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {product.category && (
          <div className="text-[0.7rem] text-[#888] uppercase tracking-widest mb-1.5 font-semibold">
            {product.category.name}
          </div>
        )}

        <h3 className="text-[1.05rem] font-bold text-[#1a1a1a] mb-2 leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[0.8rem] text-[#666] leading-relaxed mb-3 flex-1">
            {product.description}
          </p>
        )}

        {/* Product Specs Box */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-[#f9f9f9] p-2.5 rounded-md mb-3">
            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-[0.75rem] text-[#555] py-0.5">
                <span className="text-[#888]">{key}</span>
                <span className="font-semibold text-[#1a1a1a]">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#f0f0f0] mt-auto">
          <div className="text-xl font-bold text-[#1a1a1a]">
            {product.price.toLocaleString('ko-KR')}원
          </div>
          <button className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-md hover:bg-black transition-colors font-semibold text-[0.8rem]">
            장바구니
          </button>
        </div>
      </div>
    </Link>
  )
}
