'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { signIn } from 'next-auth/react'
import { useStore } from '@/store/useStore'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useStore()

  if (isAuthenticated) {
    router.push('/gallery')
    return null
  }

  const redirect = searchParams.get('redirect') || '/gallery'
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXTAUTH_URL as string) || ''
  const callbackUrl = `${origin}${redirect.startsWith('/') ? redirect : '/gallery'}`

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-12 w-12 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">使用 Google 登录</h1>
          <p className="text-gray-400">仅支持 Google 账号登录</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-4">
          <Button
            variant="secondary"
            className="w-full bg-white text-slate-900 hover:bg-gray-100"
            onClick={() => signIn('google', { callbackUrl })}
          >
            使用 Google 登录
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/')}
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}
