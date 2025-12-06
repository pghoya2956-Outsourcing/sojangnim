/**
 * 문의하기 기능 타입 정의
 */

/**
 * 문의 품목 (장바구니 스냅샷)
 */
export interface InquiryItem {
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}

/**
 * 문의 상태
 */
export type InquiryStatus = 'pending' | 'contacted' | 'completed' | 'cancelled'

/**
 * 문의 상태 라벨
 */
export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: '대기',
  contacted: '연락완료',
  completed: '처리완료',
  cancelled: '취소',
}

/**
 * 문의 상태 색상 (Tailwind)
 */
export const INQUIRY_STATUS_COLORS: Record<InquiryStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

/**
 * 문의 데이터 (DB 저장용)
 */
export interface Inquiry {
  id: string
  tenant_id: string
  customer_name: string
  customer_contact: string
  message: string | null
  items: InquiryItem[]
  total_amount: number
  status: InquiryStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}

/**
 * 문의 생성 요청
 */
export interface CreateInquiryRequest {
  customer_name: string
  customer_contact: string
  message?: string
  items: InquiryItem[]
  total_amount: number
}

/**
 * 문의 상태 업데이트 요청
 */
export interface UpdateInquiryRequest {
  status?: InquiryStatus
  admin_note?: string
}
