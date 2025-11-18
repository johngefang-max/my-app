'use client'

import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useState } from 'react'

export default function LoginModal() {
  const { isLoginOpen, closeLogin, login } = useAuth()
  const { language } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const title = language === 'zh' ? '登录账户' : 'Sign In'
  const emailLabel = language === 'zh' ? '邮箱' : 'Email'
  const passwordLabel = language === 'zh' ? '密码' : 'Password'
  const loginText = language === 'zh' ? '登录' : 'Login'
  const cancelText = language === 'zh' ? '取消' : 'Cancel'

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
            <div>
              <label className="block text-sm text-gray-300 mb-2">{emailLabel}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">{passwordLabel}</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={login} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                {loginText}
              </button>
              <button onClick={closeLogin} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg">
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}