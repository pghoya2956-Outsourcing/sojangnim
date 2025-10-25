export type ProductBadge = '신제품' | '베스트' | '프리미엄' | '할인' | null

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  badge: ProductBadge
  specs: Record<string, string> | null
  created_at: string
}

export interface ProductWithCategory extends Product {
  category?: Category | null
}
