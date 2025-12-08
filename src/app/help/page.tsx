'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { Search, BookOpen, LifeBuoy, FileQuestion, Mail } from 'lucide-react'

export default function HelpPage() {
  const { t, language } = useLanguage()
  return (
    <main className="min-h-screen bg-gray-900 pt-20">
      <section className="px-4 sm:px-6 lg:px-8 py-10 border-b border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('help.title')}</h1>
              <p className="text-gray-400">{t('help.subtitle')}</p>
            </div>
            <Link href={language === 'zh' ? '/zh/pricing' : '/en/pricing'} className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">
              {t('help.cta.viewPricing')}
            </Link>
          </div>
          <div className="relative">
            <input className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400" placeholder={t('help.searchPlaceholder')} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">{t('help.section.gettingStarted.title')}</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li>{t('help.section.gettingStarted.items.imageTo3D')}</li>
              <li>{t('help.section.gettingStarted.items.textTo3D')}</li>
              <li>{t('help.section.gettingStarted.items.export')}</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileQuestion className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">{t('help.section.faq.title')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-white font-medium mb-1">{t('help.faq.q1')}</div>
                <div className="text-gray-300 text-sm">{t('help.faq.a1')}</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">{t('help.faq.q2')}</div>
                <div className="text-gray-300 text-sm">{t('help.faq.a2')}</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">{t('help.faq.q3')}</div>
                <div className="text-gray-300 text-sm">{t('help.faq.a3')}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <LifeBuoy className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">{t('help.section.contact.title')}</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li>{t('help.contact.support')}</li>
              <li>{t('help.contact.email')}: support@ai3dpro.com</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/30 rounded-2xl border border-white/10 p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-lg font-semibold mb-1">{t('help.cta.title')}</div>
              <div className="text-gray-400">{t('help.cta.subtitle')}</div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={language === 'zh' ? '/zh/generator' : '/en/generator'} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                {t('help.cta.start')}
              </Link>
              <Link href={language === 'zh' ? '/zh/pricing' : '/en/pricing'} className="px-6 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">
                {t('help.cta.viewPricing')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
