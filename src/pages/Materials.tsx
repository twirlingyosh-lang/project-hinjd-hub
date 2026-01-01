import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Box, Layers, Droplets, Wind } from 'lucide-react';

const materials = [
  {
    name: 'Crushed Stone',
    density: '1.5-1.8 t/m³',
    angle: '30-40°',
    moisture: 'Low',
    abrasiveness: 'High',
    category: 'Aggregate',
  },
  {
    name: 'Sand',
    density: '1.4-1.6 t/m³',
    angle: '25-35°',
    moisture: 'Variable',
    abrasiveness: 'Medium',
    category: 'Aggregate',
  },
  {
    name: 'Gravel',
    density: '1.6-1.9 t/m³',
    angle: '35-45°',
    moisture: 'Low',
    abrasiveness: 'High',
    category: 'Aggregate',
  },
  {
    name: 'Limestone',
    density: '1.5-1.7 t/m³',
    angle: '30-38°',
    moisture: 'Low',
    abrasiveness: 'Medium',
    category: 'Rock',
  },
  {
    name: 'Coal',
    density: '0.8-1.0 t/m³',
    angle: '27-35°',
    moisture: 'Variable',
    abrasiveness: 'Low',
    category: 'Mineral',
  },
  {
    name: 'Iron Ore',
    density: '2.2-2.8 t/m³',
    angle: '35-40°',
    moisture: 'Low',
    abrasiveness: 'Very High',
    category: 'Ore',
  },
];

const Materials = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="industrial-label mb-2">Reference Database</p>
          <h1 className="text-3xl md:text-4xl industrial-title mb-4">
            Material <span className="text-primary">Properties</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Standard aggregate and bulk material properties for conveyor system design and belt tracking calculations.
          </p>
        </div>

        {/* Material Properties Legend */}
        <Card className="p-4 mb-8">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              <span className="text-muted-foreground">Density (tonnes/m³)</span>
            </div>
            <div className="flex items-center gap-2">
              <Box size={16} className="text-primary" />
              <span className="text-muted-foreground">Angle of Repose</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-primary" />
              <span className="text-muted-foreground">Moisture Content</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-primary" />
              <span className="text-muted-foreground">Abrasiveness</span>
            </div>
          </div>
        </Card>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.name} className="p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{material.name}</h3>
                  <Badge variant="secondary" className="mt-1">{material.category}</Badge>
                </div>
                <Box size={24} className="text-primary/50" />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Density</span>
                  <span className="font-medium">{material.density}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Angle of Repose</span>
                  <span className="font-medium">{material.angle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moisture</span>
                  <span className="font-medium">{material.moisture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Abrasiveness</span>
                  <span className="font-medium">{material.abrasiveness}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Note */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> These are typical values for reference. 
            Actual material properties may vary based on source, moisture content, and processing. 
            Always verify with lab testing for critical applications.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Materials;
