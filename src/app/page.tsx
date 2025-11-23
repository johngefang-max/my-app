'use client'

import { ArrowRight, Star, Zap, Shield, Image as ImageIcon, Box, Globe } from 'lucide-react'
import Image from 'next/image'
import DotGridBackground from './components/DotGridBackground'
import Header from './components/Header'
import { useLanguage } from './contexts/LanguageContext'
import { useAuth } from './contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginModal from './components/LoginModal'

export default function Home() {
  const { language, setLanguage, t } = useLanguage()
  const { openLogin, requireAuth, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [imgError, setImgError] = useState(false)
  const heroSrc = (process.env.NEXT_PUBLIC_HERO_IMAGE_URL as string) || '/hero-sword.png'
  const go = (path: string) => {
    if (isAuthenticated) {
      router.push(path)
    } else {
      const url = new URL(window.location.href)
      url.searchParams.set('auth_required', '1')
      url.searchParams.set('redirect', path)
      router.replace(url.pathname + '?' + url.searchParams.toString())
      openLogin()
    }
  }
  
  useEffect(() => {
    if (!isAuthenticated && searchParams.get('auth_required') === '1') {
      openLogin()
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete('auth_required')
        window.history.replaceState(null, '', url.toString())
      } catch {}
    }
  }, [isAuthenticated, searchParams, openLogin])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <DotGridBackground />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {t('home.title')}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('home.title.highlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => go('/generator')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>{t('home.startCreating')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          
          
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-gray-400">{t('home.activeUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1M+</div>
              <div className="text-gray-400">{t('home.generatedModels')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-gray-400">{t('home.accuracy')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">&lt;30s</div>
              <div className="text-gray-400">{t('home.generationTime')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-gray-300">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 rounded-2xl border border-purple-500/20">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('home.feature1.title')}</h3>
              <p className="text-gray-300 mb-6">{t('home.feature1.desc')}</p>
              <ul className="text-gray-400 space-y-2">
                <li>• {t('home.feature1.bullet1')}</li>
                <li>• {t('home.feature1.bullet2')}</li>
                <li>• {t('home.feature1.bullet3')}</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-2xl border border-blue-500/20">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('home.feature2.title')}</h3>
              <p className="text-gray-300 mb-6">{t('home.feature2.desc')}</p>
              <ul className="text-gray-400 space-y-2">
                <li>• {t('home.feature2.bullet1')}</li>
                <li>• {t('home.feature2.bullet2')}</li>
                <li>• {t('home.feature2.bullet3')}</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-8 rounded-2xl border border-green-500/20">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('home.feature3.title')}</h3>
              <p className="text-gray-300 mb-6">{t('home.feature3.desc')}</p>
              <ul className="text-gray-400 space-y-2">
                <li>• {t('home.feature3.bullet1')}</li>
                <li>• {t('home.feature3.bullet2')}</li>
                <li>• {t('home.feature3.bullet3')}</li>
              </ul>
            </div>

            <div className="md:col-span-3 relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 p-6">
              <div className="relative h-80 md:h-[28rem]">
                {!imgError && (
                  <Image src={heroSrc} alt="AI generated fantasy sword" fill priority sizes="(min-width:768px) 100vw, 100vw" className="object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.55)]" onError={() => setImgError(true)} />
                )}
                <div className="absolute left-6 bottom-6 w-64 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-xl shadow-2xl p-4 pointer-events-auto" onClick={() => go('/generator')}>
                  <div className="flex items-center gap-2 text-white/90 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/90 flex items-center justify-center">+</div>
                    <div className="text-sm">拖拽/粘贴图片</div>
                  </div>
                  <button className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 rounded-lg">生成</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.portfolio.title')}</h2>
            <p className="text-xl text-gray-300 mb-8">{t('home.portfolio.subtitle')}</p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors">
                {t('home.portfolio.category.all')}
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                {t('home.portfolio.category.character')}
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                {t('home.portfolio.category.architecture')}
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                {t('home.portfolio.category.product')}
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                {t('home.portfolio.category.art')}
              </button>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Portfolio Case 1 */}
            <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-pink-900/50 relative overflow-hidden">
                {/* Image placeholder - you can add actual images here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-purple-600 w-24 h-24 rounded-2xl transform rotate-12 flex items-center justify-center">
                    <div className="text-white text-4xl">👤</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    {t('home.portfolio.viewProject')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-sm">
                    {t('home.portfolio.case1.category')}
                  </span>
                  <span className="text-gray-400 text-sm">{t('home.portfolio.case1.time')}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('home.portfolio.case1.title')}</h3>
                <p className="text-gray-300 text-sm">{t('home.portfolio.case1.desc')}</p>
              </div>
            </div>

            {/* Portfolio Case 2 */}
            <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-blue-900/50 to-cyan-900/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-blue-600 w-24 h-24 rounded-lg flex items-center justify-center">
                    <div className="text-white text-4xl">🏢</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    {t('home.portfolio.viewProject')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                    {t('home.portfolio.case2.category')}
                  </span>
                  <span className="text-gray-400 text-sm">{t('home.portfolio.case2.time')}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('home.portfolio.case2.title')}</h3>
                <p className="text-gray-300 text-sm">{t('home.portfolio.case2.desc')}</p>
              </div>
            </div>

            {/* Portfolio Case 3 */}
            <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-green-900/50 to-emerald-900/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-green-600 w-24 h-24 rounded-full flex items-center justify-center">
                    <div className="text-white text-4xl">🎧</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    {t('home.portfolio.viewProject')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-lg text-sm">
                    {t('home.portfolio.case3.category')}
                  </span>
                  <span className="text-gray-400 text-sm">{t('home.portfolio.case3.time')}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('home.portfolio.case3.title')}</h3>
                <p className="text-gray-300 text-sm">{t('home.portfolio.case3.desc')}</p>
              </div>
            </div>

            {/* Portfolio Case 4 */}
            <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-orange-900/50 to-red-900/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-orange-600 w-24 h-24 transform rotate-45 flex items-center justify-center">
                    <div className="text-white text-4xl">🎨</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    {t('home.portfolio.viewProject')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded-lg text-sm">
                    {t('home.portfolio.case4.category')}
                  </span>
                  <span className="text-gray-400 text-sm">{t('home.portfolio.case4.time')}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('home.portfolio.case4.title')}</h3>
                <p className="text-gray-300 text-sm">{t('home.portfolio.case4.desc')}</p>
              </div>
            </div>

            {/* Portfolio Case 5 */}
            <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-indigo-600 w-24 h-24 rounded-lg flex items-center justify-center">
                    <div className="text-white text-4xl">🤖</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    {t('home.portfolio.viewProject')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-sm">
                    {t('home.portfolio.case5.category')}
                  </span>
                  <span className="text-gray-400 text-sm">{t('home.portfolio.case5.time')}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('home.portfolio.case5.title')}</h3>
                <p className="text-gray-300 text-sm">{t('home.portfolio.case5.desc')}</p>
              </div>
            </div>

            {/* Portfolio Case 6 */}
            <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-teal-900/50 to-cyan-900/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-teal-600 w-24 h-16 rounded-lg flex items-center justify-center">
                    <div className="text-white text-4xl">🪑</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    {t('home.portfolio.viewProject')}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-teal-600/20 text-teal-400 px-3 py-1 rounded-lg text-sm">
                    {t('home.portfolio.case6.category')}
                  </span>
                  <span className="text-gray-400 text-sm">{t('home.portfolio.case6.time')}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('home.portfolio.case6.title')}</h3>
                <p className="text-gray-300 text-sm">{t('home.portfolio.case6.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.reviews.title')}</h2>
            <p className="text-xl text-gray-300 mb-8">{t('home.reviews.subtitle')}</p>

            {/* Trust Badge */}
            <div className="flex items-center justify-center space-x-8 mb-12">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white font-semibold">{t('home.reviews.averageRating')}</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-white font-semibold">{t('home.reviews.totalUsers')} {t('home.reviews.trustBadge')}</div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {t('home.reviews.user1.name').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{t('home.reviews.user1.name')}</h4>
                    <span className="text-yellow-400 font-semibold">{t('home.reviews.user1.rating')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t('home.reviews.user1.role')}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{t('home.reviews.user1.comment')}</p>
              <p className="text-gray-500 text-sm">{t('home.reviews.user1.date')}</p>
            </div>

            {/* Review 2 */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {t('home.reviews.user2.name').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{t('home.reviews.user2.name')}</h4>
                    <span className="text-yellow-400 font-semibold">{t('home.reviews.user2.rating')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t('home.reviews.user2.role')}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{t('home.reviews.user2.comment')}</p>
              <p className="text-gray-500 text-sm">{t('home.reviews.user2.date')}</p>
            </div>

            {/* Review 3 */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {t('home.reviews.user3.name').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{t('home.reviews.user3.name')}</h4>
                    <span className="text-yellow-400 font-semibold">{t('home.reviews.user3.rating')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t('home.reviews.user3.role')}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{t('home.reviews.user3.comment')}</p>
              <p className="text-gray-500 text-sm">{t('home.reviews.user3.date')}</p>
            </div>

            {/* Review 4 */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {t('home.reviews.user4.name').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{t('home.reviews.user4.name')}</h4>
                    <span className="text-yellow-400 font-semibold">{t('home.reviews.user4.rating')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t('home.reviews.user4.role')}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{t('home.reviews.user4.comment')}</p>
              <p className="text-gray-500 text-sm">{t('home.reviews.user4.date')}</p>
            </div>

            {/* Review 5 */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {t('home.reviews.user5.name').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{t('home.reviews.user5.name')}</h4>
                    <span className="text-yellow-400 font-semibold">{t('home.reviews.user5.rating')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t('home.reviews.user5.role')}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{t('home.reviews.user5.comment')}</p>
              <p className="text-gray-500 text-sm">{t('home.reviews.user5.date')}</p>
            </div>

            {/* Review 6 */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {t('home.reviews.user6.name').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{t('home.reviews.user6.name')}</h4>
                    <span className="text-yellow-400 font-semibold">{t('home.reviews.user6.rating')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t('home.reviews.user6.role')}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{t('home.reviews.user6.comment')}</p>
              <p className="text-gray-500 text-sm">{t('home.reviews.user6.date')}</p>
            </div>
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors">
              {t('home.reviews.loadMore')}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t('home.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <button onClick={() => router.push('/generator')} className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                {t('home.cta.freeTrial')}
              </button>
            )}
            <button onClick={() => go('/pricing')} className="border border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              {t('home.cta.viewPricing')}
            </button>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-6 text-gray-300">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>{t('home.footer.support')}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Box className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">AI3D Pro</span>
              </div>
              <p className="text-gray-400">{t('home.subtitle')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('nav.product')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => go('/generator')} className="hover:text-white">{t('home.feature2.title')}</button></li>
                <li><button onClick={() => go('/generator')} className="hover:text-white">{t('home.feature1.title')}</button></li>
                <li><button onClick={openLogin} className="hover:text-white">{t('nav.api')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footer.company')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('home.footer.aboutUs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('home.footer.careers')}</a></li>
                <li><a href="#" className="hover:text-white">{t('home.footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footer.support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('home.footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white">{t('home.footer.community')}</a></li>
                <li><a href="#" className="hover:text-white">{t('home.footer.status')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI3D Pro. {t('home.footer.rights')}</p>
          </div>
        </div>
      </footer>
      <LoginModal />
    </div>
  )
}