import { Helmet } from 'react-helmet-async';
import HubView from '@/components/HubView';
import BeltAssistant from '@/components/BeltAssistant';
const Index = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hinjd Global",
    "url": "https://hinjd-ecosystem-hub.lovable.app",
    "logo": "https://hinjd-ecosystem-hub.lovable.app/og-hinjd-hub.jpg",
    "description": "Industrial conveyor diagnostics and BeltSaver® technology solutions for mining, aggregates, and bulk material handling industries.",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61573858498498",
      "https://www.instagram.com/hinjd_global/",
      "https://www.tiktok.com/@hinjd_global",
      "https://www.linkedin.com/company/hinjd-global"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "sales",
      "email": "sales@hinjd.com"
    }
  };

  return (
    <>
      <Helmet>
        <title>Hinjd Global - BeltSaver® | Cox Aggs | Equipment Opps</title>
        <meta 
          name="description" 
          content="BeltSaver® conveyor belt protection, Cox Aggs aggregate operations management, and Equipment Opps AI diagnostics. Industrial solutions for mining and aggregate industries." 
        />
        <meta 
          name="keywords" 
          content="conveyor belt diagnostics, belt tracking, BeltSaver, Cox Aggs, Equipment Opps, industrial conveyor, belt mistracking, aggregate operations, mining conveyor" 
        />
        <link rel="canonical" href="https://hinjd-ecosystem-hub.lovable.app/" />
        <meta property="og:title" content="Hinjd Global - BeltSaver® | Cox Aggs | Equipment Opps" />
        <meta property="og:description" content="BeltSaver® belt protection, Cox Aggs aggregate management, and Equipment Opps AI diagnostics for mining and aggregates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hinjd-ecosystem-hub.lovable.app/" />
        <meta property="og:image" content="https://hinjd-ecosystem-hub.lovable.app/og-hinjd-hub.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="640" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hinjd Global - BeltSaver® | Cox Aggs | Equipment Opps" />
        <meta name="twitter:description" content="BeltSaver® belt protection, Cox Aggs aggregate management, and Equipment Opps AI diagnostics." />
        <meta name="twitter:image" content="https://hinjd-ecosystem-hub.lovable.app/og-hinjd-hub.jpg" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      <HubView />
      <BeltAssistant />
    </>
  );
};

export default Index;
