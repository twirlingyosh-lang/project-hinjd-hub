import { 
  BarChart3, 
  Wrench, 
  Zap,
  LayoutDashboard,
  ChevronRight,
  LogIn,
  LogOut,
  User,
  Lock,
  Sparkles,
  Shield,
  Cpu,
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import PortfolioCard from './PortfolioCard';
import ConveyorBelt3D from './3d/ConveyorBelt3D';
import EquipmentModel3D from './3d/EquipmentModel3D';
import Globe3D from './3d/Globe3D';
import LeadCaptureForm from './LeadCaptureForm';
import SocialMediaLinks from './SocialMediaLinks';
import heroImage from '@/assets/hero-beltsaver.jpg?format=webp';
import beltCloseup from '@/assets/beltsaver-closeup.jpg?format=webp';
import quarryAerial from '@/assets/quarry-aerial.jpg?format=webp';
import smashGuruThumb from '@/assets/smash-guru-thumb.jpg?format=webp';
import yardageProThumb from '@/assets/yardage-pro-thumb.jpg?format=webp';
import coxAggsThumb from '@/assets/cox-aggs-thumb.jpg?format=webp';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';

const HeroParticles = lazy(() => import('./3d/HeroParticles'));

interface HubViewProps {
  onNavigateToApp?: () => void;
}

// Animated counter hook
const useCountUp = (end: number, duration: number = 2000, suffix: string = '') => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, display: `${count}${suffix}` };
};

