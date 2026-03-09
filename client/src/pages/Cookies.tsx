export default function Cookies() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Cookies Policy</h1>
          <p className="text-muted-foreground">Last updated: March 9, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small files of letters and numbers that we store on your browser or the hard drive of your computer. Cookies contain information that is transferred to your computer's hard drive. We use cookies to improve your experience on our website and to understand how you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Types of Cookies We Use</h2>
            <p className="text-muted-foreground mb-3">We use the following types of cookies on our website:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. Without these cookies, our website cannot function properly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Performance Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies collect information about how visitors use our website, such as which pages are visited most often, and whether visitors receive error messages. These cookies do not collect information that identifies a visitor. All information these cookies collect is aggregated and therefore anonymous.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Functionality Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies allow our website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features. These cookies can also be used to remember changes you have made to text size, fonts, and other parts of web pages that you can customize.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Targeting Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies collect information about your browsing habits in order to make advertising relevant to you and your interests. They remember that you have visited a website and this information is shared with other organizations such as advertisers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Session Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are temporary and expire when you close your browser. They are used to maintain your session and keep you logged in while you navigate our website.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-3">
              We may allow third-party service providers to place cookies on our website for the purposes of:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Analytics and tracking (Google Analytics)</li>
              <li>Payment processing (Stripe)</li>
              <li>Customer support and communication</li>
              <li>Advertising and marketing</li>
              <li>Social media integration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. How Long Do Cookies Last?</h2>
            <p className="text-muted-foreground mb-3">
              The duration of cookies varies depending on their type:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Session Cookies:</strong> Expire when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 1-2 years)</li>
              <li><strong>Authentication Cookies:</strong> Remain until you log out or for a specified period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Your Cookie Choices</h2>
            <p className="text-muted-foreground mb-3">
              You have the right to choose whether or not to accept cookies. However, please note that if you choose to refuse cookies, you may not be able to use the full functionality of our website. Here are your options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Browser Settings:</strong> You can control cookies through your browser settings. Most browsers allow you to refuse cookies and alert you when cookies are being sent</li>
              <li><strong>Opt-Out:</strong> You can opt out of certain third-party cookies by visiting the opt-out pages of the relevant service providers</li>
              <li><strong>Do Not Track:</strong> Some browsers include a "Do Not Track" feature. Our website currently does not respond to Do Not Track signals</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Cookie Management</h2>
            <p className="text-muted-foreground mb-3">
              To manage cookies in popular browsers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and other site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Specific Cookies We Use</h2>
            <p className="text-muted-foreground mb-3">
              Below is a list of specific cookies we use:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded border border-border">
                <p className="font-semibold text-foreground">Session Cookie</p>
                <p className="text-sm text-muted-foreground">Used to maintain your login session and user preferences</p>
              </div>
              <div className="p-3 bg-card rounded border border-border">
                <p className="font-semibold text-foreground">Analytics Cookie</p>
                <p className="text-sm text-muted-foreground">Used to track website usage and improve user experience</p>
              </div>
              <div className="p-3 bg-card rounded border border-border">
                <p className="font-semibold text-foreground">Preference Cookie</p>
                <p className="text-sm text-muted-foreground">Used to remember your preferences and settings</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Legal Basis for Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies based on the following legal grounds: (1) your consent, (2) performance of our contract with you, (3) compliance with legal obligations, and (4) our legitimate interests in improving our services and understanding user behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Changes to This Cookies Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-card rounded-lg border border-border">
              <p className="text-foreground font-medium">AgentLab</p>
              <p className="text-muted-foreground">Email: cookies@agentlab.com</p>
              <p className="text-muted-foreground">Website: www.agentlab.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
