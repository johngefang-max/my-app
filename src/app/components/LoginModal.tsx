'use client'

import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuth()
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  const title = language === 'zh' ? '使用 Google 登录' : 'Sign in with Google'
  const googleText = language === 'zh' ? '使用 Google 登录' : 'Sign in with Google'
  const cancelText = language === 'zh' ? '取消' : 'Cancel'
  const redirect = searchParams.get('redirect') || '/'
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXTAUTH_URL as string) || ''
  const callbackUrl = `${origin}${redirect.startsWith('/') ? redirect : '/'}`

  if (!isLoginOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeLogin} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white text-xl font-semibold">{title}</h3>
            <button onClick={closeLogin} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="pt-2">
              <button onClick={() => signIn('google', { callbackUrl })} className="w-full bg-white text-slate-900 hover:bg-gray-100 px-4 py-2 rounded-lg">
                {googleText}
              </button>
            </div>
            <div className="pt-2">
              <button onClick={closeLogin} className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg">
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}