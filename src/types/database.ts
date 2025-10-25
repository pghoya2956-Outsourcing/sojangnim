/**
 * Supabase 데이터베이스 스키마 타입 정의
 */

/**
 * 제품 배지 타입 (ENUM)
 */
export type ProductBadge = '신제품' | '베스트' | '프리미엄' | '할인';

/**
 * categories 테이블 스키마
 */
export interface CategorySchema {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * products 테이블 스키마
 */
export interface ProductSchema {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  badge: ProductBadge | null;
  specs: Record<string, string> | null;
  created_at: string;
}

/**
 * Supabase 쿼리 응답 타입 (JOIN 포함)
 */
export interface ProductWithCategory extends ProductSchema {
  categories: CategorySchema;
}
