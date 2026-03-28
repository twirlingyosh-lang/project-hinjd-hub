import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/app/AppLayout';
import EquipmentMasterMap from '@/components/app/EquipmentMasterMap';

const FleetMapPage = () => {
  return (
    <AppLayout title="Fleet Map">
      <Helmet>
        <title>Fleet Map - Live Equipment Telemetry | HINJD Global</title>
        <meta name="description" content="Real-time fleet tracking with live telemetry data for crushers, screeners, conveyors, excavators, and haul trucks." />
        <link rel="canonical" href="https://hinjd-ecosystem-hub.lovable.app/app/fleet-map" />
      </Helmet>
      <div className="h-[calc(100vh-140px)]">
        <EquipmentMasterMap />
      </div>
    </AppLayout>
  );
};

export default FleetMapPage;
