import { 
  ArrowLeft, 
  Shield, 
  Zap, 
  TrendingDown, 
  Clock, 
  CheckCircle2,
  Settings,
  Gauge,
  Factory,
  Mail,
  Download,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import heroImage from '@/assets/hero-beltsaver.jpg';
import beltCloseup from '@/assets/beltsaver-closeup.jpg';
import quarryAerial from '@/assets/quarry-aerial.jpg';

const BeltSaver = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield size={24} />,
      title: "Clamp-On Retrofit",
      description: "Two semi-circular discs bolt around existing shafts, extending 4-6\" above the belt for guidance"
    },
    {
      icon: <Zap size={24} />,
      title: "Integrated Design",
      description: "Built-in discs form part of the pulley for OEM installations—no welding or cutting required"
    },
    {
      icon: <TrendingDown size={24} />,
      title: "Reduce Downtime",
      description: "Prevent belt derailments before they happen, keeping your operation running"
    },
    {
      icon: <Clock size={24} />,
      title: "Fast Installation",
      description: "Universal fit for standard shaft sizes with minimal downtime during install"
    }
  ];

  const specifications = [
    { label: "Pulley Diameter Range", value: "12\" - 48\" (305mm - 1220mm)" },
    { label: "Belt Width Compatibility", value: "18\" - 72\" (457mm - 1829mm)" },
    { label: "Max Belt Speed", value: "1,200 FPM (6.1 m/s)" },
    { label: "Operating Temperature", value: "-40°F to 180°F (-40°C to 82°C)" },
    { label: "Material", value: "High-durometer polyurethane / Steel core" },
    { label: "Installation Time", value: "< 4 hours typical" },
    { label: "Warranty", value: "5-year limited warranty" },
    { label: "Certifications", value: "MSHA Approved, CE Marked" }
  ];

  const applications = [
    "Mining Operations",
    "Aggregates & Quarries",
    "Cement Plants",
    "Power Generation",
    "Bulk Material Handling",
    "Industrial Conveyors"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="BeltSaver conveyor belt technology" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            Back to Hub
          </Button>
        </div>

        {/* Social Links */}
        <div className="absolute top-4 right-4 z-10">
          <SocialMediaLinks variant="inline" />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
          <span className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4 animate-slide-up">
            U.S. Patent No. 12,195,281 B1
          </span>
          <h1 className="text-5xl md:text-6xl industrial-title animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Belt Saver<span className="text-primary">™</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Patented Tail Pulley Protection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        
        {/* Value Proposition */}
        <section className="text-center mb-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-3xl industrial-title mb-6">
            Stop Belt Misalignment <span className="text-primary">At The Source</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Conveyor belt misalignment at the tail pulley is a leading cause of costly downtime, 
            premature belt wear, and expensive pulley replacements. The Belt Saver™ solves this 
            with a simple, field-ready solution that protects belts and extends equipment life.
          </p>
          <a 
            href="/documents/BeltSaver_Brochure.pdf"
            download
            className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Download size={18} />
            Download Brochure (PDF)
          </a>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h3 className="industrial-label text-center mb-8">Key Benefits</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Image Gallery */}
        <section className="mb-20 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <h3 className="industrial-label text-center mb-8">In Action</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="aspect-video overflow-hidden rounded-2xl border border-border">
              <img 
                src={beltCloseup} 
                alt="BeltSaver tail pulley mechanism" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl border border-border">
              <img 
                src={quarryAerial} 
                alt="Conveyor systems in aggregate quarry" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="mb-20 animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <h3 className="industrial-label text-center mb-8">Technical Specifications</h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-border flex items-center gap-3">
              <Settings size={20} className="text-primary" />
              <span className="font-bold">Product Specifications</span>
            </div>
            <div className="divide-y divide-border">
              {specifications.map((spec) => (
                <div key={spec.label} className="flex justify-between items-center p-4 hover:bg-secondary/50 transition-colors">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="font-semibold text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="mb-20 animate-slide-up" style={{ animationDelay: '1s' }}>
          <h3 className="industrial-label text-center mb-8">Applications</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {applications.map((app) => (
              <div 
                key={app}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
              >
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-sm">{app}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ROI Section */}
        <section className="mb-20 animate-slide-up" style={{ animationDelay: '1.1s' }}>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Gauge size={32} className="text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-foreground mb-2">60%</div>
                <p className="text-sm text-muted-foreground">Reduced Maintenance Costs</p>
              </div>
              <div>
                <Clock size={32} className="text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-foreground mb-2">3x</div>
                <p className="text-sm text-muted-foreground">Extended Belt Lifespan</p>
              </div>
              <div>
                <Factory size={32} className="text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-foreground mb-2">12mo</div>
                <p className="text-sm text-muted-foreground">Typical ROI Payback</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center animate-slide-up" style={{ animationDelay: '1.2s' }}>
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl industrial-title mb-4">
              Ready to Protect Your <span className="text-primary">Investment</span>?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Contact us for licensing inquiries, technical specifications, or to schedule a demonstration 
              of the BeltSaver® Integrated Tail Pulley technology.
            </p>
            <a 
              href="mailto:twirlingyosh@gmail.com"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform duration-300"
            >
              <Mail size={18} />
              Inquire for Acquisition
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <SocialMediaLinks variant="footer" />
          <p className="text-center text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.5em] mt-8">
            © 2025 Hinjd Global Systems • BeltSaver® is a registered trademark
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BeltSaver;