/**
 * Supabase 데이터베이스 스키마 타입 정의
 */

import type { ProductBadge } from './product';

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
