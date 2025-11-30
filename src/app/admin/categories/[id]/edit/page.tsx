import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient, requireAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface Props {
  params: Promise<{ id: string }>
}

async function getCategory(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function updateCategory(formData: FormData) {
  'use server'
  await requireAdmin()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  if (!id || !name || !slug) {
    redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent('모든 필드를 입력해주세요'))
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    if (error.code === '23505') {
      redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent('이미 존재하는 슬러그입니다'))
    }
    redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent('카테고리 수정에 실패했습니다'))
  }

  revalidatePath('/admin/categories')
  revalidatePath('/products')
  redirect('/admin/categories?success=' + encodeURIComponent('카테고리가 수정되었습니다'))
}

export default async function EditCategoryPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-[800px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/categories"
          className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
        >
          ← 카테고리 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4">카테고리 수정</h1>
        <p className="text-[#666] mt-1">"{category.name}" 카테고리 정보를 수정합니다.</p>
      </div>

      {/* Form */}
      <form action={updateCategory} className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-8">
        <input type="hidden" name="id" value={category.id} />

        <div className="space-y-6">
          {/* 카테고리 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              카테고리 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={category.name}
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
              placeholder="예: 전동공구"
            />
          </div>

          {/* 슬러그 */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              슬러그 (URL용) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              defaultValue={category.slug}
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
              placeholder="예: power-tools"
            />
            <p className="mt-2 text-sm text-[#666]">
              URL에 사용되는 영문 식별자입니다. 기존 링크가 깨질 수 있으니 변경 시 주의하세요.
            </p>
          </div>

          {/* 생성일 (읽기 전용) */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              생성일
            </label>
            <input
              type="text"
              disabled
              value={new Date(category.created_at).toLocaleString('ko-KR')}
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg bg-[#f7f7f7] text-[#666]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e5e5e5]">
          <Link
            href="/admin/categories"
            className="px-6 py-3 text-[#666] hover:text-[#1a1a1a] transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="bg-[#1a1a1a] text-white px-8 py-3 rounded-lg hover:bg-[#333] transition-colors"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  )
}
