import CartClient from './CartClient'

// 동적 렌더링 강제 (비밀번호 보호 깜빡임 방지)
export const dynamic = 'force-dynamic'

export default function CartPage() {
  return <CartClient />
}
