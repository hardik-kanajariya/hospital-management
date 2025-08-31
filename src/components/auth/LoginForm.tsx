import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_CONFIGS } from '@/types/auth';
import { HospitalIcon, SignInIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { EyeIcon } from 'lucide-react';

interface LoginFormProps {
  onLogin?: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from the location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const result = await login(email, password);


      if (result) {
        toast.success('Login successful!');

        // Call the onLogin callback if provided (for backward compatibility)
        onLogin?.();

        // The useAuth hook will handle the page refresh automatically
      } else {
        toast.error(result || 'Login failed');
      }
    } catch (error) {
      console.error('LoginForm: Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const demoAccounts = [
    { role: 'super_admin', email: 'admin@medcare.com', label: 'Super Admin' },
    { role: 'doctor', email: 'dr.sharma@medcare.com', label: 'Doctor' },
    { role: 'billing_manager', email: 'billing@medcare.com', label: 'Billing Manager' },
    { role: 'nurse', email: 'nurse@medcare.com', label: 'Nurse' },
    { role: 'lab_technician', email: 'lab@medcare.com', label: 'Lab Technician' },
    { role: 'pharmacist', email: 'pharmacy@medcare.com', label: 'Pharmacist' },
    { role: 'medical_store_manager', email: 'store@medcare.com', label: 'Store Manager' },
    { role: 'receptionist', email: 'reception@medcare.com', label: 'Receptionist' }
  ];

  const fillDemoCredentials = (email: string) => {
    setEmail(email);
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mx-auto">
              <HospitalIcon className="w-8 h-8" weight="fill" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">MedCare Rural</CardTitle>
              <p className="text-muted-foreground">Hospital Management System</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SignInIcon className="w-4 h-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Demo Accounts</CardTitle>
            <p className="text-muted-foreground">
              Try different user roles to explore the system features
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {demoAccounts.map((account) => {
                const roleConfig = ROLE_CONFIGS.find(r => r.role === account.role);
                return (
                  <div
                    key={account.email}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={account.role === 'super_admin' ? 'destructive' : 'secondary'}
                        className="min-w-fit"
                      >
                        {account.label}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{account.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Access Level: {roleConfig?.accessLevel}/10
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(account.email)}
                    >
                      Use Account
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                All demo accounts use password: <span className="font-mono font-semibold">admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}