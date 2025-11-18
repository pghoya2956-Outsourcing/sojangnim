import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/server'
import NewProductForm from '@/components/admin/NewProductForm'

export default async function NewProductPage() {
  const { authorized } = await requireAdmin()

  if (!authorized) {
    redirect('/admin/login')
  }

  return <NewProductForm />
}