const HubView = ({ onNavigateToApp }: HubViewProps) => {
  const { user, signOut } = useAuth();
  const { hasAccess, isSubscribed, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  const stat1 = useCountUp(40, 2000, '%');
  const stat2 = useCountUp(12, 1800, 'M');
  const stat3 = useCountUp(99, 2200, '%');

  const handleNavigateToApp = () => {
    navigate('/aggregate-opps');
  };

  const platformFeatures = [
    {
      title: "Equipment Opps",
      desc: "AI diagnostics, dealer locator & parts ordering for heavy equipment",
      icon: <Cpu size={22} />,
      path: '/app/equipment-opps',
      accent: 'from-primary/20 to-primary/5',
      borderAccent: 'border-primary/30 hover:border-primary/60',
    },
    {
      title: "Belt Saver®",
      desc: "Patented tail pulley technology — eliminate belt tracking wander",
      icon: <Shield size={22} />,
      path: '/beltsaver',
      accent: 'from-primary/15 to-amber-500/5',
      borderAccent: 'border-primary/20 hover:border-primary/50',
    },
    {
      title: "Conveyor Maintenance",
      desc: "Expert guides for belt inspection, tensioning & troubleshooting",
      icon: <Wrench size={22} />,
      path: '/conveyor-maintenance',
      accent: 'from-industrial-red/15 to-industrial-red/5',
      borderAccent: 'border-industrial-red/20 hover:border-industrial-red/50',
    },
    {
      title: "CRM & Command",
      desc: "Sales pipeline, AI insights & HQ financial dashboard",
      icon: <TrendingUp size={22} />,
      path: '/crm',
      accent: 'from-industrial-blue/15 to-industrial-blue/5',
      borderAccent: 'border-industrial-blue/20 hover:border-industrial-blue/50',
    },
  ];

  const portfolio = [
    {
      title: "Cox-Aggs Pro",
      desc: "Enterprise G-Force & Carryover Modeling",
      url: "https://cox-aggs-27e91ba7.base44.app",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      icon: <Zap size={24} />,
      tag: "Enterprise",
      thumbnail: coxAggsThumb
    },
    {
      title: "Smash-Fix-Guru",
      desc: "Emergency Diagnostics & BeltSaver® ROI",
      url: "https://smash-fix-guru.lovable.app",
      colorClass: "text-industrial-red",
      bgClass: "bg-industrial-red/10",
      icon: <Wrench size={24} />,
      tag: "Maintenance",
      thumbnail: smashGuruThumb
    },
    {
      title: "Yardage Pro",
      desc: "Civil Engineering Volume & Costing",
      url: "https://yardage-pro.lovable.app",
      colorClass: "text-industrial-blue",
      bgClass: "bg-industrial-blue/10",
      icon: <BarChart3 size={24} />,
      tag: "Civil",
      thumbnail: yardageProThumb
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative w-full min-h-[85vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="BeltSaver conveyor belt technology protecting belt edges in aggregate quarry operation" 
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <Suspense fallback={null}>
          <HeroParticles />
        </Suspense>
        
        {/* Auth Bar */}
        <div className="absolute top-4 right-4 z-10">
          {user ? (
            <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <User size={16} />
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>

        {/* Social Links */}
        <div className="absolute top-4 left-4 z-10">
          <SocialMediaLinks variant="inline" />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6 animate-slide-up">
              <Activity size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">U.S. Patent No. 12,195,281 B1</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl industrial-title leading-[0.95] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Stop Belt Damage{' '}
              <span className="text-primary">Before It Starts</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              AI-powered diagnostics and patented BeltSaver® technology for mining, aggregates, and bulk material handling. Reduce downtime. Protect your investment.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg"
                onClick={() => navigate(user ? '/app/equipment-opps' : '/auth')}
                className="text-sm font-black uppercase tracking-wider px-8 gap-2 rounded-xl"
              >
                {user ? 'Open Dashboard' : 'Get Started Free'}
                <ArrowRight size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/beltsaver')}
                className="text-sm font-bold uppercase tracking-wider px-8 gap-2 rounded-xl border-primary/30 hover:border-primary/60"
              >
                See BeltSaver® Tech
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Stats Bar */}
      <div className="border-y border-border bg-card/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-border">
          <div ref={stat1.ref} className="flex flex-col items-center py-6 px-4">
            <span className="text-2xl md:text-4xl font-black text-primary">{stat1.display}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Less Downtime</span>
          </div>
          <div ref={stat2.ref} className="flex flex-col items-center py-6 px-4">
            <span className="text-2xl md:text-4xl font-black text-foreground">${stat2.display}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Belt Costs Saved</span>
          </div>
          <div ref={stat3.ref} className="flex flex-col items-center py-6 px-4">
            <span className="text-2xl md:text-4xl font-black text-primary">{stat3.display}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Track Accuracy</span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-16">

        {/* Interactive BeltSaver Demo */}
        <ConveyorBelt3D />
        
        {/* Platform Features Grid */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl industrial-title animate-slide-up">
              Your Entire Operation,{' '}
              <span className="text-primary">One Platform</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              From AI diagnostics to fleet management — everything you need to keep conveyors running and equipment profitable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {platformFeatures.map((feature, index) => (
              <button
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className={`group relative p-5 bg-gradient-to-br ${feature.accent} border ${feature.borderAccent} rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] animate-slide-up`}
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-background/60 rounded-xl text-primary shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-foreground/60 transition-colors shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* AggregateOpps CTA */}
        <section>
          <button 
            onClick={handleNavigateToApp}
            className="w-full p-6 bg-card border border-primary/30 rounded-2xl text-left flex justify-between items-center group hover:bg-secondary transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl text-primary-foreground">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h2 className="text-xl industrial-title text-foreground">AggregateOpps</h2>
                <p className="text-muted-foreground text-sm italic">Production & Yield Utility</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!hasAccess && !subscriptionLoading && (
                <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs text-primary">
                  <Lock size={12} />
                  {user ? 'Subscribe' : 'Demo'}
                </span>
              )}
              <div className="bg-primary/20 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <ChevronRight size={20} />
              </div>
            </div>
          </button>
        </section>

        {/* Why BeltSaver Section */}
        <section className="animate-slide-up">
          <div className="overflow-hidden rounded-2xl bg-card border border-primary/20">
            <div className="grid sm:grid-cols-2 gap-1">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={beltCloseup} 
                  alt="BeltSaver mechanism close-up showing patented belt edge protection" 
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={quarryAerial} 
                  alt="Aggregate quarry aerial view with conveyor belt systems" 
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-card to-primary/10">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Patented Technology</span>
              <h3 className="text-2xl industrial-title mb-3">BeltSaver® Integrated Tail Pulley</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                The only tail pulley that actively protects belt edges and eliminates tracking wander — saving you thousands in premature belt replacement.
              </p>
              
              <ul className="space-y-2 mb-6">
                {[
                  'Prevents belt edge damage at the source',
                  'Eliminates manual tracking adjustments',
                  'Drop-in replacement for existing tail pulleys',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => navigate('/beltsaver')}
                  className="text-[10px] font-black uppercase tracking-widest rounded-xl"
                >
                  View Full Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/conveyor-maintenance')}
                  className="text-[10px] font-black uppercase tracking-widest rounded-xl border-primary/30"
                >
                  Maintenance Guides
                </Button>
                <a 
                  href="mailto:twirlingyosh@gmail.com" 
                  className="inline-flex items-center bg-secondary text-foreground border border-border px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform duration-300"
                >
                  Inquire
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Content Generator */}
        <section>
          <button 
            onClick={() => navigate('/content-generator')}
            className="w-full p-4 bg-card border border-border rounded-2xl text-left flex justify-between items-center group hover:bg-secondary transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI Content Generator</h3>
                <p className="text-muted-foreground text-xs">Generate descriptions, summaries & reports</p>
              </div>
            </div>
            <div className="bg-primary/20 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <ChevronRight size={18} />
            </div>
          </button>
        </section>

        {/* Linked Ecosystem */}
        <section className="animate-slide-up">
          <h3 className="industrial-label mb-4">Linked Ecosystem</h3>
          <div className="grid gap-4">
            {portfolio.map((item, index) => (
              <div 
                key={item.title} 
                className="animate-slide-up" 
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <PortfolioCard
                  title={item.title}
                  description={item.desc}
                  url={item.url}
                  icon={item.icon}
                  tag={item.tag}
                  colorClass={item.colorClass}
                  bgClass={item.bgClass}
                  thumbnail={item.thumbnail}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Lead Capture / Free Diagnostic Trial */}
        <LeadCaptureForm />
      </main>

      {/* Social Media Links */}
      <div className="mt-8 animate-slide-up">
        <SocialMediaLinks variant="footer" />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center pb-12 animate-slide-up">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <button 
            onClick={() => navigate('/conveyor-maintenance')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Conveyor Maintenance
          </button>
          <span className="text-muted-foreground/20">·</span>
          <button 
            onClick={() => navigate('/beltsaver')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            BeltSaver® Technology
          </button>
          <span className="text-muted-foreground/20">·</span>
          <button 
            onClick={() => navigate('/auth')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Sign In
          </button>
        </div>
        <p className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.5em]">
          © 2025 Hinjd Global Systems
        </p>
      </footer>
    </div>
  );
};

export default HubView;
