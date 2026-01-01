import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Crown, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Badge } from '@/components/ui/badge';

const Account = () => {
  const { user, signOut } = useAuth();
  const { hasAccess, subscription } = useSubscription();
  const { openCustomerPortal, isLoading: portalLoading } = useStripeSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <User size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl industrial-title mb-4">Account Access</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to manage your account settings and subscription.
            </p>
            <Button asChild size="lg">
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl industrial-title mb-2">My Account</h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile and subscription
          </p>
        </div>

        {/* Profile Info */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User size={18} />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
              <Mail size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
              <Calendar size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Status */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Crown size={18} />
            Subscription
          </h2>
          <div className="p-4 rounded-xl bg-secondary/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasAccess ? 'bg-primary/20' : 'bg-muted'}`}>
                <Crown size={24} className={hasAccess ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{subscription?.plan_name || 'Free Plan'}</p>
                  {hasAccess && <Badge className="bg-primary/20 text-primary">Active</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasAccess ? 'Full access to all features' : 'Limited free diagnostics'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            {hasAccess ? (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={openCustomerPortal}
                disabled={portalLoading}
              >
                <Settings size={16} className="mr-2" />
                Manage Subscription
              </Button>
            ) : (
              <Button asChild className="flex-1">
                <Link to="/upgrade">
                  <Crown size={16} className="mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Settings size={18} />
            Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/saved-runs" 
              className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-center"
            >
              <p className="font-medium text-sm">Saved Runs</p>
            </Link>
            <Link 
              to="/legal" 
              className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-center"
            >
              <p className="font-medium text-sm">Legal</p>
            </Link>
          </div>
        </Card>

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default Account;
