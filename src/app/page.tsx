'use client'

import { ArrowRight, Star, Zap, Shield, Image as ImageIcon, Box, Globe } from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import { useAuth } from './contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoginModal from './components/LoginModal'

export default function Home() {
  const { language, setLanguage, t } = useLanguage()
  const { openLogin, requireAuth } = useAuth()
  const router = useRouter()
  const go = (path: string) => requireAuth(() => router.push(path))
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Box className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">AI3D Pro</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => go('/generator')} className="text-gray-300 hover:text-white transition-colors">{t('nav.product')}</button>
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
              <button onClick={openLogin} className="text-gray-300 hover:text-white transition-colors">{t('nav.login')}</button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                {t('nav.startTrial')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
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
          
          {/* Stats */}
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
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.showcase.title')}</h2>
            <p className="text-xl text-gray-300">{t('home.showcase.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Box className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">{t('home.showcase.card1.title')}</h4>
              <p className="text-gray-300">{t('home.showcase.card1.desc')}</p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Box className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">{t('home.showcase.card2.title')}</h4>
              <p className="text-gray-300">{t('home.showcase.card2.desc')}</p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Box className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">{t('home.showcase.card3.title')}</h4>
              <p className="text-gray-300">{t('home.showcase.card3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.testimonials.title')}</h2>
            <p className="text-xl text-gray-300">{t('home.testimonials.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">“{t('home.testimonials.quote1')}”</p>
              <div className="text-white font-semibold">{t('home.testimonials.name1')}</div>
              <div className="text-gray-400 text-sm">{t('home.testimonials.role1')}</div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">“{t('home.testimonials.quote2')}”</p>
              <div className="text-white font-semibold">{t('home.testimonials.name2')}</div>
              <div className="text-gray-400 text-sm">{t('home.testimonials.role2')}</div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">“{t('home.testimonials.quote3')}”</p>
              <div className="text-white font-semibold">{t('home.testimonials.name3')}</div>
              <div className="text-gray-400 text-sm">{t('home.testimonials.role3')}</div>
            </div>
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
            <button onClick={() => go('/generator')} className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              {t('home.cta.freeTrial')}
            </button>
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