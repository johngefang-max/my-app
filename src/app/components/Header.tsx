'use client'

import { Box, Globe, ArrowLeft } from 'lucide-react'
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
  const { isAuthenticated, logout, openLogin } = useAuth()
  const router = useRouter()

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
              <a href="/" className="flex items-center space-x-2">
                {logoIcon}
                <span className="text-2xl font-bold text-white">{logoText}</span>
              </a>
            )}
          </div>

          <nav className="hidden md:flex space-x-8">
            <button onClick={() => go('/generator')} className="text-gray-300 hover:text-white transition-colors">{t('nav.product')}</button>
            <a href="/gallery" className="text-gray-300 hover:text-white transition-colors">{t('nav.browseWorks')}</a>
            <button onClick={() => go('/pricing')} className="text-gray-300 hover:text-white transition-colors">{t('nav.pricing')}</button>
            <button onClick={() => openLogin()} className="text-gray-300 hover:text-white transition-colors">{t('nav.api')}</button>
            <button onClick={() => openLogin()} className="text-gray-300 hover:text-white transition-colors">{t('nav.help')}</button>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
            </button>
            {isAuthenticated ? (
              <button onClick={logout} className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600 transition-colors">
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <button onClick={openLogin} className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600 transition-colors">
                  {t('nav.login')}
                </button>
                <button onClick={() => router.push('/generator')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                  {t('nav.startTrial')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}