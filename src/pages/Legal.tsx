import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, FileText, Shield, Mail } from 'lucide-react';

const Legal = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Scale size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl industrial-title mb-2">
            Legal <span className="text-primary">Information</span>
          </h1>
          <p className="text-muted-foreground">
            Terms of Service, Privacy Policy, and other legal documents
          </p>
        </div>

        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="terms" className="gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Terms of Service</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield size={16} />
              <span className="hidden sm:inline">Privacy Policy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Mail size={16} />
              <span>Contact</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms">
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>
              <p className="text-sm text-muted-foreground mb-4">Last updated: January 2026</p>
              
              <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
                <section>
                  <h3 className="text-foreground font-medium mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using the Hinjd Aggs application ("Service"), you accept and agree to be bound 
                    by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">2. Description of Service</h3>
                  <p>
                    Hinjd Aggs provides conveyor belt diagnostic tools and BeltSaver® technology information 
                    for aggregate and mining operations. The Service includes free and subscription-based features.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">3. User Accounts</h3>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and 
                    for all activities that occur under your account. You must provide accurate information 
                    when creating an account.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">4. Subscriptions and Payments</h3>
                  <p>
                    Paid subscriptions are billed on a recurring basis. You may cancel at any time, and 
                    cancellation will take effect at the end of the current billing period. Refunds are 
                    available within 7 days of purchase.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">5. Intellectual Property</h3>
                  <p>
                    BeltSaver® is a registered trademark of Hinjd Global. All content, features, and 
                    functionality of the Service are owned by Hinjd Global and protected by intellectual 
                    property laws.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">6. Limitation of Liability</h3>
                  <p>
                    The diagnostic recommendations provided by the Service are for informational purposes 
                    only. Hinjd Global is not liable for any damages resulting from the use or inability 
                    to use the Service.
                  </p>
                </section>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
              <p className="text-sm text-muted-foreground mb-4">Last updated: January 2026</p>
              
              <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
                <section>
                  <h3 className="text-foreground font-medium mb-2">1. Information We Collect</h3>
                  <p>
                    We collect information you provide directly, including email address, name, and 
                    diagnostic data entered into the Service. We also collect usage data and device 
                    information automatically.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">2. How We Use Your Information</h3>
                  <p>
                    We use your information to provide and improve the Service, process payments, 
                    send communications about your account, and analyze usage patterns to enhance 
                    user experience.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">3. Data Storage and Security</h3>
                  <p>
                    Your data is stored securely using industry-standard encryption. We implement 
                    appropriate technical and organizational measures to protect your personal information 
                    against unauthorized access or disclosure.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">4. Third-Party Services</h3>
                  <p>
                    We use third-party services for payment processing (Stripe) and authentication. 
                    These services have their own privacy policies governing the use of your information.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">5. Your Rights</h3>
                  <p>
                    You have the right to access, correct, or delete your personal data. You can 
                    request a copy of your data or account deletion by contacting us.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-foreground font-medium mb-2">6. Data Retention</h3>
                  <p>
                    We retain your data for as long as your account is active or as needed to provide 
                    the Service. Diagnostic history is retained for 2 years unless you request deletion.
                  </p>
                </section>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  If you have questions about these legal documents or need assistance, 
                  please contact us through the following channels:
                </p>
                
                <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="font-medium mb-1">Email</p>
                    <a href="mailto:legal@hinjdglobal.com" className="text-primary hover:underline">
                      legal@hinjdglobal.com
                    </a>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="font-medium mb-1">General Inquiries</p>
                    <a href="mailto:info@hinjdglobal.com" className="text-primary hover:underline">
                      info@hinjdglobal.com
                    </a>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="font-medium mb-1">Business Address</p>
                    <p className="text-muted-foreground">
                      Hinjd Global<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  We aim to respond to all inquiries within 2-3 business days.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Legal;
