import { useState } from 'react';
import { Zap, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const leadSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  name: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
});

const LeadCaptureForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = leadSchema.safeParse({ email, name: name || undefined, company: company || undefined });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase
        .from('email_leads')
        .insert({
          email: result.data.email,
          name: result.data.name || null,
          company: result.data.company || null,
          source: 'free_diagnostic_trial',
        });

      if (dbError) {
        if (dbError.code === '23505') {
          // Duplicate email — treat as success
          setIsSubmitted(true);
          return;
        }
        throw dbError;
      }

      setIsSubmitted(true);
      toast({
        title: "You're in!",
        description: 'Check your inbox for your free diagnostic access.',
      });
    } catch (err) {
      console.error('Lead capture error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="animate-slide-up">
        <div className="bg-card border border-primary/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">You're All Set!</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your free diagnostic trial is ready. Sign in to run your first conveyor belt analysis — no credit card required.
          </p>
          <Button
            onClick={() => window.location.href = '/auth'}
            className="mt-6 text-[10px] font-black uppercase tracking-widest rounded-xl gap-2"
          >
            Start Your Free Diagnostic
            <ArrowRight size={14} />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-slide-up">
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="text-primary" size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block">
                Free Trial
              </span>
              <h2 className="text-lg font-black text-foreground leading-tight">
                Run Your First Diagnostic — Free
              </h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Get a professional AI-powered conveyor belt analysis. Identify tracking issues, edge damage risks, and get actionable repair recommendations.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { value: '1', label: 'Free Analysis' },
            { value: 'AI', label: 'Powered Report' },
            { value: '$0', label: 'No Card Required' },
          ].map((item) => (
            <div key={item.label} className="bg-card p-4 text-center">
              <div className="text-lg font-black text-primary">{item.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <Input
            type="email"
            placeholder="Work email address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="bg-secondary/50 border-border text-sm h-11"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="bg-secondary/50 border-border text-sm h-11"
            />
            <Input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={100}
              className="bg-secondary/50 border-border text-sm h-11"
            />
          </div>

          {error && (
            <p className="text-destructive text-xs font-medium">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-[10px] font-black uppercase tracking-widest rounded-xl h-12 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Get Free Diagnostic Access
                <ArrowRight size={14} />
              </>
            )}
          </Button>

          <p className="text-[9px] text-muted-foreground/50 text-center">
            No spam. No credit card. Just one free diagnostic to see the platform in action.
          </p>
        </form>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
