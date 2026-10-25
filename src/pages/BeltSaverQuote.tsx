import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2 } from 'lucide-react';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  company: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(40).optional(),
  belt_width: z.string().trim().max(50).optional(),
  quantity: z.coerce.number().int().min(1).max(1000).optional(),
  message: z.string().trim().max(2000).optional(),
});

const URL = 'https://hinjd-ecosystem-hub.lovable.app/beltsaver/quote';

const BeltSaverQuote = () => {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const raw = Object.fromEntries(
      [...new FormData(e.currentTarget).entries()].filter(([, v]) => String(v).trim() !== ''),
    );
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return setError(parsed.error.errors[0].message);
    setBusy(true);
    const { error } = await supabase.from('quote_requests').insert(parsed.data as any);
    setBusy(false);
    if (error) return setError("Couldn't send your request. Please try again.");
    setDone(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12">
      <Helmet>
        <title>Request a BeltSaver Quote | Hinjd Conveyor Solutions</title>
        <meta name="description" content="Request a quote for the patented BeltSaver tail pulley system that stops conveyor belt wander." />
        <link rel="canonical" href={URL} />
        <meta property="og:url" content={URL} />
      </Helmet>
      <div className="max-w-xl mx-auto">
        <Link to="/beltsaver" className="text-sm text-muted-foreground hover:text-primary">← BeltSaver</Link>
        <h1 className="text-3xl font-bold mt-4 text-primary">Request a BeltSaver Quote</h1>
        <p className="text-muted-foreground mt-2 mb-6">Tell us about your conveyor and we'll get back to you with pricing.</p>
        <Card>
          <CardContent className="pt-6">
            {done ? (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto text-primary mb-3" size={40} />
                <h2 className="text-xl font-semibold">Request received</h2>
                <p className="text-muted-foreground mt-2">Thanks — we'll be in touch about your quote.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Name *</Label><Input id="name" name="name" maxLength={100} required /></div>
                  <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" maxLength={255} required /></div>
                  <div><Label htmlFor="company">Company</Label><Input id="company" name="company" maxLength={150} /></div>
                  <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" maxLength={40} /></div>
                  <div><Label htmlFor="belt_width">Belt width</Label><Input id="belt_width" name="belt_width" placeholder='e.g. 36"' maxLength={50} /></div>
                  <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" name="quantity" type="number" min={1} max={1000} /></div>
                </div>
                <div><Label htmlFor="message">Details</Label><Textarea id="message" name="message" maxLength={2000} rows={4} placeholder="Material, tracking issues, site location..." /></div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={busy} className="w-full">{busy ? 'Sending…' : 'Request quote'}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default BeltSaverQuote;
