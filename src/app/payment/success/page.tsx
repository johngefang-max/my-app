'use client'

import { CheckCircle, ArrowRight, Download, Headphones, Mail, Receipt } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccess() {
  const { language, setLanguage, t } = useLanguage()
  const { user, refreshUserData } = useAuth()
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  // 从 URL 参数获取支付信息
  const orderId = searchParams.get('order_id')
  const checkoutId = searchParams.get('checkout_id')
  const subscriptionId = searchParams.get('subscription_id')
  const plan = searchParams.get('plan')

  useEffect(() => {
    // 刷新用户数据以获取最新的订阅状态
    const loadData = async () => {
      if (refreshUserData) {
        await refreshUserData()
      }
      // 模拟检查支付状态
      setTimeout(() => {
        setLoading(false)
      }, 1500)
    }

    loadData()
  }, [refreshUserData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {language === 'zh' ? '正在确认支付状态...' : 'Confirming payment status...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gray-700 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'zh' ? '支付成功！' : 'Payment Successful!'}
            </h1>

            <p className="text-gray-300 text-lg mb-8">
              {language === 'zh'
                ? `恭喜您，${user?.email}！您已成功升级到 Pro 计划。`
                : `Congratulations, ${user?.email}! You've successfully upgraded to Pro plan.`
              }
            </p>

            {/* Order Information */}
            {(orderId || checkoutId) && (
              <div className="bg-gray-700/30 rounded-lg p-4 mb-8 border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  {language === 'zh' ? '订单信息' : 'Order Information'}
                </h3>
                {orderId && (
                  <p className="text-xs text-gray-500 mb-1">
                    {language === 'zh' ? '订单号: ' : 'Order ID: '}
                    <span className="font-mono text-gray-400">{orderId}</span>
                  </p>
                )}
                {subscriptionId && (
                  <p className="text-xs text-gray-500">
                    {language === 'zh' ? '订阅ID: ' : 'Subscription ID: '}
                    <span className="font-mono text-gray-400">{subscriptionId}</span>
                  </p>
                )}
              </div>
            )}

            {/* Plan Details */}
            <div className="bg-purple-900/30 rounded-lg p-6 mb-8 border border-purple-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                {language === 'zh' ? '您的 Pro 计划福利' : 'Your Pro Plan Benefits'}
              </h2>

              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">
                      {language === 'zh' ? '100 积分订阅奖励' : '100 points subscription bonus'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">
                      {language === 'zh' ? '无限模型生成' : 'Unlimited model generations'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">
                      {language === 'zh' ? '高质量模型输出' : 'High-quality model output'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">
                      {language === 'zh' ? '优先处理速度' : 'Priority processing speed'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">
                      {language === 'zh' ? '商业使用许可' : 'Commercial use license'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">
                      {language === 'zh' ? '优先客户支持' : 'Priority customer support'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Points Bonus Info */}
              <div className="mt-4 pt-4 border-t border-purple-700">
                <p className="text-purple-300">
                  {language === 'zh'
                    ? '🎁 您已获得 100 积分奖励，可用于生成更多模型！'
                    : '🎁 You have received 100 points bonus for generating more models!'
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/generator"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>{language === 'zh' ? '开始使用 Pro 功能' : 'Start Using Pro Features'}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/profile"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>{language === 'zh' ? '查看账户详情' : 'View Account Details'}</span>
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-gray-400 mb-4">
                {language === 'zh'
                  ? '需要帮助？我们的支持团队随时为您服务。'
                  : 'Need help? Our support team is here for you.'
                }
              </p>

              <div className="flex justify-center space-x-6">
                <a
                  href="mailto:support@imageto3d.com"
                  className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>support@imageto3d.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {language === 'zh'
                ? '收据已发送至您的邮箱。您可以随时在账户设置中管理您的订阅。'
                : 'A receipt has been sent to your email. You can manage your subscription anytime in your account settings.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}