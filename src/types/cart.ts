/**
 * 장바구니 관련 타입 정의
 */

import { Product } from './product';

/**
 * 장바구니 아이템
 */
export interface CartItem {
  /** 제품 정보 */
  product: Product;
  /** 수량 */
  quantity: number;
}

/**
 * 장바구니 상태
 */
export interface CartState {
  /** 장바구니 아이템 목록 */
  items: CartItem[];
  /** 장바구니에 제품 추가 */
  addItem: (product: Product, quantity: number) => void;
  /** 제품 수량 업데이트 */
  updateQuantity: (productId: string, quantity: number) => void;
  /** 장바구니에서 제품 제거 */
  removeItem: (productId: string) => void;
  /** 장바구니 전체 비우기 */
  clearCart: () => void;
  /** 총 아이템 수 (수량 합계) */
  getTotalItems: () => number;
  /** 총 가격 */
  getTotalPrice: () => number;
}
