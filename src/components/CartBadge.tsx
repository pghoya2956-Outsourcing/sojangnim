'use client'

import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'

export default function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="font-medium">장바구니</span>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">장바구니</span>
      {totalItems > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {totalItems}
        </span>
      )}
    </div>
  )
}
