import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { Database } from '@/types/supabase'

// ============================================
// 기본 Supabase 클라이언트 (인증용)
// ============================================

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서는 cookies를 설정할 수 없음
          }
        },
      },
    }
  )
}

// ============================================
// 테넌트 타입 정의
// ============================================

// JSON 필드 상세 타입
export interface TenantTheme {
  brandName: string
  logoImage: string
  sealImage: string
  colors: {
    primary: string
    accent: string
  }
}

export interface TenantCompanyInfo {
  businessNumber: string
  representative: string
  address: string
  businessType: string
  businessCategory: string
  phone: string
  fax: string
  email: string
}

export interface TenantLimits {
  maxProducts: number
  maxCategories: number
  maxQuotationsPerMonth: number
}

export interface Tenant {
  id: string
  slug: string
  name: string
  domain: string | null
  theme: TenantTheme
  company_info: TenantCompanyInfo
  plan: 'free' | 'pro' | 'enterprise'
  limits: TenantLimits
  is_active: boolean
}

// 기본값 상수
const DEFAULT_THEME: TenantTheme = {
  brandName: '',
  logoImage: '',
  sealImage: '',
  colors: { primary: '#1a1a1a', accent: '#888' }
}

const DEFAULT_COMPANY_INFO: TenantCompanyInfo = {
  businessNumber: '',
  representative: '',
  address: '',
  businessType: '',
  businessCategory: '',
  phone: '',
  fax: '',
  email: ''
}

const DEFAULT_LIMITS: TenantLimits = {
  maxProducts: 100,
  maxCategories: 10,
  maxQuotationsPerMonth: 100
}

// ============================================
// Service Role 클라이언트 (테넌트 조회용)
// ============================================

function getServiceClient(): SupabaseClient<Database> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Service Role Key가 없으면 Anon Key 사용 (로컬 개발용)
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// ============================================
// 테넌트 조회 (캐싱)
// ============================================

// React cache로 요청당 1회만 조회
export const getTenant = cache(async (): Promise<Tenant> => {
  const tenantSlug = process.env.TENANT_SLUG || 'default'
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // 테넌트가 없으면 에러 (배포 설정 문제)
    console.error(`Tenant not found: ${tenantSlug}`, error)
    throw new Error(`Invalid tenant configuration: ${tenantSlug}`)
  }

  // JSON 필드를 안전하게 변환
  const theme = (data.theme && typeof data.theme === 'object' && !Array.isArray(data.theme))
    ? { ...DEFAULT_THEME, ...data.theme as object } as TenantTheme
    : DEFAULT_THEME

  const company_info = (data.company_info && typeof data.company_info === 'object' && !Array.isArray(data.company_info))
    ? { ...DEFAULT_COMPANY_INFO, ...data.company_info as object } as TenantCompanyInfo
    : DEFAULT_COMPANY_INFO

  const limits = (data.limits && typeof data.limits === 'object' && !Array.isArray(data.limits))
    ? { ...DEFAULT_LIMITS, ...data.limits as object } as TenantLimits
    : DEFAULT_LIMITS

  const plan = (['free', 'pro', 'enterprise'].includes(data.plan || ''))
    ? data.plan as 'free' | 'pro' | 'enterprise'
    : 'free'

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    domain: data.domain,
    theme,
    company_info,
    plan,
    limits,
    is_active: data.is_active ?? true
  }
})

// ============================================
// 테넌트 기반 Supabase 클라이언트
// ============================================

// 테이블 이름 타입
type TableName = keyof Database['public']['Tables']

export interface TenantSupabase {
  tenant: Tenant
  from: SupabaseClient<Database>['from']
  raw: SupabaseClient<Database>
}

/**
 * 테넌트 기반 Supabase 클라이언트
 * - 모든 쿼리에 tenant_id 필터가 자동 적용됨
 * - Server Component에서만 사용
 */
export async function getServerSupabase(): Promise<TenantSupabase> {
  const tenant = await getTenant()
  const serviceClient = getServiceClient()

  return {
    tenant,
    // 원본 from 메서드를 직접 바인딩
    from: serviceClient.from.bind(serviceClient),
    // 원본 클라이언트 (tenant_id 직접 관리 시)
    raw: serviceClient
  }
}

