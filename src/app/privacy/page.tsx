export const metadata = {
  title: '隐私政策 | imageto3d',
  description: 'imageto3d 隐私政策',
}
export const dynamic = 'force-static'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-purple-700/40 p-8">
          <h1 className="text-3xl font-bold text白">隐私政策</h1>
          <p className="mt-2 text-slate-400">最后更新：2025-11-27</p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>本隐私政策解释我们收集哪些数据、如何使用与共享以及你的权利。</p>

            <h2 className="text-xl font-semibold text-white">1. 我们收集的信息</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>账户信息：邮箱、第三方登录标识。</li>
              <li>使用数据：访问页面、操作日志、设备与浏览器信息。</li>
              <li>支付相关：由第三方支付处理保存的交易标识与状态。</li>
              <li>内容数据：你上传或生成的模型与元数据。</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">2. 使用目的</h2>
            <p>用于提供与改进服务、账户管理、客服、安全与合规。</p>

            <h2 className="text-xl font-semibold text白">3. 第三方共享</h2>
            <p>必要情况下与支付处理方、云服务、分析工具共享，受合同或条款约束。</p>

            <h2 className="text-xl font-semibold text-white">4. Cookies</h2>
            <p>用于改善体验与统计分析。你可在浏览器中管理。</p>

            <h2 className="text-xl font-semibold text-white">5. 保留与删除</h2>
            <p>按实现目的所需时间保留，支持合法删除与导出请求。</p>

            <h2 className="text-xl font-semibold text白">6. 你的权利</h2>
            <p>访问、纠正、删除、撤回同意或拒绝特定处理。</p>

            <h2 className="text-xl font-semibold text-white">7. 国际传输</h2>
            <p>数据可能在不同国家的服务器之间传输与存储，我们采取适当安全措施。</p>

            <h2 className="text-xl font-semibold text-white">8. 安全</h2>
            <p>采用合理技术与组织措施保护数据，但无法保证绝对安全。</p>

            <h2 className="text-xl font-semibold text-white">9. 儿童隐私</h2>
            <p>不针对未成年人，若误收集请联系处理。</p>

            <h2 className="text-xl font-semibold text-white">10. 更新</h2>
            <p>可能不时更新本政策，重大变更将通知。</p>

            <h2 className="text-xl font-semibold text-white">11. 联系我们</h2>
            <p>privacy@ai3d.pro。</p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link href="/terms" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">查看服务条款</Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">返回首页</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
