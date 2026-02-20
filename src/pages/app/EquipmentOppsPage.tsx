import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/app/AppLayout';
import EquipmentDiagnostics from '@/components/EquipmentDiagnostics';

const EquipmentOppsPage = () => {
  return (
    <AppLayout title="Equipment Opps">
      <Helmet>
        <title>Equipment Opps - AI-Powered Equipment Diagnostics | Hinjd Global</title>
        <meta name="description" content="Diagnose heavy equipment issues with AI. Get instant fault analysis, repair steps, and parts recommendations for mining and aggregate equipment." />
        <link rel="canonical" href="https://hinjd-ecosystem-hub.lovable.app/app/equipment-opps" />
        <meta property="og:title" content="Equipment Opps - AI-Powered Equipment Diagnostics" />
        <meta property="og:description" content="AI diagnostics for heavy equipment. Instant fault analysis, repair steps, and parts recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hinjd-ecosystem-hub.lovable.app/app/equipment-opps" />
        <meta property="og:image" content="https://hinjd-ecosystem-hub.lovable.app/og-equipment-opps.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="640" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Equipment Opps - AI Equipment Diagnostics" />
        <meta name="twitter:description" content="AI-powered diagnostics for mining and aggregate heavy equipment." />
        <meta name="twitter:image" content="https://hinjd-ecosystem-hub.lovable.app/og-equipment-opps.jpg" />
      </Helmet>
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <EquipmentDiagnostics />
      </div>
    </AppLayout>
  );
};

export default EquipmentOppsPage;
