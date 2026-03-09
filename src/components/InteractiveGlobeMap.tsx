import { useState } from 'react';
import { MapPin, X, Phone, Mail, Globe, Clock, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DealerLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  makesServed: string[];
  hours?: string;
  isVerified: boolean;
}

const dealers: DealerLocation[] = [
  {
    id: '1',
    name: 'Southeast Aggregate Supply',
    city: 'Atlanta',
    state: 'GA',
    lat: 33.7,
    lng: -84.4,
    phone: '(404) 555-0192',
    email: 'sales@se-aggregate.com',
    website: 'https://se-aggregate.com',
    makesServed: ['Komatsu', 'CAT', 'Volvo'],
    hours: 'Mon-Fri 7AM-5PM',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Desert Rock Equipment',
    city: 'Las Vegas',
    state: 'NV',
    lat: 36.1,
    lng: -115.2,
    phone: '(702) 555-0384',
    email: 'info@desertrock.com',
    makesServed: ['Metso', 'Sandvik', 'CAT'],
    hours: 'Mon-Fri 6AM-4PM',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Gulf Coast Conveyors',
    city: 'Houston',
    state: 'TX',
    lat: 29.7,
    lng: -95.4,
    phone: '(713) 555-0741',
    email: 'service@gulfcoast-conv.com',
    website: 'https://gulfcoastconveyors.com',
    makesServed: ['Martin Eng.', 'Flexco', 'Continental'],
    hours: 'Mon-Sat 6AM-6PM',
    isVerified: true,
  },
  {
    id: '4',
    name: 'Heartland Heavy Equipment',
    city: 'Kansas City',
    state: 'MO',
    lat: 39.1,
    lng: -94.6,
    phone: '(816) 555-0298',
    makesServed: ['John Deere', 'CAT', 'Komatsu'],
    hours: 'Mon-Fri 7AM-5PM',
    isVerified: false,
  },
  {
    id: '5',
    name: 'Pacific Northwest Mining',
    city: 'Seattle',
    state: 'WA',
    lat: 47.6,
    lng: -122.3,
    phone: '(206) 555-0156',
    email: 'parts@pnw-mining.com',
    makesServed: ['Sandvik', 'Metso', 'Terex'],
    hours: 'Mon-Fri 7AM-4PM',
    isVerified: true,
  },
  {
    id: '6',
    name: 'Northeast Industrial Parts',
    city: 'New York',
    state: 'NY',
    lat: 40.7,
    lng: -74.0,
    phone: '(212) 555-0833',
    email: 'orders@ne-industrial.com',
    website: 'https://ne-industrial.com',
    makesServed: ['CAT', 'Volvo', 'Liebherr'],
    hours: 'Mon-Fri 8AM-5PM',
    isVerified: true,
  },
];

// Simple US map projection (Albers-like approximation)
const project = (lat: number, lng: number): { x: number; y: number } => {
  // Normalize to roughly fit a US-centric view
  const x = ((lng + 130) / 65) * 100;
  const y = ((50 - lat) / 25) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
};

const InteractiveGlobeMap = () => {
  const [selectedDealer, setSelectedDealer] = useState<DealerLocation | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="animate-slide-up">
      <div className="text-center mb-6">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
          Dealer Network
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Serving <span className="text-primary">Nationwide</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Click any marker to view dealer details and BeltSaver® availability.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Map area */}
        <div className="relative h-72 sm:h-80 bg-gradient-to-br from-secondary/30 to-background overflow-hidden">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            {[...Array(8)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            ))}
            {[...Array(8)].map((_, i) => (
              <line key={`v-${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            ))}
          </svg>

          {/* Connection lines between markers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {dealers.map((d, i) => {
              if (i === 0) return null;
              const prev = dealers[i - 1];
              const p1 = project(prev.lat, prev.lng);
              const p2 = project(d.lat, d.lng);
              return (
                <line
                  key={`line-${i}`}
                  x1={`${p1.x}%`} y1={`${p1.y}%`}
                  x2={`${p2.x}%`} y2={`${p2.y}%`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  opacity="0.15"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Dealer markers */}
          {dealers.map((dealer) => {
            const pos = project(dealer.lat, dealer.lng);
            const isHovered = hoveredId === dealer.id;
            return (
              <button
                key={dealer.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 focus:outline-none"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => setSelectedDealer(dealer)}
                onMouseEnter={() => setHoveredId(dealer.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-label={`View ${dealer.name} in ${dealer.city}, ${dealer.state}`}
              >
                {/* Pulse ring */}
                <span className={`absolute inset-0 w-8 h-8 -m-1.5 rounded-full bg-primary/20 ${isHovered ? 'animate-ping' : 'animate-pulse'}`} />
                {/* Marker dot */}
                <span className={`relative block w-5 h-5 rounded-full border-2 border-primary shadow-lg transition-all duration-200 ${isHovered ? 'bg-primary scale-150 shadow-primary/50' : 'bg-primary/80 scale-100'}`}>
                  <MapPin className="w-3 h-3 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </span>
                {/* Tooltip */}
                <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider bg-card border border-border px-2 py-1 rounded shadow-lg transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
                  {dealer.city}, {dealer.state}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer tags */}
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap justify-center gap-3">
            {dealers.slice(0, 4).map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedDealer(loc)}
                className="text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary/50 px-2.5 py-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
              >
                {loc.city}, {loc.state}
              </button>
            ))}
            <span className="text-[10px] text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
              +{dealers.length - 4} more
            </span>
          </div>
        </div>
      </div>

      {/* Dealer Detail Dialog */}
      <Dialog open={!!selectedDealer} onOpenChange={(open) => !open && setSelectedDealer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {selectedDealer?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDealer?.city}, {selectedDealer?.state}
              {selectedDealer?.isVerified && (
                <Badge variant="secondary" className="ml-2 text-[10px]">Verified</Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedDealer && (
            <div className="space-y-4 mt-2">
              {/* Contact info */}
              <div className="space-y-2">
                {selectedDealer.phone && (
                  <a href={`tel:${selectedDealer.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                    {selectedDealer.phone}
                  </a>
                )}
                {selectedDealer.email && (
                  <a href={`mailto:${selectedDealer.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                    {selectedDealer.email}
                  </a>
                )}
                {selectedDealer.website && (
                  <a href={selectedDealer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Globe className="w-4 h-4 text-primary" />
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedDealer.hours && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {selectedDealer.hours}
                  </div>
                )}
              </div>

              {/* Makes served */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Equipment Brands</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDealer.makesServed.map((make) => (
                    <Badge key={make} variant="outline" className="text-xs">{make}</Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button className="w-full mt-2" onClick={() => setSelectedDealer(null)}>
                <Mail className="w-4 h-4 mr-2" />
                Request BeltSaver® Quote
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InteractiveGlobeMap;
