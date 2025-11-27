'use client'

import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLogin() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '/profile'

  const submit = () => {
    const ok = login(username.trim(), password.trim())
    if (ok) {
      // 登录成功，重定向到目标页面
      router.push(redirect)
    } else {
      setError('用户名或密码错误')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-black/30 rounded-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-6">管理登录</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">用户名</label>
              <input value={username} onChange={e => setUsername(e.target.value)} type="text" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">密码</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="flex gap-3 pt-2">
              <button onClick={submit} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">登录</button>
              <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg">返回主页</Link>
            </div>
            <div className="text-gray-400 text-sm">登录成功后将跳转至：{redirect}</div>
            <div className="text-purple-400 text-sm mt-2">默认用户名：admin，密码：admin123</div>
          </div>
        </div>
      </section>
    </div>
  )
}
