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
          <h1 className="text-3xl font-bold text-white">隐私政策</h1>
          <p className="mt-2 text-slate-400">最后更新：2025年12月9日</p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>本隐私政策说明 imageto3d 如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本政策中描述的做法。</p>

            <h2 className="text-xl font-semibold text-white">1. 我们收集的信息</h2>
            <p>我们可能收集以下类型的信息：</p>

            <h3 className="text-lg font-semibold text-white mt-4">账户信息</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>电子邮箱地址</li>
              <li>第三方登录信息（如 Google）</li>
              <li>用户名和显示名称</li>
              <li>个人资料信息（可选）</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">使用数据</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>访问的页面和功能</li>
              <li>使用时间和持续时间</li>
              <li>生成的 3D 模型数量和类型</li>
              <li>操作日志和错误报告</li>
              <li>设备信息和浏览器类型</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">内容数据</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>上传的图像和草图</li>
              <li>文本描述和提示词</li>
              <li>生成的 3D 模型文件</li>
              <li>模型元数据和设置</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">支付信息</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>订阅计划详情</li>
              <li>支付历史（由第三方处理商存储）</li>
              <li>积分使用记录</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">2. 信息使用方式</h2>
            <p>我们使用收集的信息用于：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>提供服务：</strong>处理您的请求，生成 3D 模型，管理您的账户</li>
              <li><strong>改进服务：</strong>分析使用模式，优化功能，提升用户体验</li>
              <li><strong>客户支持：</strong>回应您的问题，提供技术支持</li>
              <li><strong>安全保障：</strong>防止欺诈，确保服务安全</li>
              <li><strong>法律合规：</strong>遵守适用的法律法规</li>
              <li><strong>营销沟通：</strong>发送产品更新和促销信息（可随时退订）</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">3. 信息共享</h2>
            <p>我们不会出售您的个人信息。我们仅在以下情况下共享信息：</p>

            <h3 className="text-lg font-semibold text-white mt-4">服务提供商</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>云服务提供商（数据存储和处理）</li>
              <li>支付处理商（处理订阅和支付）</li>
              <li>分析服务提供商（匿名使用统计）</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">法律要求</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>响应法律传票、法院命令或其他法律要求</li>
              <li>保护我们的权利、财产或安全</li>
              <li>防止欺诈或违法行为</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">4. 数据安全</h2>
            <p>我们采取多层安全措施保护您的信息：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>数据传输使用 SSL/TLS 加密</li>
              <li>数据库加密和访问控制</li>
              <li>定期安全审计和漏洞扫描</li>
              <li>员工保密协议和访问限制</li>
              <li>安全备份和灾难恢复计划</li>
            </ul>
            <p>但请注意，没有网络传输或存储方法是 100% 安全的。</p>

            <h2 className="text-xl font-semibold text-white">5. Cookies 和跟踪技术</h2>
            <p>我们使用 Cookies 和类似技术来：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>保持您的登录状态</li>
              <li>记住您的偏好设置</li>
              <li>分析网站使用情况</li>
              <li>提供个性化体验</li>
            </ul>
            <p>您可以通过浏览器设置管理或禁用 Cookies，但这可能影响某些功能的正常使用。</p>

            <h2 className="text-xl font-semibold text-white">6. 数据保留</h2>
            <p>我们保留您的数据时间如下：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>账户信息：在账户有效期内及之后合理时间内</li>
              <li>使用数据：通常保留 24 个月</li>
              <li>3D 模型文件：根据您的订阅计划，免费账户 30 天，付费账户 1 年</li>
              <li>删除后数据：在法律允许的范围内，30 天内永久删除</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">7. 您的权利</h2>
            <p>根据适用的隐私法律，您有权：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>访问：</strong>获取我们持有的关于您的个人信息副本</li>
              <li><strong>更正：</strong>更新不准确或不完整的信息</li>
              <li><strong>删除：</strong>要求删除您的个人信息</li>
              <li><strong>限制处理：</strong>限制我们处理您的信息</li>
              <li><strong>数据可移植性：</strong>以结构化格式获取您的数据</li>
              <li><strong>反对：</strong>反对我们基于合法利益处理您的信息</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">8. 国际数据传输</h2>
            <p>我们的服务器可能位于您所在国家以外的地区。当您的数据跨境传输时，我们确保：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>实施适当的数据保护措施</li>
              <li>遵守适用的数据传输法律</li>
              <li>使用标准合同条款或其他法律机制</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">9. 儿童隐私</h2>
            <p>我们的服务不面向 13 岁以下的儿童。我们不会故意收集儿童的个人信息。如果我们发现收集了儿童信息，我们会立即删除。</p>

            <h2 className="text-xl font-semibold text-white">10. 隐私政策更新</h2>
            <p>我们可能会不时更新本隐私政策。重大变更将通过以下方式通知您：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>在网站上发布通知</li>
              <li>发送电子邮件通知</li>
              <li>在应用内显示通知</li>
            </ul>
            <p>继续使用我们的服务即表示您接受更新后的隐私政策。</p>

            <h2 className="text-xl font-semibold text-white">11. 联系我们</h2>
            <p>如果您对本隐私政策或我们的隐私实践有任何疑问，请联系我们：</p>
            <p>电子邮件：<a href="mailto:johngefang@gmail.com" className="text-purple-400 hover:text-purple-300">johngefang@gmail.com</a></p>
            <p>我们将尽快回复您的隐私相关问题。</p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link href="/zh/terms" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">查看服务条款</Link>
            <Link href="/zh" className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">返回首页</Link>
          </div>
        </div>
      </section>
    </main>
  )
}