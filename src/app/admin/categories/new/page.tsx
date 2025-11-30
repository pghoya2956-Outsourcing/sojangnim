import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient, requireAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  // 한글을 영문으로 변환하는 매핑
  const koreanToEnglish: Record<string, string> = {
    '전동공구': 'power-tools',
    '에어공구': 'air-tools',
    '측정기': 'measuring-tools',
    '용접장비': 'welding',
    '안전용품': 'safety',
    '수공구': 'hand-tools',
    '절삭공구': 'cutting-tools',
  }

  // 기존 매핑이 있으면 사용
  if (koreanToEnglish[text]) {
    return koreanToEnglish[text]
  }

  // 영문+숫자만 남기고 하이픈으로 연결
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function createCategory(formData: FormData) {
  'use server'
  await requireAdmin()

  const name = formData.get('name') as string
  let slug = formData.get('slug') as string

  if (!name) {
    redirect('/admin/categories/new?error=' + encodeURIComponent('카테고리 이름을 입력해주세요'))
  }

  // slug가 비어있으면 name으로부터 생성
  if (!slug) {
    slug = slugify(name)
  }

  const supabase = await createClient()

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
  })

  if (error) {
    console.error('Error creating category:', error)
    if (error.code === '23505') {
      redirect('/admin/categories/new?error=' + encodeURIComponent('이미 존재하는 카테고리 이름 또는 슬러그입니다'))
    }
    redirect('/admin/categories/new?error=' + encodeURIComponent('카테고리 생성에 실패했습니다'))
  }

  revalidatePath('/admin/categories')
  revalidatePath('/products')
  redirect('/admin/categories?success=' + encodeURIComponent('카테고리가 생성되었습니다'))
}

export default async function NewCategoryPage() {
  await requireAdmin()

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
        <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4">새 카테고리 추가</h1>
      </div>

      {/* Form */}
      <form action={createCategory} className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-8">
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
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
              placeholder="예: 전동공구"
            />
          </div>

          {/* 슬러그 */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              슬러그 (URL용)
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
              placeholder="예: power-tools (비워두면 자동 생성)"
            />
            <p className="mt-2 text-sm text-[#666]">
              URL에 사용될 영문 식별자입니다. 비워두면 이름을 기반으로 자동 생성됩니다.
            </p>
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
            카테고리 추가
          </button>
        </div>
      </form>
    </div>
  )
}
