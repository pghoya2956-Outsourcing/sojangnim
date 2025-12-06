import Link from 'next/link'
import { getServerSupabase } from '@/lib/supabase/server'
import type { Category } from '@/types/product'

interface CategorySidebarProps {
  currentCategorySlug?: string
}

export default async function CategorySidebar({ currentCategorySlug }: CategorySidebarProps) {
  // Get tenant-aware Supabase client
  const { tenant, raw: supabase } = await getServerSupabase()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch categories:', error)
    return null
  }

  return (
    <aside className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 sm:p-6 h-fit lg:sticky lg:top-24">
      <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 sm:mb-4">카테고리</h3>
      <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
        <Link
          href="/products"
          className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
            !currentCategorySlug
              ? 'bg-[#1a1a1a] text-white'
              : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] active:scale-[0.97]'
          }`}
        >
          전체 제품
        </Link>
        {categories?.map((category: Category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              currentCategorySlug === category.slug
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] active:scale-[0.97]'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
