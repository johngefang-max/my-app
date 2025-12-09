export const metadata = {
  title: '服务条款 | imageto3d',
  description: 'imageto3d 服务条款',
}
export const dynamic = 'force-static'

import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-purple-700/40 p-8">
          <h1 className="text-3xl font-bold text-white">服务条款</h1>
          <p className="mt-2 text-slate-400">最后更新：2025年12月9日</p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>欢迎使用 imageto3d。使用本服务即表示您同意以下条款和条件。</p>

            <h2 className="text-xl font-semibold text-white">1. 服务接受</h2>
            <p>通过访问或使用 imageto3d 服务，您同意受本服务条款约束。如果您不同意这些条款，请不要使用我们的服务。</p>

            <h2 className="text-xl font-semibold text-white">2. 服务描述</h2>
            <p>imageto3d 是一个基于人工智能的平台，允许用户根据文本描述、图像或草图生成 3D 模型。我们的服务包括：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>文本到 3D 生成</li>
              <li>图像到 3D 转换</li>
              <li>草图到 3D 建模</li>
              <li>3D 模型编辑和优化</li>
              <li>3D 模型库和展示</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">3. 用户账户</h2>
            <p>使用某些服务功能需要创建账户。您同意：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>提供准确、完整且最新的信息</li>
              <li>负责维护账户信息的机密性</li>
              <li>对您账户下的所有活动承担责任</li>
              <li>立即通知我们任何未经授权的使用</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">4. 积分系统</h2>
            <p>我们的服务使用积分系统进行资源管理：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>新用户注册获得 10 积分奖励</li>
              <li>每日登录获得 5 积分奖励</li>
              <li>每次 3D 模型生成消耗 3 积分</li>
              <li>推荐新用户获得 10 积分奖励</li>
              <li>积分不可转让或兑换现金</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">5. 付费计划</h2>
            <p>我们提供免费和付费两种计划：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>免费计划：</strong>每月 10 次生成，基本模型质量</li>
              <li><strong>专业计划：</strong>每月 100 次生成，高质量模型，优先处理</li>
              <li>付费通过第三方支付处理商进行</li>
              <li>订阅可随时取消</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">6. 可接受使用政策</h2>
            <p>您同意不会：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>违反任何适用的法律法规</li>
              <li>生成非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容</li>
              <li>侵犯他人的知识产权</li>
              <li>干扰或破坏服务的运行</li>
              <li>试图未经授权访问我们的系统或他人账户</li>
              <li>使用服务进行垃圾邮件、网络钓鱼或其他恶意活动</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">7. 知识产权</h2>
            <p><strong>您的内容：</strong>您保留对上传或生成内容的所有权。通过使用我们的服务，您授予我们存储、处理和显示您内容的权利，仅限于提供服务所需。</p>
            <p><strong>我们的内容：</strong>imageto3d 的所有内容、功能和服务均受知识产权法保护，归我们或我们的许可方所有。</p>

            <h2 className="text-xl font-semibold text-white">8. 服务可用性</h2>
            <p>我们努力确保服务的持续可用性，但不保证：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>服务将始终可用或不中断</li>
              <li>生成的 3D 模型满足您的期望</li>
              <li>服务满足您的特定要求</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">9. 免责声明</h2>
            <p>本服务按"现状"提供，不提供任何明示或暗示的保证。我们不对以下情况承担责任：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>服务的准确性、可靠性或可用性</li>
              <li>因使用服务造成的任何损失或损害</li>
              <li>生成 3D 模型的质量或适用性</li>
              <li>任何第三方内容的准确性或合法性</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">10. 责任限制</h2>
            <p>在法律允许的最大范围内，我们对因使用服务而产生的任何间接、偶然、特殊或后果性损害概不负责。我们的总责任不超过您在过去 90 天内为服务支付的费用。</p>

            <h2 className="text-xl font-semibold text-white">11. 条款变更</h2>
            <p>我们可能会不时更新这些条款。重大变更将通过电子邮件或网站通知提前 30 天通知您。继续使用服务即表示您接受更新的条款。</p>

            <h2 className="text-xl font-semibold text-white">12. 终止</h2>
            <p>我们可能因以下原因暂停或终止您的账户：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>违反本条款</li>
              <li>长期不活跃账户</li>
              <li>法律或监管要求</li>
              <li>业务需要</li>
            </ul>
            <p>您也可以随时删除您的账户。终止后，您可能无法访问某些内容或数据。</p>

            <h2 className="text-xl font-semibold text-white">13. 争议解决</h2>
            <p>如果您与我们发生争议，我们建议首先通过以下方式友好解决：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>联系我们的客户支持团队</li>
              <li>提供详细的问题描述</li>
              <li>在合理时间内允许我们回应</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">14. 联系我们</h2>
            <p>如果您对本服务条款有任何疑问，请通过以下方式联系我们：</p>
            <p>电子邮件：<a href="mailto:johngefang@gmail.com" className="text-purple-400 hover:text-purple-300">johngefang@gmail.com</a></p>
            <p>我们将在收到您的询问后尽快回复。</p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link href="/zh/privacy" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">查看隐私政策</Link>
            <Link href="/zh" className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">返回首页</Link>
          </div>
        </div>
      </section>
    </main>
  )
}