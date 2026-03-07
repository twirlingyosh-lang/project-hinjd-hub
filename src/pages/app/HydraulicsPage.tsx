import { AppLayout } from '@/components/app/AppLayout';
import HydraulicSchematic from '@/components/diagnostics/HydraulicSchematic';

const HydraulicsPage = () => {
  return (
    <AppLayout title="Hydraulic Schematics">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Hydraulic Schematics</h1>
          <p className="text-muted-foreground max-w-2xl">
            Interactive hydraulic system diagrams showing pump circuits, valve blocks, and cylinder connections. 
            Click on components to view specifications and cross-reference part numbers.
          </p>
        </div>
        <HydraulicSchematic />
      </div>
    </AppLayout>
  );
};

export default HydraulicsPage;
