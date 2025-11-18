import { redirect, notFound } from 'next/navigation'
import { requireAdmin, createClient } from '@/lib/supabase/server'
import EditProductForm from '@/components/admin/EditProductForm'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { authorized } = await requireAdmin()

  if (!authorized) {
    redirect('/admin/login')
  }

  const { id } = await params
  const supabase = await createClient()

  // 제품 데이터 로드
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (productError || !product) {
    notFound()
  }

  // 카테고리 로드
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return <EditProductForm product={product} categories={categories || []} />
}
