import { 
  BarChart3, 
  Wrench, 
  Zap,
  LayoutDashboard,
  ChevronRight,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PortfolioCard from './PortfolioCard';

interface HubViewProps {
  onNavigateToApp: () => void;
}

const HubView = ({ onNavigateToApp }: HubViewProps) => {
  const { user, signOut } = useAuth();
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
      tag: "Maintenance"
    },
    {
      title: "Concrete-Quantify",
      desc: "Civil Engineering Volume & Costing",
      url: "https://concrete-quantify.lovable.app",
      colorClass: "text-industrial-blue",
      bgClass: "bg-industrial-blue/10",
      icon: <BarChart3 size={24} />,
      tag: "Civil"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Auth Bar */}
      <div className="max-w-2xl mx-auto flex justify-end mb-4 animate-slide-up">
        {user ? (
          <div className="flex items-center gap-3">
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

      {/* Header */}
      <header className="max-w-2xl mx-auto text-center mt-8 mb-16 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 card-glow industrial-title text-3xl text-primary-foreground">
          H
        </div>
        <h1 className="text-5xl industrial-title">
          Hinjd <span className="text-primary">Global</span>
        </h1>
        <p className="industrial-label mt-3">
          Industrial IP Portfolio
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
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
          <div className="bg-primary/20 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <ChevronRight size={20} />
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
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Section */}
        <div 
          className="p-8 bg-gradient-to-br from-card to-primary/10 border border-primary/20 rounded-4xl mt-8 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          <h3 className="text-xl industrial-title mb-2">BeltSaver® IP</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Patented Integrated Tail Pulley IP. Protect your belt edges and eliminate tracking wander.
          </p>
          <a 
            href="mailto:twirlingyosh@gmail.com" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform duration-300"
          >
            Inquire for Acquisition
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center pb-12 animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <p className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.5em]">
          © 2025 Hinjd Global Systems
        </p>
      </footer>
    </div>
  );
};

export default HubView;
