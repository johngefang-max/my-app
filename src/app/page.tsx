'use client'

import { ArrowRight, Star, Zap, Shield, Image as ImageIcon, Box, Globe, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import DotGridBackground from './components/DotGridBackground'
import ModelViewer from './components/ModelViewer'
import { useLanguage } from './contexts/LanguageContext'
import { useAuth } from './contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { language, setLanguage, t } = useLanguage()
  const { isAuthenticated, user, openLogin } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [imgError, setImgError] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const heroSrc = (process.env.NEXT_PUBLIC_HERO_IMAGE_URL as string) || '/alis.png'
  const go = (path: string) => {
    router.push(path)
  }

  // 处理 Creem 支付
  const handleCreemPayment = async () => {
    console.log('Creem payment button clicked')
    console.log('Authentication status:', isAuthenticated)
    console.log('User data:', user)

    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, redirecting to login')
      // 重定向到登录页面
      router.push('/auth?redirect=/')
      return
    }

    setLoadingPayment(true)

    try {
      console.log('Creating payment request for user:', user.email)

      // Use relative path for API request
      const response = await fetch('/api/payments/creem/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: 'pro_monthly'
        })
      })

      console.log('Payment API response status:', response.status)

      const data = await response.json()
      console.log('Payment API response data:', data)

      if (response.ok && data.success && data.paymentUrl) {
        // 重定向到 Creem 支付页面
        console.log('Redirecting to payment URL:', data.paymentUrl)
        window.location.href = data.paymentUrl
      } else {
        console.error('Payment creation failed:', data)
        if (data.requiresReauth) {
          // User needs to re-authenticate with Google
          if (confirm(data.details || 'Please log out and log back in with your Google account to continue.')) {
            // Redirect to home with logout
            window.location.href = '/?logout=1'
          }
        } else {
          alert(data.error || data.details || 'Failed to create payment. Please try again.')
        }
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      alert('Payment service is currently unavailable. Please try again later.')
    } finally {
      setLoadingPayment(false)
    }
  }

  // 检查用户是否已经是 Pro 用户
  const isProUser = user?.plan && (user.plan === 'pro_monthly' || user.plan === 'pro_yearly')

  useEffect(() => {
    // no modal login; use /auth route for authentication
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <DotGridBackground />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">
            {t('home.title')}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('home.title.highlight')}
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => go('/generator')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>{t('home.startCreating')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          
          
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">95%</div>
              <div className="text-gray-400 text-sm sm:text-base">{t('home.accuracy')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">&lt;30s</div>
              <div className="text-gray-400 text-sm sm:text-base">{t('home.generationTime')}</div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-amber-800/50 via-amber-700/40 to-rose-700/40 border border-white/10">
              <span className="absolute -top-6 -left-4 text-6xl font-black text-amber-400">1</span>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white/80" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('home.features.step1.title')}</h3>
              <p className="text-gray-300 mb-6">{t('home.features.step1.desc')}</p>
              <div className="mt-4 relative rounded-xl bg-black/40 border border-white/10 p-4">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-7 h-7 rounded-lg bg-lime-500/90 flex items-center justify-center">+</div>
                  <div className="text-sm">{t('home.features.step1.helper')}</div>
                </div>
              </div>
            </div>

            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-lime-800/50 via-lime-700/40 to-emerald-700/40 border border-white/10">
              <span className="absolute -top-6 -left-4 text-6xl font-black text-lime-400">2</span>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white/80" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('home.features.step2.title')}</h3>
              <p className="text-gray-300 mb-6">{t('home.features.step2.desc')}</p>
              <div className="mt-2">
                <button className="bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg">{t('home.features.step2.button')}</button>
              </div>
            </div>

            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-800/50 via-fuchsia-700/40 to-indigo-700/40 border border-white/10">
              <span className="absolute -top-6 -left-4 text-6xl font-black text-purple-400">3</span>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white/80" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('home.features.step3.title')}</h3>
              <p className="text-gray-300 mb-6">{t('home.features.step3.desc')}</p>
              <div className="mt-2">
                <button className="bg-teal-500 text-black font-semibold px-4 py-2 rounded-lg">{t('home.features.step3.button')}</button>
              </div>
            </div>

            <div className="md:col-span-3 grid md:grid-cols-2 gap-8 mt-4 items-center">
              <div>
                <div className="flex items-center gap-2 text-lime-400 mb-3">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm">{t('home.features.speed.label')}</span>
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">{t('home.features.speed.title')}</div>
                <p className="text-gray-300 mb-6">{t('home.features.speed.desc')}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-900/40 border border-pink-500/20 text-pink-200">{t('home.features.speed.tag')}</div>
              </div>
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-fuchsia-800/30">
                <div className="relative h-[24rem] md:h-[30rem]">
                  {!imgError && (
                    <Image src={heroSrc} alt="showcase" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" onError={() => setImgError(true)} style={{ objectPosition: '60% 20%' }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section - hidden per request */}
      {false && (
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
              <div className="aspect-square bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative overflow-hidden">
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
              <div className="aspect-square bg-gradient-to-br from-fuchsia-900/50 to-purple-900/50 relative overflow-hidden">
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
      )}

      {/* User Reviews Section - hidden per request */}
      {false && (
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
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full border border-white/10">
                  <Image src="/avatars/avatar-1.jpg" alt="avatar" width={48} height={48} className="w-full h-full" />
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
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full border border-white/10">
                  <Image src="/avatars/avatar-2.jpg" alt="avatar" width={48} height={48} className="w-full h-full" />
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
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full border border-white/10">
                  <Image src="/avatars/avatar-3.jpg" alt="avatar" width={48} height={48} className="w-full h-full" />
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
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full border border-white/10">
                  <Image src="/avatars/avatar-4.jpg" alt="avatar" width={48} height={48} className="w-full h-full" />
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
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full border border-white/10">
                  <Image src="/avatars/avatar-5.jpg" alt="avatar" width={48} height={48} className="w-full h-full" />
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
                <div className="w-12 h-12 mr-4 overflow-hidden rounded-full border border-white/10">
                  <Image src="/avatars/avatar-6.jpg" alt="avatar" width={48} height={48} className="w-full h-full" />
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
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t('home.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <button
                onClick={() => router.push('/generator')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                {t('home.cta.freeTrial')}
              </button>
            ) : isProUser ? (
              <button
                onClick={() => go('/generator')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <span>{language === 'zh' ? '开始使用 Pro 功能' : 'Use Pro Features'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleCreemPayment}
                disabled={loadingPayment}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                {loadingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{language === 'zh' ? '处理中...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'zh' ? '升级到 Pro - $9.99/月' : 'Upgrade to Pro - $9.99/month'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
            <button onClick={() => go('/pricing')} className="border border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              {t('home.cta.viewPricing')}
            </button>
          </div>  
        </div>
      </section>

      
      
    </div>
  )
}