// ============================================
// 인증 관련 함수
// ============================================

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function isAdmin(email: string) {
  const tenant = await getTenant()
  const supabase = await createClient()

  // 먼저 super_admin인지 확인 (테넌트 무관)
  const { data: superAdminData } = await supabase
    .from('admin_users')
    .select('email, role')
    .eq('email', email)
    .eq('role', 'super_admin')
    .single()

  if (superAdminData) {
    return true // super_admin은 모든 테넌트 접근 가능
  }

  // 일반 admin은 해당 테넌트에 등록되어 있어야 함
  const { data, error } = await supabase
    .from('admin_users')
    .select('email, role')
    .eq('email', email)
    .eq('tenant_id', tenant.id)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * 관리자 권한 필수 확인 (테넌트 기반)
 * - super_admin: 모든 테넌트 접근 가능
 * - admin: 해당 테넌트만 접근 가능
 * unauthorized 시 자동으로 /admin/login으로 redirect
 */
export async function requireAdmin() {
  const user = await getUser()

  if (!user || !user.email) {
    redirect('/admin/login')
  }

  const tenant = await getTenant()
  const supabase = await createClient()

  // 먼저 super_admin인지 확인 (테넌트 무관)
  const { data: superAdminData } = await supabase
    .from('admin_users')
    .select('email, role, tenant_id')
    .eq('email', user.email)
    .eq('role', 'super_admin')
    .single()

  if (superAdminData) {
    // super_admin은 모든 테넌트 접근 가능
    return { user, role: superAdminData.role, tenant }
  }

  // 일반 admin은 해당 테넌트에 등록되어 있어야 함
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('email, role, tenant_id')
    .eq('email', user.email)
    .eq('tenant_id', tenant.id)
    .single()

  if (!adminData) {
    redirect('/admin/login')
  }

  return { user, role: adminData.role, tenant }
}

// ============================================
// 테넌트 설정 헬퍼
// ============================================

/**
 * 테넌트의 브랜딩 정보 가져오기
 */
export async function getTenantBranding() {
  const tenant = await getTenant()

  return {
    brandName: tenant.theme.brandName || process.env.NEXT_PUBLIC_BRAND_NAME || tenant.name,
    logoImage: tenant.theme.logoImage || process.env.NEXT_PUBLIC_COMPANY_LOGO_IMAGE,
    sealImage: tenant.theme.sealImage || process.env.NEXT_PUBLIC_COMPANY_SEAL_IMAGE,
    colors: tenant.theme.colors,
  }
}

/**
 * 테넌트의 회사 정보 가져오기 (견적서용)
 */
export async function getTenantCompanyInfo() {
  const tenant = await getTenant()

  return {
    name: tenant.name,
    businessNumber: tenant.company_info.businessNumber || process.env.NEXT_PUBLIC_COMPANY_BUSINESS_NUMBER || '',
    representative: tenant.company_info.representative || process.env.NEXT_PUBLIC_COMPANY_REPRESENTATIVE || '',
    address: tenant.company_info.address || process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '',
    businessType: tenant.company_info.businessType || process.env.NEXT_PUBLIC_COMPANY_BUSINESS_TYPE || '',
    businessCategory: tenant.company_info.businessCategory || process.env.NEXT_PUBLIC_COMPANY_BUSINESS_CATEGORY || '',
    phone: tenant.company_info.phone || process.env.NEXT_PUBLIC_COMPANY_PHONE || '',
    fax: tenant.company_info.fax || process.env.NEXT_PUBLIC_COMPANY_FAX || '',
    email: tenant.company_info.email || process.env.NEXT_PUBLIC_COMPANY_EMAIL || '',
    sealImage: tenant.theme.sealImage || process.env.NEXT_PUBLIC_COMPANY_SEAL_IMAGE,
    logoImage: tenant.theme.logoImage || process.env.NEXT_PUBLIC_COMPANY_LOGO_IMAGE,
  }
}

/**
 * 테넌트 사용량 제한 확인
 */
export async function checkTenantLimits() {
  const tenant = await getTenant()
  const { raw } = await getServerSupabase()

  // 현재 제품 수 조회
  const { count: productCount } = await raw
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  // 현재 카테고리 수 조회
  const { count: categoryCount } = await raw
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  return {
    products: {
      current: productCount || 0,
      max: tenant.limits.maxProducts,
      canAdd: (productCount || 0) < tenant.limits.maxProducts
    },
    categories: {
      current: categoryCount || 0,
      max: tenant.limits.maxCategories,
      canAdd: (categoryCount || 0) < tenant.limits.maxCategories
    },
    plan: tenant.plan
  }
}
