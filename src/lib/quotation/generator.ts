/**
 * 견적서 번호 생성 및 데이터 변환 유틸리티
 * Phase 8: 견적서 출력 템플릿 구현
 */

import type { QuotationItem, QuotationData, QuotationMetadata, RecipientInfo } from '@/types/quotation'
import type { CartItem } from '@/types'
import { getCompanyInfo } from './config'

/**
 * 견적서 번호 생성 (YYYYMMDD-HHMMSS 형식)
 * @returns 견적서 번호 (예: 20250117-143025)
 */
export function generateQuotationNumber(): string {
  const now = new Date()
  const date = formatDateForQuotation(now)  // 20250117
  const time = formatTimeForQuotation(now)  // 143025
  return `${date}-${time}`
}

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 * @param date Date 객체
 * @returns YYYYMMDD 형식 문자열
 */
function formatDateForQuotation(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * 시간을 HHMMSS 형식으로 변환
 * @param date Date 객체
 * @returns HHMMSS 형식 문자열
 */
function formatTimeForQuotation(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}${minutes}${seconds}`
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 공급가액 기준으로 세액 계산 (10%)
 * @param supplyPrice 공급가액
 * @returns 세액, 총액
 */
export function calculateTax(supplyPrice: number): {
  supplyPrice: number
  taxAmount: number
  totalAmount: number
} {
  const taxAmount = Math.round(supplyPrice * 0.1)
  const totalAmount = supplyPrice + taxAmount

  return {
    supplyPrice,
    taxAmount,
    totalAmount,
  }
}

/**
 * 장바구니 아이템을 견적서 아이템으로 변환
 * @param cartItems 장바구니 아이템 배열
 * @returns 견적서 아이템 배열
 */
export function convertCartItemsToQuotationItems(cartItems: CartItem[]): QuotationItem[] {
  return cartItems.map((item, index) => {
    const supplyPrice = item.product.price * item.quantity
    const { taxAmount } = calculateTax(supplyPrice)

    return {
      seq: index + 1,
      name: item.product.name,
      spec: item.product.description,
      quantity: item.quantity,
      unitPrice: item.product.price,
      supplyPrice,
      taxAmount,
    }
  })
}

/**
 * 견적서 전체 데이터 생성
 * @param cartItems 장바구니 아이템 배열
 * @param recipientName 수신자명
 * @returns QuotationData 객체
 */
export function generateQuotationData(
  cartItems: CartItem[],
  recipientName: string
): QuotationData {
  // 1. 견적서 메타데이터 생성
  const now = new Date()
  const metadata: QuotationMetadata = {
    number: generateQuotationNumber(),
    date: formatDateISO(now),
  }

  // 2. 회사 정보 가져오기
  const company = getCompanyInfo()

  // 3. 수신자 정보 생성 (Phase 8에서는 type 없이 사용)
  const recipient: RecipientInfo = {
    name: recipientName,
  }

  // 4. 장바구니 아이템을 견적서 아이템으로 변환
  const items = convertCartItemsToQuotationItems(cartItems)

  // 5. 합계 계산
  const totalSupplyPrice = items.reduce((sum, item) => sum + item.supplyPrice, 0)
  const totalTaxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0)
  const totalAmount = totalSupplyPrice + totalTaxAmount

  return {
    metadata,
    company,
    recipient,
    items,
    totalSupplyPrice,
    totalTaxAmount,
    totalAmount,
  }
}

/**
 * 숫자를 천 단위 콤마가 있는 문자열로 변환
 * @param value 숫자
 * @returns 포맷된 문자열 (예: "1,000,000")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR')
}

/**
 * 숫자를 원화 표시 문자열로 변환
 * @param value 숫자
 * @returns 포맷된 문자열 (예: "1,000,000원")
 */
export function formatCurrency(value: number): string {
  return `${formatNumber(value)}원`
}
