import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Wrench, Gauge, Zap, Settings } from 'lucide-react';

const crushers = [
  {
    id: 'jaw-1',
    name: 'JW42 Jaw Crusher',
    type: 'Jaw',
    capacity: '100-250 TPH',
    maxFeed: '24"',
    power: '125 HP',
    specs: { rpm: '250-300', stroke: '1.5"', weight: '45,000 lbs' }
  },
  {
    id: 'cone-1',
    name: 'CS430 Cone Crusher',
    type: 'Cone',
    capacity: '150-350 TPH',
    maxFeed: '12"',
    power: '300 HP',
    specs: { rpm: '280-340', stroke: '2.0"', weight: '65,000 lbs' }
  },
  {
    id: 'impact-1',
    name: 'IP1313 Impact Crusher',
    type: 'Impact',
    capacity: '200-400 TPH',
    maxFeed: '18"',
    power: '350 HP',
    specs: { rpm: '500-800', rotorDia: '52"', weight: '55,000 lbs' }
  },
  {
    id: 'vsi-1',
    name: 'VSI2000 Vertical Shaft',
    type: 'VSI',
    capacity: '100-300 TPH',
    maxFeed: '3"',
    power: '400 HP',
    specs: { rpm: '1200-1800', rotorDia: '42"', weight: '35,000 lbs' }
  },
];

const screens = [
  {
    id: 'screen-1',
    name: 'VG68 Vibrating Screen',
    type: 'Incline',
    decks: 3,
    size: "6' x 20'",
    capacity: '400 TPH',
    specs: { stroke: '0.5"', rpm: '850', angle: '20°' }
  },
  {
    id: 'screen-2',
    name: 'HS54 Horizontal Screen',
    type: 'Horizontal',
    decks: 2,
    size: "5' x 16'",
    capacity: '300 TPH',
    specs: { stroke: '0.375"', rpm: '900', angle: '0°' }
  },
];

const EquipmentPage = () => {
  const [search, setSearch] = useState('');

  const filteredCrushers = crushers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  const filteredScreens = screens.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Equipment">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="crushers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crushers">Crushers</TabsTrigger>
            <TabsTrigger value="screens">Screens</TabsTrigger>
          </TabsList>

          <TabsContent value="crushers" className="space-y-3 mt-4">
            {filteredCrushers.map((crusher) => (
              <Card key={crusher.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{crusher.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{crusher.type}</Badge>
                    </div>
                    <Wrench className="text-muted-foreground" size={20} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-secondary/50 rounded-lg text-center">
                      <Gauge size={14} className="mx-auto mb-1 text-primary" />
                      <p className="text-muted-foreground text-xs">Capacity</p>
                      <p className="font-medium">{crusher.capacity}</p>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded-lg text-center">
                      <Settings size={14} className="mx-auto mb-1 text-blue-400" />
                      <p className="text-muted-foreground text-xs">Max Feed</p>
                      <p className="font-medium">{crusher.maxFeed}</p>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded-lg text-center">
                      <Zap size={14} className="mx-auto mb-1 text-yellow-400" />
                      <p className="text-muted-foreground text-xs">Power</p>
                      <p className="font-medium">{crusher.power}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(crusher.specs).map(([key, value]) => (
                      <span key={key} className="inline-block mr-3">
                        <span className="capitalize">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="screens" className="space-y-3 mt-4">
            {filteredScreens.map((screen) => (
              <Card key={screen.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{screen.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{screen.type}</Badge>
                        <Badge variant="outline">{screen.decks} Deck</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-secondary/50 rounded-lg text-center">
                      <p className="text-muted-foreground text-xs">Size</p>
                      <p className="font-medium">{screen.size}</p>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded-lg text-center">
                      <p className="text-muted-foreground text-xs">Capacity</p>
                      <p className="font-medium">{screen.capacity}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(screen.specs).map(([key, value]) => (
                      <span key={key} className="inline-block mr-3">
                        <span className="capitalize">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EquipmentPage;
