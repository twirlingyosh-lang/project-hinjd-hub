import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Crown, LogOut, Settings, 
  Shield, FileText, HelpCircle, ChevronRight 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const menuItems = [
  { icon: Crown, label: 'Subscription', path: '/app/upgrade', badge: 'Free' },
  { icon: Settings, label: 'Preferences', path: '#' },
  { icon: Shield, label: 'Privacy & Security', path: '/app/legal' },
  { icon: HelpCircle, label: 'Help & Support', path: '#' },
  { icon: FileText, label: 'Legal', path: '/app/legal' },
];

const AccountPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/app');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <AppLayout title="Account">
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to access your profile and settings
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Account">
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail size={14} />
                  {user.email}
                </p>
                <Badge variant="secondary" className="mt-2">Free Plan</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">AI Requests</p>
                <p className="text-xs text-primary">5 remaining</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Saved Runs</p>
                <p className="text-xs text-muted-foreground">Local storage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <Link to={item.path}>
                  <div className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-muted-foreground" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                      )}
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </div>
                  </div>
                </Link>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          Sign Out
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Aggregate Tools v1.0.0
        </p>
      </div>
    </AppLayout>
  );
};

export default AccountPage;
