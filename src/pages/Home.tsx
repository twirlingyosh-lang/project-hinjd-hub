import AppLayout from '@/components/AppLayout';
import { Link } from 'react-router-dom';
import { Calculator, Box, Wrench, History, Crown, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import heroImage from '@/assets/hero-beltsaver.jpg';
import beltCloseup from '@/assets/beltsaver-closeup.jpg';
import quarryAerial from '@/assets/quarry-aerial.jpg';

const quickLinks = [
  { path: '/calculator', label: 'Calculator', icon: Calculator, description: 'Run belt mistracking diagnostics' },
  { path: '/materials', label: 'Materials', icon: Box, description: 'Aggregate material properties' },
  { path: '/equipment', label: 'Equipment', icon: Wrench, description: 'Conveyor equipment database' },
  { path: '/saved-runs', label: 'Saved Runs', icon: History, description: 'View your diagnostic history' },
];

const Home = () => {
  const { user } = useAuth();
  const { hasAccess } = useSubscription();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="industrial-label mb-4">BeltSaver® Technology</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl industrial-title mb-6">
              Conveyor Belt <span className="text-primary">Diagnostics</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Professional-grade tools for aggregate operations. Diagnose belt mistracking, 
              optimize equipment, and maximize production efficiency.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/calculator">
                  <Calculator size={20} />
                  Start Diagnostic
                </Link>
              </Button>
              
              {!hasAccess && (
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/upgrade">
                    <Crown size={20} />
                    Upgrade Now
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="industrial-title text-2xl mb-8">Quick Access</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path}>
                <Card className="p-6 h-full hover:border-primary/50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {link.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* BeltSaver Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-2 gap-1">
            <div className="aspect-square overflow-hidden">
              <img 
                src={beltCloseup} 
                alt="BeltSaver mechanism close-up" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img 
                src={quarryAerial} 
                alt="Aggregate quarry aerial view" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="p-8 bg-gradient-to-br from-card to-primary/10">
            <h3 className="text-xl industrial-title mb-2">BeltSaver® IP</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Patented Integrated Tail Pulley IP. Protect your belt edges and eliminate tracking wander.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/beltsaver">View Details</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:twirlingyosh@gmail.com">Inquire</a>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Welcome/Status Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-8 bg-gradient-to-br from-card to-secondary/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="industrial-title text-xl mb-2">
                {user ? `Welcome back` : 'Get Started'}
              </h2>
              <p className="text-muted-foreground">
                {user 
                  ? hasAccess 
                    ? 'You have full access to all diagnostic tools and features.'
                    : 'Upgrade your plan to unlock unlimited diagnostics and premium features.'
                  : 'Sign in to save your diagnostic runs and access premium features.'
                }
              </p>
            </div>
            
            {!user ? (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            ) : !hasAccess ? (
              <Button asChild>
                <Link to="/upgrade">
                  <Crown size={16} className="mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            ) : null}
          </div>
        </Card>
      </section>

      {/* Social Media & Footer */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SocialMediaLinks variant="footer" />
        <p className="text-center text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.5em] mt-8">
          © 2025 Hinjd Global Systems
        </p>
      </section>
    </AppLayout>
  );
};

export default Home;
