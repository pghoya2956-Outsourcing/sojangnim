/**
 * 환경변수 설정 관리
 * 모든 환경변수는 이 파일을 통해 접근합니다.
 */

/**
 * 브랜드 설정
 */
export const brandConfig = {
  /** 브랜드명 (로고, Header) */
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'TOOLBOX PRO',

  /** 사이트 제목 (브라우저 탭) */
  siteTitle: process.env.NEXT_PUBLIC_SITE_TITLE || '소장님 - 제품 카탈로그',

  /** 사이트 설명 (SEO) */
  siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '견적서 출력용 제품 카탈로그 사이트',
} as const

/**
 * 회사 정보 설정
 */
export const companyConfig = {
  /** 회사명 (Footer, 견적서) */
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || '소장님',

  /** Footer 태그라인 */
  footerTagline: process.env.NEXT_PUBLIC_FOOTER_TAGLINE || '전문 공구 및 산업용품 카탈로그',

  /** Footer 고객지원 텍스트 */
  footerSupportText: process.env.NEXT_PUBLIC_FOOTER_SUPPORT_TEXT || '견적서 출력용 카탈로그 사이트',
} as const

/**
 * 스토리지 설정
 */
export const storageConfig = {
  /** localStorage 키 prefix */
  prefix: process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'sojangnim',

  /** 장바구니 스토리지 키 */
  get cartKey() {
    return `${this.prefix}-cart`
  },
} as const
