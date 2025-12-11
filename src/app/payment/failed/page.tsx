'use client'

import { XCircle, RefreshCw, ArrowLeft, Headphones, Mail } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'
import { useState } from 'react'

export default function PaymentFailed() {
  const { language, setLanguage, t } = useLanguage()
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = () => {
    setRetryCount(retryCount + 1)
    // In a real implementation, you might redirect to payment again
    // or retry the payment using a stored payment intent
    window.location.href = '/pricing'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Failure Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gray-700 text-center">
            {/* Failure Icon */}
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-white" />
            </div>

            {/* Failure Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'zh' ? '支付失败' : 'Payment Failed'}
            </h1>

            <p className="text-gray-300 text-lg mb-8">
              {language === 'zh'
                ? '很抱歉，您的支付未能成功完成。请不要担心，您的账户未产生任何费用。'
                : 'We\'re sorry, but your payment couldn\'t be completed successfully. Don\'t worry, your account hasn\'t been charged.'
              }
            </p>

            {/* Possible Reasons */}
            <div className="bg-red-900/20 rounded-lg p-6 mb-8 border border-red-700/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                {language === 'zh' ? '可能的原因' : 'Possible Reasons'}
              </h2>

              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-gray-300">
                    {language === 'zh'
                      ? '银行拒绝了此次交易'
                      : 'The transaction was declined by your bank'
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-gray-300">
                    {language === 'zh'
                      ? '支付信息输入有误'
                      : 'Incorrect payment information was entered'
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-gray-300">
                    {language === 'zh'
                      ? '网络连接问题导致支付中断'
                      : 'Network connectivity issues interrupted the payment'
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-gray-300">
                    {language === 'zh'
                      ? '支付处理超时'
                      : 'Payment processing timeout'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* What to do next */}
            <div className="bg-blue-900/20 rounded-lg p-6 mb-8 border border-blue-700/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                {language === 'zh' ? '接下来该怎么做？' : 'What to do next?'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="text-gray-300 block text-left">
                      {language === 'zh'
                        ? '检查您的支付信息是否正确'
                        : 'Check if your payment information is correct'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="text-gray-300 block text-left">
                      {language === 'zh'
                        ? '联系您的银行确认交易限制'
                        : 'Contact your bank to confirm transaction limits'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="text-gray-300 block text-left">
                      {language === 'zh'
                        ? '稍后重试支付'
                        : 'Try the payment again after a short while'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>
                  {language === 'zh'
                    ? retryCount === 0 ? '重新尝试支付' : `再次重试 (${retryCount})`
                    : retryCount === 0 ? 'Retry Payment' : `Retry Again (${retryCount})`
                  }
                </span>
              </button>

              <Link
                href="/pricing"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{language === 'zh' ? '返回价格页面' : 'Back to Pricing'}</span>
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-gray-400 mb-4">
                {language === 'zh'
                  ? '如果问题持续存在，我们的支持团队随时为您服务。'
                  : 'If the problem persists, our support team is here to help.'
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
                ? '如果您的账户被意外扣费，请立即联系我们的客服团队。'
                : 'If you were accidentally charged, please contact our customer service team immediately.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}