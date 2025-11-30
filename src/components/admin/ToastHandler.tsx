'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ToastHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      toast.error(decodeURIComponent(error))
      // URL에서 error 파라미터 제거
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      router.replace(url.pathname + url.search)
    }

    if (success) {
      toast.success(decodeURIComponent(success))
      // URL에서 success 파라미터 제거
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      router.replace(url.pathname + url.search)
    }
  }, [searchParams, router])

  return null
}
