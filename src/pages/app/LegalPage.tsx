import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, FileText, Scale, Mail } from 'lucide-react';

const LegalPage = () => {
  return (
    <AppLayout title="Legal">
      <div className="p-4 space-y-6">
        <div className="text-center py-4">
          <Scale className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-semibold">Legal Information</h2>
          <p className="text-sm text-muted-foreground">
            Privacy, terms, and policies
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="privacy" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-primary" />
                <span>Privacy Policy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4">
              <p>
                <strong>Last updated: January 2026</strong>
              </p>
              <p>
                Aggregate Tools ("we", "our", or "us") is committed to protecting your privacy. 
                This policy explains how we collect, use, and safeguard your information.
              </p>
              
              <h4 className="font-medium text-foreground">Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account information (email, name) when you register</li>
                <li>Usage data including calculations and equipment preferences</li>
                <li>Device information for app optimization</li>
              </ul>

              <h4 className="font-medium text-foreground">How We Use Your Information</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide and improve our services</li>
                <li>To sync your data across devices (Pro users)</li>
                <li>To send important service updates</li>
              </ul>

              <h4 className="font-medium text-foreground">Data Storage</h4>
              <p>
                Free users: Data is stored locally on your device.
                Pro/Enterprise: Data is securely stored in cloud servers with encryption.
              </p>

              <h4 className="font-medium text-foreground">Your Rights</h4>
              <p>
                You can request deletion of your account and data at any time by contacting support.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="terms" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-400" />
                <span>Terms of Service</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4">
              <p>
                <strong>Last updated: January 2026</strong>
              </p>
              <p>
                By using Aggregate Tools, you agree to these terms.
              </p>

              <h4 className="font-medium text-foreground">Use of Service</h4>
              <p>
                Aggregate Tools provides calculation and troubleshooting tools for aggregate operations. 
                Results are estimates and should be verified by qualified professionals.
              </p>

              <h4 className="font-medium text-foreground">Account Responsibilities</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep your login credentials secure</li>
                <li>Provide accurate information</li>
                <li>Use the service for lawful purposes only</li>
              </ul>

              <h4 className="font-medium text-foreground">Limitation of Liability</h4>
              <p>
                We provide tools for estimation and guidance. We are not liable for decisions 
                made based on app outputs. Always consult with qualified engineers for critical operations.
              </p>

              <h4 className="font-medium text-foreground">Subscriptions</h4>
              <p>
                Paid subscriptions are billed monthly. You can cancel anytime. 
                Refunds are provided pro-rata for annual plans only.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="disclaimer" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Scale size={18} className="text-yellow-400" />
                <span>Disclaimer</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4">
              <p>
                The calculations and recommendations provided by Aggregate Tools are for 
                informational and estimation purposes only.
              </p>
              <p>
                <strong>Not Professional Advice:</strong> This app does not replace professional 
                engineering advice. All outputs should be verified by qualified personnel 
                before implementation.
              </p>
              <p>
                <strong>No Warranty:</strong> We provide the service "as is" without warranties 
                of any kind, either express or implied.
              </p>
              <p>
                <strong>Equipment Safety:</strong> Always follow manufacturer guidelines and 
                safety protocols when operating crushing and screening equipment.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Contact Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail size={18} />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>For legal inquiries or data requests:</p>
            <p className="text-primary mt-1">legal@aggregatetools.com</p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground py-4">
          © 2026 Aggregate Tools. All rights reserved.
        </p>
      </div>
    </AppLayout>
  );
};

export default LegalPage;
