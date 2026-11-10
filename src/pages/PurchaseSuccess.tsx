import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, Receipt, LogIn, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { isPaidCheckout } from '@/lib/purchase';

type Info = { success: boolean; status?: string; tier?: string | null; amount?: number; currency?: string; receipt_url?: string | null; invoice_pdf?: string | null; error?: string };

export default function PurchaseSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [info, setInfo] = useState<Info | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSignedIn(!!data.session);
      if (!data.session || !sessionId) return;
      const { data: res } = await supabase.functions.invoke('checkout-receipt', { body: { session_id: sessionId } });
      setInfo(res ?? { success: false, error: 'Could not load receipt' });
      supabase.functions.invoke('check-subscription').catch(() => {});
    })();
  }, [sessionId]);

  const plan = info?.tier ? info.tier[0].toUpperCase() + info.tier.slice(1) : 'your plan';
  const paymentConfirmed = info?.success === true && isPaidCheckout(info.status);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {info && !paymentConfirmed
          ? <Clock3 className="mb-4 h-14 w-14 text-primary" />
          : <CheckCircle2 className="mb-4 h-14 w-14 text-primary" />}
        <h1 className="mb-2 text-3xl font-bold">{info && !paymentConfirmed ? 'Payment not confirmed' : 'Thank you for your purchase'}</h1>
        <p className="mb-8 text-muted-foreground">
          {paymentConfirmed
            ? `You're on HINJD Hub ${plan}${info.amount ? ` — $${info.amount.toFixed(2)} ${info.currency?.toUpperCase()}` : ''}.`
            : info
              ? 'Stripe has not confirmed this payment yet. A receipt and paid access become available only after payment completes.'
              : 'After Stripe confirms your payment, your receipt and account access will appear here.'}
        </p>

        <section className="mb-8 rounded-lg border border-border p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Receipt className="h-5 w-5 text-primary" /> Your receipt</h2>
          {signedIn && sessionId && !info && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading receipt…</p>}
          {paymentConfirmed && info?.receipt_url ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild><a href={info.receipt_url} target="_blank" rel="noopener noreferrer">View receipt</a></Button>
              {info.invoice_pdf && <Button variant="outline" asChild><a href={info.invoice_pdf} target="_blank" rel="noopener noreferrer">Download PDF</a></Button>}
            </div>
          ) : (info || signedIn === false || !sessionId) && (
            <p className="text-sm text-muted-foreground">
              {paymentConfirmed
                ? 'Check your email for the Stripe receipt. You can also see invoices in your Customer Portal.'
                : info
                  ? 'No receipt is available until Stripe confirms your payment.'
                  : 'Sign in to view your receipt here. Stripe emails receipts only after completed payments.'}
            </p>
          )}
        </section>

        <section className="mb-8 rounded-lg border border-border p-5">
          <h2 className="mb-3 font-semibold">How to access your account</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Sign in with the same Google or Apple account you used at checkout.</li>
            <li>{paymentConfirmed || !info ? 'Open the Dashboard — your paid features unlock automatically (it can take a minute).' : 'After payment completes, open the Dashboard to access your paid features.'}</li>
            <li>Find quotes, invoices and receipts any time in the Customer Portal.</li>
            <li>Install the app on your phone from your browser's "Add to Home Screen" menu.</li>
          </ol>
        </section>

        <div className="flex flex-wrap gap-3">
          {signedIn === false && <Button asChild><Link to="/auth"><LogIn /> Sign in</Link></Button>}
          <Button asChild variant={signedIn === false ? 'outline' : 'default'}><Link to="/app/dashboard"><LayoutDashboard /> Go to Dashboard</Link></Button>
          <Button variant="outline" asChild><Link to="/portal">Customer Portal</Link></Button>
        </div>
      </div>
    </main>
  );
}
