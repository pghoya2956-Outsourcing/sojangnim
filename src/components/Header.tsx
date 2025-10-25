import Link from 'next/link'
import CartBadge from './CartBadge'

export default function Header() {
  return (
    <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[#1a1a1a]">TOOLBOX PRO</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              href="/"
              className="text-[#555] hover:text-[#1a1a1a] font-medium text-sm transition-colors"
            >
              홈
            </Link>
            <Link
              href="/products"
              className="text-[#555] hover:text-[#1a1a1a] font-medium text-sm transition-colors"
            >
              제품
            </Link>
            <Link
              href="/cart"
              className="text-[#555] hover:text-[#1a1a1a] font-medium text-sm transition-colors"
            >
              견적
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-md hover:bg-black transition-colors font-semibold text-sm"
            >
              <span>🛒</span>
              <CartBadge />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
