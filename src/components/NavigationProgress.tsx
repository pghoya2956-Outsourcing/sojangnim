'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 페이지 전환 완료 시 프로그레스 초기화
  useEffect(() => {
    if (isNavigating) {
      // 페이지 로드 완료 - 빠르게 100%로
      setProgress(100)
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // 전역 클릭 이벤트로 Link 클릭 감지
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link?.href && !link.target && !link.download) {
        try {
          const url = new URL(link.href)
          // 같은 origin이고 다른 경로로 이동하는 경우에만
          if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
            setIsNavigating(true)
            setProgress(30)

            // 점진적 프로그레스 증가
            const interval = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 90) {
                  clearInterval(interval)
                  return prev
                }
                return prev + Math.random() * 10
              })
            }, 100)

            // cleanup
            const cleanup = () => clearInterval(interval)
            window.addEventListener('beforeunload', cleanup, { once: true })
          }
        } catch {
          // URL 파싱 실패 시 무시
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!isNavigating && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-200/50">
      <div
        className="h-full bg-[#1a1a1a] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
