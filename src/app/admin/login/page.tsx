import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/server'
import ToastHandler from '@/components/admin/ToastHandler'
import { Suspense } from 'react'

export default async function AdminLoginPage() {
  async function login(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    // Supabase Auth 로그인
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      redirect('/admin/login?error=' + encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다'))
    }

    // Admin 권한 확인
    const isAdminUser = await isAdmin(email)

    if (!isAdminUser) {
      // Admin이 아니면 로그아웃
      await supabase.auth.signOut()
      redirect('/admin/login?error=' + encodeURIComponent('관리자 권한이 없는 계정입니다'))
    }

    redirect('/admin/products')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      <div className="bg-white p-8 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">
          Admin Login
        </h1>

        <form action={login} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#1a1a1a] mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#1a1a1a] mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a1a1a] text-white px-6 py-3 rounded-md hover:bg-black transition-colors font-semibold"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666]">
          Admin 계정이 필요합니다
        </p>
      </div>
    </div>
  )
}
