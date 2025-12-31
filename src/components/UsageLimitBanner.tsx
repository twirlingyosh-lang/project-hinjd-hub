import { AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UsageLimitBannerProps {
  freeUsesRemaining: number;
  totalFreeUses?: number;
  hasActiveSubscription: boolean;
  onSubscribe?: () => void;
  compact?: boolean;
}

const UsageLimitBanner = ({ 
  freeUsesRemaining, 
  totalFreeUses = 10,
  hasActiveSubscription,
  onSubscribe,
  compact = false
}: UsageLimitBannerProps) => {
  if (hasActiveSubscription) {
    return compact ? null : (
      <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
        <Zap size={12} />
        <span>Unlimited Access</span>
      </div>
    );
  }

  const usedUses = totalFreeUses - freeUsesRemaining;
  const percentUsed = (usedUses / totalFreeUses) * 100;
  const isLow = freeUsesRemaining <= 3;
  const isExhausted = freeUsesRemaining <= 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
        isExhausted ? 'text-destructive bg-destructive/10' : 
        isLow ? 'text-primary bg-primary/10' : 
        'text-muted-foreground bg-muted'
      }`}>
        <span>{freeUsesRemaining}/{totalFreeUses} free uses</span>
      </div>
    );
  }

  if (isExhausted) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Free Uses Exhausted</h4>
              <p className="text-xs text-muted-foreground mb-3">
                You've used all 10 free diagnostics and configurations. Subscribe to continue using the tool.
              </p>
              <Button size="sm" onClick={onSubscribe} className="w-full">
                <Zap size={14} className="mr-2" />
                Subscribe Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border ${isLow ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Free Uses</span>
          <span className={`text-xs font-bold ${isLow ? 'text-primary' : 'text-muted-foreground'}`}>
            {freeUsesRemaining} remaining
          </span>
        </div>
        <Progress value={percentUsed} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {isLow 
            ? "Running low! Subscribe for unlimited access."
            : `${usedUses} of ${totalFreeUses} free uses consumed.`
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default UsageLimitBanner;
