import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-slate-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <Card className="shadow-xl border-purple-200/60">
          <CardContent className="p-6 md:p-10 space-y-6 text-slate-700">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Privacy Policy for AuraEye™</h1>
              <p><strong>Effective Date:</strong> May 5, 2026</p>
              <p><strong>Website:</strong> <a className="text-purple-600 underline" href="https://auraeye.in" target="_blank" rel="noreferrer">https://auraeye.in</a></p>
              <p><strong>Contact Email:</strong> admin@auraeyesolutions.com</p>
            </div>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
              <p>AuraEye™ is committed to protecting your privacy and ensuring transparency in how your information is handled.</p>
              <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">2. Information We Collect</h2>
              <p><strong>a. Personal Information</strong></p>
              <ul className="list-disc ml-6">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
              </ul>
              <p><strong>b. Device and Technical Information</strong></p>
              <ul className="list-disc ml-6">
                <li>Device type and operating system</li>
                <li>Unique device identifiers</li>
                <li>IP address</li>
                <li>App usage data</li>
              </ul>
              <p><strong>c. Camera Access</strong></p>
              <p>Camera access is used only when required and with your explicit permission.</p>
              <p><strong>d. Usage Data</strong></p>
              <p>We collect information about how you interact with the app, including pages visited, session duration, and features used.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">3. How We Use Your Information</h2>
              <ul className="list-disc ml-6">
                <li>To create and manage your account</li>
                <li>To connect you with certified energy healing practitioners</li>
                <li>To facilitate remote healing sessions</li>
                <li>To improve app performance and user experience</li>
                <li>To communicate updates and support</li>
                <li>To ensure security and prevent misuse</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">4. Third-Party Services</h2>
              <p>We use third-party services such as Google Analytics to understand user behavior and improve our services.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">5. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal data. We may share information only with service providers, to comply with legal obligations, or to protect rights, safety, and platform integrity.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">6. Data Security</h2>
              <p>We implement reasonable safeguards to protect your data. However, no method of transmission over the internet is completely secure.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">7. Children’s Privacy</h2>
              <p>AuraEye™ is not directed to children under the age of 13.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">8. Your Rights</h2>
              <ul className="list-disc ml-6">
                <li>Access your data</li>
                <li>Request correction</li>
                <li>Request deletion</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">9. Data Retention</h2>
              <p>We retain data only as long as necessary to provide services and comply with legal obligations.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy periodically. Updates will be posted on this page with a revised effective date.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">11. Contact Us</h2>
              <p>Email: admin@auraeyesolutions.com</p>
              <p>Website: <a className="text-purple-600 underline" href="https://auraeye.in" target="_blank" rel="noreferrer">https://auraeye.in</a></p>
            </section>
          </CardContent>
        </Card>
      </main>
      {user && <MobileNavigation />}
    </div>
  );
}