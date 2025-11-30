'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Coins } from 'lucide-react'

export default function ProfilePage() {
  const sessionHook = useSession()
  const session = sessionHook?.data
  const name = session?.user?.name ?? '未登录用户'
  const [avatarError, setAvatarError] = useState(false)
  const avatar = avatarError ? '/avatars/avatar-1.jpg' : (session?.user?.image ?? '/avatars/avatar-1.jpg')

  const [works, setWorks] = useState<{ id: string; title: string; href: string }[]>([])
  const [transactions, setTransactions] = useState<{ id: string; date: string; item: string; amount: number }[]>([])
  const [points, setPoints] = useState(0)
  const [pointsHistory, setPointsHistory] = useState<Array<{ id: string; amount: number; type: string; description: string; created_at: string; balance_before: number; balance_after: number }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [w, t, p, ph] = await Promise.all([
          fetch('/api/me/works').then(r => r.json()),
          fetch('/api/me/transactions').then(r => r.json()),
          fetch('/api/me/points').then(r => r.json()),
          fetch('/api/me/points/history').then(r => r.json()),
        ])
        if (Array.isArray(w.items)) setWorks(w.items)
        if (Array.isArray(t.items)) setTransactions(t.items)
        if (typeof p.points === 'number') setPoints(p.points)
        if (Array.isArray(ph.items)) setPointsHistory(ph.items)
      } catch {}
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-400" /> 积分</h2>
                <div className="text-3xl font-bold text-yellow-400">{points}</div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">积分流水</h2>
                <ul className="space-y-3">
                  {pointsHistory.map((t) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-white">{t.description} <span className="text-xs text-gray-400">({t.type})</span></div>
                        <div className="text-gray-500 text-sm">{new Date(t.created_at).toLocaleString()}</div>
                        <div className="text-gray-500 text-xs">{t.balance_before} → {t.balance_after}</div>
                      </div>
                      <div className={t.amount >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {t.amount >= 0 ? '+' : ''}{t.amount}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">支付流水</h2>
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
