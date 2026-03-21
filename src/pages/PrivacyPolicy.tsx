import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | HINJD Global</title>
        <meta name="description" content="Privacy Policy for HINJD Global - how we collect, use, and protect your data." />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
              <p>
                HINJD Global ("we", "our", or "us") operates the HINJD Global mobile application and website. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our application.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
              <h3 className="text-base font-medium text-foreground mt-3">Personal Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and email address when you create an account</li>
                <li>Payment information when you subscribe to a paid plan (processed securely by Stripe)</li>
                <li>Profile information you choose to provide</li>
              </ul>
              <h3 className="text-base font-medium text-foreground mt-3">Usage Data</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Equipment diagnostics and calculation history</li>
                <li>App usage patterns and feature interactions</li>
                <li>Device information (device type, operating system, app version)</li>
                <li>Log data (IP address, access times, pages viewed)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, operate, and maintain our services</li>
                <li>To improve and personalize your experience</li>
                <li>To process transactions and manage subscriptions</li>
                <li>To send service-related communications and updates</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To detect, prevent, and address technical issues or fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Data Storage and Security</h2>
              <p>
                Your data is stored on secure cloud servers with industry-standard encryption. 
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
              <p>We may use the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Stripe</strong> — for payment processing</li>
                <li><strong>Google Analytics</strong> — for usage analytics</li>
                <li><strong>AI Services</strong> — for equipment diagnostics and content generation</li>
              </ul>
              <p>These services have their own privacy policies governing the use of your information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. 
                We may share information only in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or law enforcement requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability — receive your data in a structured format</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">8. Children's Privacy</h2>
              <p>
                Our service is not directed to individuals under 13. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected 
                such data, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or wish to exercise your data rights, 
                please contact us at:
              </p>
              <p className="text-primary font-medium">legal@hinjdglobal.com</p>
            </section>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-12">
            © 2026 HINJD Global. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
