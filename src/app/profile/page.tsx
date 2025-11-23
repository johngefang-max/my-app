'use client'

import Header from '../components/Header'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? '未登录用户'
  const [avatarError, setAvatarError] = useState(false)
  const avatar = avatarError ? '/avatars/avatar-01.jpeg' : (session?.user?.image ?? '/avatars/avatar-01.jpeg')

  const balance = 128.5
  const transactions = [
    { date: '2025-01-10', item: '生成模型（文本转3D）', amount: -2.0 },
    { date: '2025-01-08', item: '生成模型（图片转3D）', amount: -5.0 },
    { date: '2025-01-05', item: '账户充值', amount: 50.0 },
  ]

  const works = [
    { id: 'stylized-character', title: '风格化角色', href: '/gallery/stylized-character' },
    { id: 'modern-furniture-set', title: '现代家具套件', href: '/gallery/modern-furniture-set' },
    { id: 'sci-fi-drone', title: '科幻无人机', href: '/gallery/sci-fi-drone' },
    { id: 'jade-sculpture', title: '翡翠雕像', href: '/gallery/jade-sculpture' },
    { id: 'mech-armor', title: '机械战甲', href: '/gallery/mech-armor' },
    { id: 'furniture-set', title: '室内家具套装', href: '/gallery/furniture-set' },
  ]

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