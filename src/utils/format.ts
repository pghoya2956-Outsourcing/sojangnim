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
