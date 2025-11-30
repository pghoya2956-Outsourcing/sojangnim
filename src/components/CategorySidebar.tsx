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
    <aside className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 h-fit sticky top-28">
      <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">카테고리</h3>
      <nav className="space-y-1">
        <Link
          href="/products"
          className={`block px-4 py-3 rounded-md text-sm font-medium transition-all ${
            !currentCategorySlug
              ? 'bg-[#1a1a1a] text-white'
              : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
          }`}
        >
          전체 제품
        </Link>
        {categories?.map((category: Category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-all ${
              currentCategorySlug === category.slug
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
