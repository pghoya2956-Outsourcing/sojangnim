/**
 * Supabase 데이터베이스 타입 재정의
 * 실제 타입은 supabase.ts에서 자동 생성됨
 */

import type { Tables } from './supabase'

// 편의를 위한 타입 별칭
export type CategorySchema = Tables<'categories'>
export type ProductSchema = Tables<'products'>
export type TenantSchema = Tables<'tenants'>
export type AdminUserSchema = Tables<'admin_users'>
export type TenantUsageSchema = Tables<'tenant_usage'>
