import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Zap, Droplets, Cpu, Cog, Search } from 'lucide-react';

const URL = 'https://hinjd-ecosystem-hub.lovable.app/fleet-repair-diagnostics';

const tools = [
  { icon: Cpu, title: 'AI Equipment Diagnostics', desc: 'Describe symptoms on any excavator, dozer or loader and get a likely diagnosis, repair steps and parts list.' },
  { icon: Search, title: 'Fault Code Lookup', desc: 'Decode machine fault codes and see the matching part numbers and typical prices.' },
  { icon: Droplets, title: 'Hydraulics', desc: 'Interactive hydraulic schematics to trace pressure loss, slow cylinders and pump problems.' },
  { icon: Zap, title: 'Electrical', desc: 'Wiring diagrams plus voltage and resistance reference charts for fast circuit checks.' },
  { icon: Cog, title: 'Crusher & Screener Diagnostics', desc: 'Step-by-step troubleshooting for aggregate crushers and screens to cut plant downtime.' },
  { icon: Wrench, title: 'Fleet Tracking', desc: 'Keep every unit, its status and repair history in one place.' },
];

const FleetRepairDiagnostics = () => (
  <main className="min-h-screen bg-background text-foreground px-4 py-12">
    <Helmet>
      <title>Fleet Repair Diagnostics for Heavy Equipment | Hinjd</title>
      <meta name="description" content="AI heavy equipment diagnostics, fault code lookup, hydraulic and electrical troubleshooting for fleet repair and aggregate plants." />
      <link rel="canonical" href={URL} />
      <meta property="og:url" content={URL} />
    </Helmet>
    <div className="max-w-5xl mx-auto">
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Home</Link>
      <h1 className="text-4xl font-bold mt-4 text-primary">Fleet Repair Diagnostics</h1>
      <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
        Diagnose heavy equipment faster. Hinjd's diagnostic tools help mechanics and fleet managers find the problem, the part and the fix — before downtime adds up.
      </p>
      <div className="flex gap-3 mt-6">
        <Button asChild><Link to="/auth">Start diagnosing free</Link></Button>
        <Button asChild variant="outline"><Link to="/app/equipment">Try equipment tools</Link></Button>
      </div>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {tools.map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Icon className="text-primary" size={20} />{title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
          </Card>
        ))}
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="list-decimal pl-6 mt-3 space-y-2 text-muted-foreground">
          <li>Create a free account.</li>
          <li>Pick the machine and describe the symptom or enter the fault code.</li>
          <li>Get the likely cause, repair steps and the parts you need.</li>
        </ol>
      </section>
    </div>
  </main>
);

export default FleetRepairDiagnostics;
