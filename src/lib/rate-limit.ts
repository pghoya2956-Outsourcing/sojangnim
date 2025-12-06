/**
 * 간단한 In-Memory Rate Limiter
 * 서버리스 환경에서는 인스턴스마다 별도 메모리를 가지므로 완벽하지 않지만,
 * 기본적인 보호를 제공합니다.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// IP별 요청 기록 (메모리에 저장)
const rateLimitMap = new Map<string, RateLimitEntry>()

// 오래된 엔트리 정리 (메모리 누수 방지)
const CLEANUP_INTERVAL = 60 * 1000 // 1분마다
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
  lastCleanup = now
}

export interface RateLimitConfig {
  maxRequests: number // 허용 요청 수
  windowMs: number // 시간 윈도우 (밀리초)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Rate Limit 체크
 * @param identifier IP 주소 또는 고유 식별자
 * @param config Rate Limit 설정
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60 * 1000 }
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // 새로운 요청자이거나 윈도우가 리셋된 경우
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  // 기존 요청자
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * 요청에서 IP 주소 추출
 */
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare 등의 프록시 헤더 확인
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // 기본값
  return 'unknown'
}
