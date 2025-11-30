/**
 * 견적서 관련 타입 정의
 * Phase 8: 견적서 출력 템플릿 구현
 */

/**
 * 공급자 정보 (회사 정보)
 */
export interface CompanyInfo {
  businessNumber: string      // 사업자등록번호
  name: string                 // 상호
  representative: string       // 대표자명
  address: string              // 사업장 주소
  businessType: string         // 업태
  businessCategory: string     // 종목
  sealImage?: string           // 도장 이미지 경로 (선택사항)
  logoImage?: string           // 회사 로고 이미지 경로 (선택사항)
}

/**
 * 수신자 정보
 */
export interface RecipientInfo {
  name: string                 // 회사명/기관명/개인명
  contactPerson?: string       // 담당자명
  phone?: string               // 연락처
  address?: string             // 주소
  type?: RecipientType        // 수신자 타입 (Phase 9-2에서 추가, 선택사항)
}

/**
 * 수신자 타입 (Phase 9-2에서 추가될 타입)
 */
export type RecipientType = 'public-institution' | 'corporate' | 'individual'

/**
 * 견적서 메타데이터
 */
export interface QuotationMetadata {
  number: string               // 견적서 번호 (YYYYMMDD-HHMMSS)
  date: string                 // 작성일자 (YYYY-MM-DD)
}

/**
 * 견적서 품목
 */
export interface QuotationItem {
  seq: number                  // 순번
  name: string                 // 품목명
  spec: string                 // 규격 (제품 설명)
  quantity: number             // 수량
  unitPrice: number            // 단가
  supplyPrice: number          // 공급가액
  taxAmount: number            // 세액 (10%)
}

/**
 * 견적서 전체 데이터
 */
export interface QuotationData {
  metadata: QuotationMetadata
  company: CompanyInfo
  recipient: RecipientInfo
  items: QuotationItem[]
  totalSupplyPrice: number     // 총 공급가액
  totalTaxAmount: number       // 총 세액
  totalAmount: number          // 총 합계
}
