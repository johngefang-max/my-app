'use client'
import { useLanguage } from '../contexts/LanguageContext'

export default function ContactPage() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-gray-900 pt-20">
      <section className="px-4 sm:px-6 lg:px-8 py-10 border-b border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-3">{t('home.footer.contact')}</h1>
          <p className="text-gray-400">Email: johngefang@gmail.com</p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-gray-300">
          <p>We respond within 24 hours.</p>
        </div>
      </section>
    </main>
  )
}
