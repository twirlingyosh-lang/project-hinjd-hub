import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Cog, RotateCcw, ArrowRightLeft, ChevronRight } from 'lucide-react';
import tailPulleyImage from '@/assets/tail-pulley-hero.jpg';

const equipmentCategories = [
  {
    name: 'Tail Pulleys',
    description: 'BeltSaver® self-adjusting tail pulleys for automatic belt tracking',
    items: [
      { name: 'TS-24 Standard', size: '24" diameter', capacity: 'Up to 36" belt' },
      { name: 'TS-30 Medium', size: '30" diameter', capacity: 'Up to 48" belt' },
      { name: 'TS-36 Heavy Duty', size: '36" diameter', capacity: 'Up to 60" belt' },
    ],
    icon: RotateCcw,
    featured: true,
  },
  {
    name: 'Idler Frames',
    description: 'Standard and self-aligning idler frames for belt support',
    items: [
      { name: 'Troughing 35°', size: 'Standard', capacity: 'All belt widths' },
      { name: 'Troughing 45°', size: 'Heavy load', capacity: 'All belt widths' },
      { name: 'Return Idlers', size: 'Flat/V-return', capacity: 'All belt widths' },
    ],
    icon: ArrowRightLeft,
  },
  {
    name: 'Tracking Components',
    description: 'Belt tracking and alignment equipment',
    items: [
      { name: 'Training Idlers', size: 'Pivot type', capacity: 'Self-adjusting' },
      { name: 'Edge Guides', size: 'Roller type', capacity: 'Belt edge protection' },
      { name: 'Tracking Sensors', size: 'Electronic', capacity: 'Real-time monitoring' },
    ],
    icon: Cog,
  },
];

const Equipment = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="industrial-label mb-2">Equipment Database</p>
          <h1 className="text-3xl md:text-4xl industrial-title mb-4">
            Conveyor <span className="text-primary">Equipment</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse our catalog of conveyor components and BeltSaver® technology products 
            designed for aggregate and mining operations.
          </p>
        </div>

        {/* Featured Product */}
        <Card className="mb-8 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div 
              className="h-48 md:h-auto bg-cover bg-center"
              style={{ backgroundImage: `url(${tailPulleyImage})` }}
            />
            <div className="p-6 md:p-8">
              <Badge className="mb-4">Featured Product</Badge>
              <h2 className="text-2xl industrial-title mb-4">
                BeltSaver® <span className="text-primary">Tail Pulley</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Patented self-adjusting tail pulley technology that automatically corrects 
                belt mistracking, reducing maintenance and extending belt life by up to 300%.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Cog size={16} className="text-primary" />
                  <span>Self-Adjusting</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-primary" />
                  <span>No Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-primary" />
                  <span>Easy Install</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Equipment Categories */}
        <div className="space-y-6">
          {equipmentCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.name} className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {category.items.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.name}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{item.capacity}</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Equipment;
