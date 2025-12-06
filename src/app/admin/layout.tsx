import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser, createClient } from '@/lib/supabase/server'
import ToastHandler from '@/components/admin/ToastHandler'
import { Suspense } from 'react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware에서 이미 인증 체크를 하므로, 여기서는 사용자 정보만 가져옴
  const user = await getUser()

  // /admin/login 페이지는 Middleware에서 제외되므로, user가 없으면 로그인 페이지
  if (!user) {
    return <>{children}</>
  }

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      {/* Admin Header */}
      <header className="bg-[#1a1a1a] text-white shadow-lg">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin/products" className="text-xl font-bold">
                Admin Panel
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/admin/products"
                  className="text-sm hover:text-gray-300 transition-colors"
                >
                  제품 관리
                </Link>
                <Link
                  href="/admin/categories"
                  className="text-sm hover:text-gray-300 transition-colors"
                >
                  카테고리 관리
                </Link>
                <Link
                  href="/admin/inquiries"
                  className="text-sm hover:text-gray-300 transition-colors"
                >
                  문의 관리
                </Link>
                <Link
                  href="/"
                  className="text-sm hover:text-gray-300 transition-colors"
                  target="_blank"
                >
                  사이트 보기
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{user.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
