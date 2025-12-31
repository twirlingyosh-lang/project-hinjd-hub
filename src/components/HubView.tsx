import { 
  BarChart3, 
  Wrench, 
  Zap,
  LayoutDashboard,
  ChevronRight,
  LogIn,
  LogOut,
  User,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import PortfolioCard from './PortfolioCard';
import SocialMediaLinks from './SocialMediaLinks';
import heroImage from '@/assets/hero-beltsaver.jpg';
import beltCloseup from '@/assets/beltsaver-closeup.jpg';
import quarryAerial from '@/assets/quarry-aerial.jpg';
import smashGuruThumb from '@/assets/smash-guru-thumb.jpg';
import yardageProThumb from '@/assets/yardage-pro-thumb.jpg';

interface HubViewProps {
  onNavigateToApp: () => void;
}

const HubView = ({ onNavigateToApp }: HubViewProps) => {
  const { user, signOut } = useAuth();
  const { hasAccess, isSubscribed, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const portfolio = [
    {
      title: "Cox-Aggs Pro",
      desc: "Enterprise G-Force & Carryover Modeling",
      url: "https://cox-aggs-27e91ba7.base44.app",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      icon: <Zap size={24} />,
      tag: "Enterprise"
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
      title: "Concrete-Quantify",
      desc: "Civil Engineering Volume & Costing",
      url: "https://concrete-quantify.lovable.app",
      colorClass: "text-industrial-blue",
      bgClass: "bg-industrial-blue/10",
      icon: <BarChart3 size={24} />,
      tag: "Civil",
      thumbnail: yardageProThumb
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Image */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden rounded-b-[3rem] mb-8">
        <img 
          src={heroImage} 
          alt="BeltSaver conveyor belt technology in aggregate quarry" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Auth Bar Overlay */}
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

        {/* Social Media Links Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <SocialMediaLinks variant="inline" />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 card-glow industrial-title text-3xl text-primary-foreground animate-slide-up">
            H
          </div>
          <h1 className="text-5xl industrial-title animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Hinjd <span className="text-primary">Global</span>
          </h1>
          <p className="industrial-label mt-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Industrial IP Portfolio
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 px-6">
        {/* Main App Trigger */}
        <button 
          onClick={onNavigateToApp}
          className="w-full p-6 bg-card border border-primary/30 rounded-4xl text-left flex justify-between items-center group hover:bg-secondary transition-all duration-300 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
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

        {/* Linked Ecosystem */}
        <div className="py-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="industrial-label mb-4">Linked Ecosystem</h3>
          <div className="grid gap-4">
            {portfolio.map((item, index) => (
              <div 
                key={item.title} 
                className="animate-slide-up" 
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
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
        </div>

        {/* BeltSaver Section with Images */}
        <div 
          className="overflow-hidden rounded-4xl mt-8 animate-slide-up bg-card border border-primary/20"
          style={{ animationDelay: '0.6s' }}
        >
          {/* Image Gallery */}
          <div className="grid grid-cols-2 gap-1">
            <div className="aspect-square overflow-hidden">
              <img 
                src={beltCloseup} 
                alt="BeltSaver tail pulley mechanism close-up" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img 
                src={quarryAerial} 
                alt="Aggregate quarry aerial view with conveyor systems" 
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
              <button 
                onClick={() => navigate('/beltsaver')}
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform duration-300"
              >
                View Details
              </button>
              <a 
                href="mailto:twirlingyosh@gmail.com" 
                className="inline-block bg-secondary text-foreground border border-border px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform duration-300"
              >
                Inquire
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="mt-16 animate-slide-up" style={{ animationDelay: '0.75s' }}>
        <SocialMediaLinks variant="footer" />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center pb-12 animate-slide-up" style={{ animationDelay: '0.8s' }}>
        <p className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.5em]">
          © 2025 Hinjd Global Systems
        </p>
      </footer>
    </div>
  );
};

export default HubView;
