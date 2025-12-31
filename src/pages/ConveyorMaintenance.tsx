import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Wrench, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Cog,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import tailPulleyHero from '@/assets/tail-pulley-hero.jpg';
import tailPulleyAssembly from '@/assets/tail-pulley-assembly.jpg';

const ConveyorMaintenance = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Conveyor Belt Maintenance Solutions",
    "description": "Professional conveyor belt maintenance, tracking solutions, and edge protection systems for mining, aggregate, and industrial applications.",
    "provider": {
      "@type": "Organization",
      "name": "Hinjd Global",
      "url": "https://hinjd.com"
    },
    "serviceType": "Industrial Equipment Maintenance",
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Conveyor Belt Protection Products",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "BeltSaver Tail Pulley Protection System",
            "description": "Patented clamp-on retrofit system for conveyor belt edge protection"
          }
        }
      ]
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What causes conveyor belt mistracking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Conveyor belt mistracking is commonly caused by uneven loading, worn pulleys, improper belt tension, misaligned idlers, material buildup, and structural frame issues. Regular maintenance and proper belt tracking systems can prevent these issues."
        }
      },
      {
        "@type": "Question",
        "name": "How can I prevent conveyor belt edge damage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prevent belt edge damage by installing tail pulley protection systems like BeltSaver, maintaining proper belt tracking, regular inspection of pulleys and idlers, and ensuring correct belt tension and alignment."
        }
      },
      {
        "@type": "Question",
        "name": "What is the ROI on conveyor belt protection systems?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Conveyor belt protection systems typically provide 300-500% ROI by extending belt life 2-3x, reducing unplanned downtime by up to 80%, and eliminating costly emergency repairs and belt replacements."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Conveyor Belt Maintenance & Tracking Solutions | Belt Edge Protection</title>
        <meta 
          name="description" 
          content="Expert conveyor belt maintenance solutions. Prevent belt mistracking, edge damage & costly downtime with patented BeltSaver protection systems. Free consultation." 
        />
        <meta 
          name="keywords" 
          content="conveyor belt maintenance, belt tracking solutions, belt mistracking, conveyor belt edge protection, tail pulley protection, belt damage prevention, industrial conveyor maintenance, aggregate conveyor systems, mining belt maintenance" 
        />
        <link rel="canonical" href="https://hinjd.com/conveyor-maintenance" />
        <meta property="og:title" content="Conveyor Belt Maintenance & Tracking Solutions" />
        <meta property="og:description" content="Prevent costly belt damage with patented protection systems. Expert solutions for mining, aggregate, and industrial applications." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hinjd.com/conveyor-maintenance" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Conveyor Belt Maintenance Solutions" />
        <meta name="twitter:description" content="Expert conveyor belt maintenance and tracking solutions for industrial applications." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative min-h-[70vh] flex items-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${tailPulleyHero})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          </div>
          
          <nav className="absolute top-0 left-0 right-0 z-20 p-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link to="/" className="text-2xl font-black italic uppercase tracking-tight text-foreground">
                Hinjd Global
              </Link>
              <div className="flex items-center gap-6">
                <Link to="/beltsaver" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  BeltSaver™
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
              </div>
            </div>
          </nav>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-full mb-6">
                Industrial Solutions
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase leading-tight mb-6">
                Conveyor Belt Maintenance & Tracking Solutions
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Prevent costly belt damage, reduce downtime, and extend equipment life with our patented 
                protection systems. Trusted by mining and aggregate operations worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/beltsaver">
                  <Button size="lg" className="font-bold">
                    View BeltSaver™ System
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="mailto:info@hinjd.com">
                  <Button variant="outline" size="lg" className="font-bold">
                    <Phone className="mr-2 h-5 w-5" />
                    Free Consultation
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Problem Section */}
          <section className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-4">
                  The True Cost of Belt Mistracking
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Conveyor belt mistracking and edge damage cost operations millions annually in 
                  unplanned downtime, emergency repairs, and premature belt replacement.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Unplanned Downtime</h3>
                    <p className="text-3xl font-black text-destructive mb-2">$10,000+</p>
                    <p className="text-muted-foreground text-sm">
                      Average cost per hour of conveyor downtime in mining operations
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Belt Replacement</h3>
                    <p className="text-3xl font-black text-destructive mb-2">$50-200K</p>
                    <p className="text-muted-foreground text-sm">
                      Typical cost to replace a damaged conveyor belt system
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Production Loss</h3>
                    <p className="text-3xl font-black text-destructive mb-2">40%</p>
                    <p className="text-muted-foreground text-sm">
                      Of belt failures occur at tail pulleys due to mistracking
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Solution Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-6">
                    Proactive Belt Protection That Pays for Itself
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Our patented BeltSaver™ system provides continuous edge protection at the tail pulley, 
                    preventing the damage that leads to costly repairs and replacements.
                  </p>

                  <div className="space-y-4">
                    {[
                      { icon: Shield, text: "Protects belt edges from mistracking damage" },
                      { icon: Wrench, text: "Clamp-on retrofit - no welding required" },
                      { icon: TrendingDown, text: "Reduces maintenance costs by up to 60%" },
                      { icon: Cog, text: "Works with 24\" to 72\" belt widths" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-foreground font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <Link to="/beltsaver">
                      <Button size="lg" className="font-bold">
                        Learn More About BeltSaver™
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <img 
                    src={tailPulleyAssembly} 
                    alt="BeltSaver tail pulley protection system installed on conveyor" 
                    className="rounded-xl shadow-2xl"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-xl">
                    <p className="text-sm font-medium">U.S. Patent</p>
                    <p className="text-xl font-black">12,195,281 B1</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Applications Section */}
          <section className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-4">
                  Industries We Serve
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Our conveyor belt maintenance solutions are trusted across heavy industries worldwide
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Mining Operations", desc: "Coal, copper, gold, and mineral extraction" },
                  { title: "Aggregate & Quarry", desc: "Crushed stone, sand, and gravel production" },
                  { title: "Cement & Concrete", desc: "Raw material handling and processing" },
                  { title: "Bulk Material Handling", desc: "Ports, grain, and industrial facilities" }
                ].map((industry, index) => (
                  <Card key={index} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-2">{industry.title}</h3>
                      <p className="text-muted-foreground text-sm">{industry.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Common questions about conveyor belt maintenance and protection
                </p>
              </div>

              <div className="space-y-6">
                <article className="border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-3">What causes conveyor belt mistracking?</h3>
                  <p className="text-muted-foreground">
                    Conveyor belt mistracking is commonly caused by uneven loading, worn pulleys, 
                    improper belt tension, misaligned idlers, material buildup, and structural frame issues. 
                    Regular maintenance and proper belt tracking systems can prevent these issues.
                  </p>
                </article>

                <article className="border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-3">How can I prevent conveyor belt edge damage?</h3>
                  <p className="text-muted-foreground">
                    Prevent belt edge damage by installing tail pulley protection systems like BeltSaver, 
                    maintaining proper belt tracking, regular inspection of pulleys and idlers, and 
                    ensuring correct belt tension and alignment.
                  </p>
                </article>

                <article className="border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-3">What is the ROI on conveyor belt protection systems?</h3>
                  <p className="text-muted-foreground">
                    Conveyor belt protection systems typically provide 300-500% ROI by extending belt 
                    life 2-3x, reducing unplanned downtime by up to 80%, and eliminating costly emergency 
                    repairs and belt replacements.
                  </p>
                </article>

                <article className="border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-3">How does the BeltSaver system work?</h3>
                  <p className="text-muted-foreground">
                    BeltSaver is a patented clamp-on retrofit system that installs at the tail pulley 
                    without welding. It provides continuous edge protection by guiding mistracking belts 
                    back to center before damage occurs, protecting both the belt and pulley components.
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-primary/10">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-6">
                Ready to Reduce Your Maintenance Costs?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get a free consultation and see how BeltSaver can protect your conveyor systems 
                and improve your bottom line.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/beltsaver">
                  <Button size="lg" className="font-bold">
                    View BeltSaver™ Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="mailto:info@hinjd.com?subject=Conveyor%20Maintenance%20Inquiry">
                  <Button variant="outline" size="lg" className="font-bold">
                    Contact Sales Team
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div>
                <Link to="/" className="text-xl font-black italic uppercase">Hinjd Global</Link>
                <p className="text-muted-foreground text-sm mt-2">
                  Industrial solutions for conveyor belt maintenance and protection.
                </p>
              </div>
              <div className="flex justify-center">
                <SocialMediaLinks />
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  © {new Date().getFullYear()} Hinjd Global. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ConveyorMaintenance;
