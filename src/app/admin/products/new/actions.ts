'use server'

import { requireAdmin, getServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'

type ProductBadge = Database['public']['Enums']['product_badge']

export async function createProduct(formData: FormData) {
  const { tenant } = await requireAdmin() // unauthorized 시 자동 redirect

  const { raw: supabase } = await getServerSupabase()

  // Specs 처리
  const specsJson = formData.get('specs') as string
  let specs = null
  if (specsJson) {
    try {
      specs = JSON.parse(specsJson)
    } catch (e) {
      // 파싱 실패 시 null
    }
  }

  // Badge 유효성 검증
  const badgeValue = formData.get('badge') as string
  const validBadges: ProductBadge[] = ['신제품', '베스트', '프리미엄', '할인']
  const badge = validBadges.includes(badgeValue as ProductBadge) ? (badgeValue as ProductBadge) : null

  const productData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseInt(formData.get('price') as string),
    category_id: (formData.get('category_id') as string) || null,
    badge,
    specs,
    image_url: (formData.get('image_url') as string) || null,
    tenant_id: tenant.id,
  }

  const { error } = await supabase.from('products').insert(productData)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/admin/products')
}
