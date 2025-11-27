'use client'

import { Box, Globe, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  showLogo?: boolean
  logoText?: string
  logoIcon?: React.ReactNode
  showBackButton?: boolean
  onBackClick?: () => void
}

export default function Header({
  showLogo = true,
  logoText = 'AI3D Pro',
  logoIcon = <Box className="h-8 w-8 text-purple-400" />,
  showBackButton = false,
  onBackClick
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage()
  const sessionHook = useSession()
  const session = sessionHook?.data
  const status = sessionHook?.status ?? 'unauthenticated'
  const isAuthenticated = !!session
  const authLoading = status === 'loading'
  const { openLogin } = useAuth()
  const [avatarError, setAvatarError] = useState(false)
  const router = useRouter()

  const go = (path: string) => {
    if (isAuthenticated) {
      router.push(path)
    } else {
      openLogin()
    }
  }

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button onClick={handleBack} className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>{t('common.back')}</span>
              </button>
            )}
            {showLogo && (
              <Link href="/" className="flex items-center space-x-2">
                {logoIcon}
                <span className="text-2xl font-bold text-white">{logoText}</span>
              </Link>
            )}
          </div>

          <nav className="hidden md:flex space-x-8">
            <button onClick={() => go('/generator')} className="text-gray-300 hover:text-white transition-colors">{t('nav.product')}</button>
            <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">{t('nav.browseWorks')}</Link>
            <button onClick={() => go('/pricing')} className="text-gray-300 hover:text-white transition-colors">{t('nav.pricing')}</button>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">{t('nav.help')}</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
            </button>
            {authLoading ? null : (
              isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                      <Image src={(avatarError ? '/avatars/avatar-1.jpg' : (session?.user?.image ?? '/avatars/avatar-1.jpg'))} alt="avatar" width={32} height={32} className="w-full h-full" onError={() => setAvatarError(true)} />
                    </div>
                    <span className="text-sm font-medium">{session?.user?.name ?? 'User'}</span>
                  </Link>
                  <button onClick={() => signOut()} className="px-3 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600 transition-colors text-sm">
                {t('nav.logout')}
              </button>
                </div>
              ) : (
                <>
                  <button onClick={openLogin} className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600 transition-colors">
                    {t('nav.login')}
                  </button>
                  <button onClick={() => router.push('/generator')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                    {t('nav.startTrial')}
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
