/**
 * localStorage 관련 유틸리티 함수
 */

/**
 * localStorage에서 JSON 데이터 읽기
 * @param key - localStorage 키
 * @returns 파싱된 데이터 또는 null
 *
 * @example
 * const cart = getStorageItem<CartItem[]>('sojangnim-cart')
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * localStorage에 JSON 데이터 저장
 * @param key - localStorage 키
 * @param value - 저장할 데이터
 *
 * @example
 * setStorageItem('sojangnim-cart', cartItems)
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

/**
 * localStorage에서 아이템 삭제
 * @param key - localStorage 키
 *
 * @example
 * removeStorageItem('sojangnim-cart')
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * localStorage 전체 초기화
 *
 * @example
 * clearStorage()
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
