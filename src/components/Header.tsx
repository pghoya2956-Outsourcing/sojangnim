import Link from 'next/link'
import { brandConfig } from '@/lib/config'
import CartBadge from './CartBadge'

export default function Header() {
  return (
    <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Logo */}
          <Link href="/products" className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a1a1a]">{brandConfig.name}</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <Link
              href="/products"
              className="hidden sm:block text-[#555] hover:text-[#1a1a1a] font-medium text-sm transition-colors"
            >
              제품
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#1a1a1a] text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-md hover:bg-black active:scale-[0.97] transition-all font-semibold text-xs sm:text-sm"
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
