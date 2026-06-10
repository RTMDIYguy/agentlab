import { PageLayout } from "@/components/PageLayout";
export default function Privacy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 9, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              AgentLab ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Personal Data:</strong> Name, email address, phone number, billing address, and other information you voluntarily provide</li>
              <li><strong>Payment Information:</strong> Credit card details processed securely through Stripe (we do not store full card numbers)</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time spent on pages, and referral sources</li>
              <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers</li>
              <li><strong>Communication Data:</strong> Messages, feedback, and support inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">We use the information we collect for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and send related information</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To analyze usage patterns and improve user experience</li>
              <li>To comply with legal obligations and enforce our agreements</li>
              <li>To prevent fraud and enhance security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-3">We may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our website and conducting our business (e.g., payment processors, hosting providers)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Right to Access:</strong> You can request access to your personal data</li>
              <li><strong>Right to Correction:</strong> You can request correction of inaccurate data</li>
              <li><strong>Right to Deletion:</strong> You can request deletion of your data (subject to legal obligations)</li>
              <li><strong>Right to Opt-Out:</strong> You can opt out of marketing communications</li>
              <li><strong>Right to Data Portability:</strong> You can request a copy of your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience. For detailed information about our use of cookies, please see our Cookies Policy. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Third-Party Links</h2>
            <p className="text-muted-foreground">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-card rounded-lg border border-border">
              <p className="text-foreground font-medium">AgentLab</p>
              <p className="text-muted-foreground">Email: privacy@agentlab.com</p>
              <p className="text-muted-foreground">Website: www.agentlab.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
