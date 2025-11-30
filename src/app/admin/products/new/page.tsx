import { requireAdmin } from '@/lib/supabase/server'
import NewProductForm from '@/components/admin/NewProductForm'

export default async function NewProductPage() {
  await requireAdmin()
  return <NewProductForm />
}
