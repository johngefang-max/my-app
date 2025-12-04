export const metadata = {
  title: '服务条款 | imageto3d',
  description: 'imageto3d 服务条款',
}
export const dynamic = 'force-static'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-purple-700/40 p-8">
          <h1 className="text-3xl font-bold text-white">服务条款</h1>
          <p className="mt-2 text-slate-400">最后更新：2025-11-27</p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>欢迎使用 imageto3d。使用本服务即表示你同意以下条款。</p>

            <h2 className="text-xl font-semibold text-white">1. 账户与资格</h2>
            <p>你须保证提供的注册信息真实、准确、完整，并在信息变更时及时更新。我们有权因违反条款或法律法规而暂停或终止账户。</p>

            <h2 className="text-xl font-semibold text-white">2. 费用与支付</h2>
            <p>本服务支持通过第三方支付完成购买。你同意支付处理方的相关条款与隐私政策。</p>

            <h2 className="text-xl font-semibold text-white">3. 退款政策</h2>
            <p>除非法律要求或我们明确承诺，已支付的费用通常不予退款。若对扣费有异议，请在扣费后7日内联系我们。</p>

            <h2 className="text-xl font-semibold text-white">4. 使用规范</h2>
            <p>不得利用本服务从事违法违规、侵权、恶意攻击、绕过限制、滥用接口等行为。</p>

            <h2 className="text-xl font-semibold text-white">5. 知识产权</h2>
            <p>本服务及其内容的相关权利归本服务或许可方所有。你保留对自行上传或生成内容的所有权，并授权我们为提供服务之必要进行存储和处理。</p>

            <h2 className="text-xl font-semibold text白">6. 免责声明与责任限制</h2>
            <p>本服务按现状提供，不作适销性或特定用途适用性的保证。对因使用或无法使用本服务产生的损失，我们的总责任不超过你在造成损失前90日内向我们支付的费用总额。</p>

            <h2 className="text-xl font-semibold text-white">7. 条款变更</h2>
            <p>我们可能不时更新本条款。继续使用本服务即视为同意变更后的条款。</p>

            <h2 className="text-xl font-semibold text-white">8. 联系方式</h2>
            <p>如需协助或投诉，请联系 support@ai3d.pro。</p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link href="/privacy" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">查看隐私政策</Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">返回首页</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
