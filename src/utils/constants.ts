/**
 * 애플리케이션 전역 상수
 */

/**
 * 배지 타입별 Tailwind CSS 클래스
 */
export const BADGE_COLORS: Record<string, string> = {
  신제품: 'bg-blue-500',
  베스트: 'bg-red-500',
  프리미엄: 'bg-purple-500',
  할인: 'bg-green-500',
};

/**
 * 카테고리 슬러그와 한글 이름 매핑
 */
export const CATEGORY_NAMES: Record<string, string> = {
  'power-tools': '전동공구',
  'air-tools': '에어공구',
  'measuring-tools': '측정기',
  'welding': '용접장비',
  'safety': '안전용품',
};

/**
 * 디자인 시스템 색상 (Professional Clean)
 */
export const COLORS = {
  primary: '#1a1a1a',
  secondary: '#4a4a4a',
  accent: '#888',
  background: '#ffffff',
  surface: '#fafafa',
  border: '#e0e0e0',
} as const;

/**
 * localStorage 키
 */
export const STORAGE_KEYS = {
  cart: 'sojangnim-cart',
} as const;

/**
 * 기본 제품 이미지 (fallback)
 */
export const DEFAULT_PRODUCT_IMAGE = '📦';

/**
 * 페이지당 표시할 제품 수 (향후 페이지네이션용)
 */
export const PRODUCTS_PER_PAGE = 12;
