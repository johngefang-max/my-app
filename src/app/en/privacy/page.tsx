export const metadata = {
  title: 'Privacy Policy | imageto3d',
  description: 'imageto3d Privacy Policy',
}
export const dynamic = 'force-static'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-purple-700/40 p-8">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-slate-400">Last updated: December 9, 2025</p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>This Privacy Policy explains how imageto3d collects, uses, stores, and protects your personal information. By using our service, you agree to the practices described in this policy.</p>

            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>We may collect the following types of information:</p>

            <h3 className="text-lg font-semibold text-white mt-4">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Email address</li>
              <li>Third-party login information (e.g., Google)</li>
              <li>Username and display name</li>
              <li>Profile information (optional)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Pages and features accessed</li>
              <li>Time and duration of use</li>
              <li>Number and type of 3D models generated</li>
              <li>Operation logs and error reports</li>
              <li>Device information and browser type</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">Content Data</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Uploaded images and sketches</li>
              <li>Text descriptions and prompts</li>
              <li>Generated 3D model files</li>
              <li>Model metadata and settings</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">Payment Information</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Subscription plan details</li>
              <li>Payment history (stored by third-party processors)</li>
              <li>Points usage records</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Provide Services:</strong> Process your requests, generate 3D models, manage your account</li>
              <li><strong>Improve Services:</strong> Analyze usage patterns, optimize features, enhance user experience</li>
              <li><strong>Customer Support:</strong> Respond to your inquiries, provide technical assistance</li>
              <li><strong>Security:</strong> Prevent fraud, ensure service safety</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
              <li><strong>Marketing Communications:</strong> Send product updates and promotional information (you can opt out anytime)</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">3. Information Sharing</h2>
            <p>We do not sell your personal information. We only share information in the following circumstances:</p>

            <h3 className="text-lg font-semibold text-white mt-4">Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Cloud service providers (data storage and processing)</li>
              <li>Payment processors (handle subscriptions and payments)</li>
              <li>Analytics service providers (anonymous usage statistics)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4">Legal Requirements</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Respond to legal subpoenas, court orders, or other legal requirements</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or illegal activities</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
            <p>We implement multiple layers of security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Database encryption and access controls</li>
              <li>Regular security audits and vulnerability scanning</li>
              <li>Employee confidentiality agreements and access restrictions</li>
              <li>Secure backups and disaster recovery plans</li>
            </ul>
            <p>However, please note that no method of transmission or storage is 100% secure.</p>

            <h2 className="text-xl font-semibold text-white">5. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Maintain your login status</li>
              <li>Remember your preferences</li>
              <li>Analyze website usage</li>
              <li>Provide personalized experiences</li>
            </ul>
            <p>You can manage or disable cookies through your browser settings, but this may affect some functionality.</p>

            <h2 className="text-xl font-semibold text-white">6. Data Retention</h2>
            <p>We retain your data for the following periods:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Account information: While the account is active and for a reasonable period thereafter</li>
              <li>Usage data: Typically 24 months</li>
              <li>3D model files: 30 days for free accounts, 1 year for paid accounts</li>
              <li>Deleted data: Permanently deleted within 30 days where legally permitted</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">7. Your Rights</h2>
            <p>Depending on applicable privacy laws, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Obtain a copy of your personal information we hold</li>
              <li><strong>Correct:</strong> Update inaccurate or incomplete information</li>
              <li><strong>Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Restrict Processing:</strong> Limit how we process your information</li>
              <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Object:</strong> Object to our processing based on legitimate interests</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">8. International Data Transfers</h2>
            <p>Our servers may be located in countries other than your own. When your data is transferred internationally, we ensure:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Appropriate data protection measures are in place</li>
              <li>Compliance with applicable data transfer laws</li>
              <li>Use of standard contractual clauses or other legal mechanisms</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">9. Children's Privacy</h2>
            <p>Our service is not directed at children under 13. We do not knowingly collect personal information from children. If we discover we have collected children's information, we will delete it immediately.</p>

            <h2 className="text-xl font-semibold text-white">10. Policy Updates</h2>
            <p>We may update this privacy policy from time to time. Material changes will be communicated through:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Posting a notice on our website</li>
              <li>Sending an email notification</li>
              <li>In-app notifications</li>
            </ul>
            <p>Continued use of our service indicates acceptance of the updated privacy policy.</p>

            <h2 className="text-xl font-semibold text-white">11. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
            <p>Email: <a href="mailto:johngefang@gmail.com" className="text-purple-400 hover:text-purple-300">johngefang@gmail.com</a></p>
            <p>We will respond to your privacy-related inquiries as soon as possible.</p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link href="/en/terms" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">View Terms of Service</Link>
            <Link href="/en" className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">Return Home</Link>
          </div>
        </div>
      </section>
    </main>
  )
}