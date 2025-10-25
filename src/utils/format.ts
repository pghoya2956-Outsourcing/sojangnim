/**
 * 포맷팅 관련 유틸리티 함수
 */

/**
 * 숫자를 한국 원화 포맷으로 변환
 * @param price - 가격 (숫자)
 * @returns "123,456원" 형식의 문자열
 *
 * @example
 * formatPrice(123456) // "123,456원"
 * formatPrice(1000) // "1,000원"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 날짜를 한국 형식으로 포맷
 * @param date - Date 객체 또는 ISO 문자열
 * @returns "2025년 10월 25일" 형식의 문자열
 *
 * @example
 * formatDate(new Date()) // "2025년 10월 25일"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * 카테고리 슬러그를 한글 이름으로 변환
 * @param slug - 카테고리 슬러그 (예: "power-tools")
 * @returns 한글 카테고리 이름 (예: "전동공구")
 */
export function getCategoryName(slug: string): string {
  const categoryMap: Record<string, string> = {
    'power-tools': '전동공구',
    'air-tools': '에어공구',
    'measuring-tools': '측정기',
    'welding': '용접장비',
    'safety': '안전용품',
  };

  return categoryMap[slug] || slug;
}

/**
 * 제품 수량 표시 텍스트 생성
 * @param count - 제품 수량
 * @returns "제품 N개" 형식의 문자열
 *
 * @example
 * formatProductCount(5) // "제품 5개"
 * formatProductCount(0) // "제품 0개"
 */
export function formatProductCount(count: number): string {
  return `제품 ${count}개`;
}
