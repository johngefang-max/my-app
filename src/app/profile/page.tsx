'use client'

import Header from '../components/Header'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? '未登录用户'
  const [avatarError, setAvatarError] = useState(false)
  const avatar = avatarError ? '/avatars/avatar-1.jpg' : (session?.user?.image ?? '/avatars/avatar-1.jpg')

  const [works, setWorks] = useState<{ id: string; title: string; href: string }[]>([])
  const [transactions, setTransactions] = useState<{ id: string; date: string; item: string; amount: number }[]>([])
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0)

  useEffect(() => {
    const load = async () => {
      try {
        const w = await fetch('/api/me/works').then(r => r.json())
        const t = await fetch('/api/me/transactions').then(r => r.json())
        if (Array.isArray(w.items)) setWorks(w.items)
        if (Array.isArray(t.items)) setTransactions(t.items)
      } catch {}
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10">
              <Image src={avatar} alt="avatar" width={64} height={64} className="w-full h-full" onError={() => setAvatarError(true)} />
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{name}</div>
              <div className="text-gray-400">个人主页</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">个人作品</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {works.map(w => (
                    <a key={w.id} href={w.href} className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-all">
                      <div className="text-white font-medium mb-2">{w.title}</div>
                      <div className="text-gray-500 text-sm">ID: {w.id}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-2">账户余额</h2>
                <div className="text-3xl font-bold text-green-400">¥ {balance.toFixed(2)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">消费记录</h2>
                <ul className="space-y-3">
                  {transactions.map((t, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div>
                        <div className="text-white">{t.item}</div>
                        <div className="text-gray-500 text-sm">{t.date}</div>
                      </div>
                      <div className={t.amount >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
