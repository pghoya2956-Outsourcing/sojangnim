'use server'

import { requireAdmin, getServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProduct(productId: string, formData: FormData) {
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

  const productData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseInt(formData.get('price') as string),
    category_id: (formData.get('category_id') as string) || null,
    badge: (formData.get('badge') as string) || null,
    specs,
    image_url: (formData.get('image_url') as string) || null,
  }

  // 테넌트 검증 후 업데이트
  const { error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .eq('tenant_id', tenant.id)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/admin/products')
}
