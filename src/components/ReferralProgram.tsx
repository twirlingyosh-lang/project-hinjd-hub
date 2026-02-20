import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Users, Gift, Share2, Loader2 } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ReferralProgram = () => {
  const { user } = useAuth();
  const { referralCode, referralUrl, isLoading, totalReferred, pendingReferrals, createReferralCode } = useReferrals();
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await createReferralCode();
    setIsCreating(false);
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join HINJD Ecosystem Hub',
          text: 'Get 20% off your first month with my referral link!',
          url: referralUrl,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Gift className="w-10 h-10 mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground mb-3">Sign in to access the referral program</p>
          <Link to="/auth">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Referral Program
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Invite friends and both get <span className="text-primary font-semibold">20% off</span> the first month!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Your referral code</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-primary flex-1">{referralCode}</code>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating} className="w-full">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
              Generate Referral Code
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{totalReferred}</p>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Gift className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">{pendingReferrals}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0 text-xs">1</Badge>
              Share your unique referral link
            </li>
            <li className="flex gap-2">
              <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0 text-xs">2</Badge>
              Friend signs up using your link
            </li>
            <li className="flex gap-2">
              <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0 text-xs">3</Badge>
              Both of you get 20% off first month
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralProgram;
