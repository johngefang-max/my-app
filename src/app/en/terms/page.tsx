export const metadata = {
  title: 'Terms of Service | imageto3d',
  description: 'imageto3d Terms of Service',
}
export const dynamic = 'force-static'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-purple-700/40 p-8">
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="mt-2 text-slate-400">Last updated: December 9, 2025</p>

          <div className="mt-8 space-y-6 text-slate-300 leading-7">
            <p>Welcome to imageto3d. By using our service, you agree to these Terms and Conditions.</p>

            <h2 className="text-xl font-semibold text-white">1. Acceptance of Service</h2>
            <p>By accessing or using the imageto3d service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

            <h2 className="text-xl font-semibold text-white">2. Service Description</h2>
            <p>imageto3d is an AI-powered platform that allows users to generate 3D models from text descriptions, images, or sketches. Our services include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Text to 3D generation</li>
              <li>Image to 3D conversion</li>
              <li>Sketch to 3D modeling</li>
              <li>3D model editing and optimization</li>
              <li>3D model gallery and showcase</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
            <p>Creating an account is required to access certain features of our service. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain the confidentiality of your account information</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">4. Points System</h2>
            <p>Our service uses a points system for resource management:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>New users receive 10 points upon registration</li>
              <li>Daily login grants 5 points</li>
              <li>Each 3D model generation consumes 3 points</li>
              <li>Referring new users earns 10 points</li>
              <li>Points are non-transferable and non-refundable</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">5. Paid Plans</h2>
            <p>We offer both free and paid subscription plans:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Free Plan:</strong> 10 generations per month, basic model quality</li>
              <li><strong>Pro Plan:</strong> 100 generations per month, high-quality models, priority processing</li>
              <li>Payments are processed through third-party payment processors</li>
              <li>Subscriptions can be canceled at any time</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">6. Acceptable Use Policy</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to our systems or others' accounts</li>
              <li>Use the service for spam, phishing, or other malicious activities</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">7. Intellectual Property</h2>
            <p><strong>Your Content:</strong> You retain ownership of content you upload or generate. By using our service, you grant us permission to store, process, and display your content solely for the purpose of providing the service.</p>
            <p><strong>Our Content:</strong> All content, features, and functionality of imageto3d are owned by us or our licensors and are protected by intellectual property laws.</p>

            <h2 className="text-xl font-semibold text-white">8. Service Availability</h2>
            <p>We strive to maintain continuous service availability but do not guarantee:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The service will always be available or uninterrupted</li>
              <li>Generated 3D models will meet your expectations</li>
              <li>The service will meet your specific requirements</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">9. Disclaimer</h2>
            <p>The service is provided "as is" without any express or implied warranties. We are not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The accuracy, reliability, or availability of the service</li>
              <li>Any loss or damage resulting from use of the service</li>
              <li>The quality or fitness of generated 3D models</li>
              <li>The accuracy or legality of third-party content</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our service. Our total liability shall not exceed the amount you paid for the service in the past 90 days.</p>

            <h2 className="text-xl font-semibold text-white">11. Changes to Terms</h2>
            <p>We may update these terms from time to time. Material changes will be communicated to you at least 30 days in advance via email or website notice. Continued use of the service constitutes acceptance of the updated terms.</p>

            <h2 className="text-xl font-semibold text-white">12. Termination</h2>
            <p>We may suspend or terminate your account for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Violation of these terms</li>
              <li>Extended periods of inactivity</li>
              <li>Legal or regulatory requirements</li>
              <li>Business needs</li>
            </ul>
            <p>You may also delete your account at any time. Upon termination, you may lose access to certain content or data.</p>

            <h2 className="text-xl font-semibold text-white">13. Dispute Resolution</h2>
            <p>If you have a dispute with us, we first recommend attempting to resolve it amicably by:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Contacting our customer support team</li>
              <li>Providing a detailed description of the issue</li>
              <li>Allowing us a reasonable time to respond</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">14. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <p>Email: <a href="mailto:johngefang@gmail.com" className="text-purple-400 hover:text-purple-300">johngefang@gmail.com</a></p>
            <p>We will respond to your inquiry as soon as possible.</p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link href="/en/privacy" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">View Privacy Policy</Link>
            <Link href="/en" className="px-4 py-2 rounded-lg border border-purple-500 text-white hover:bg-purple-600">Return Home</Link>
          </div>
        </div>
      </section>
    </main>
  )
}