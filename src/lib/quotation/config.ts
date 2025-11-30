/**
 * 견적서 설정 및 회사 정보 관리
 * Phase 8: 견적서 출력 템플릿 구현
 *
 * 클라이언트/서버 공용 - 환경변수 기반 (localStorage에서 오버라이드 가능)
 */

import type { CompanyInfo } from '@/types/quotation'

/**
 * 환경변수에서 회사 정보 가져오기
 * @returns CompanyInfo 객체
 */
export function getCompanyInfo(): CompanyInfo {
  // 클라이언트: localStorage 체크
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('tenantCompanyInfo')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {
        // 파싱 실패시 환경변수 사용
      }
    }
  }

  return {
    businessNumber: process.env.NEXT_PUBLIC_COMPANY_BUSINESS_NUMBER || '',
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || '',
    representative: process.env.NEXT_PUBLIC_COMPANY_REPRESENTATIVE || '',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '',
    businessType: process.env.NEXT_PUBLIC_COMPANY_BUSINESS_TYPE || '',
    businessCategory: process.env.NEXT_PUBLIC_COMPANY_BUSINESS_CATEGORY || '',
    sealImage: process.env.NEXT_PUBLIC_COMPANY_SEAL_IMAGE || undefined,
    logoImage: process.env.NEXT_PUBLIC_COMPANY_LOGO_IMAGE || undefined,
  }
}

/**
 * 회사 정보 유효성 검증
 * @param companyInfo 회사 정보 객체
 * @returns 필수 필드가 모두 채워졌으면 true
 */
export function validateCompanyInfo(companyInfo: CompanyInfo): boolean {
  return !!(
    companyInfo.businessNumber &&
    companyInfo.name &&
    companyInfo.representative &&
    companyInfo.address &&
    companyInfo.businessType &&
    companyInfo.businessCategory
  )
}
