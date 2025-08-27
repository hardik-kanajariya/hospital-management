import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_CONFIGS } from '@/types/auth';
import { Eye, EyeSlash, SignIn, Hospital } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      onLogin();
    } else {
      toast.error(result.error || 'Login failed');
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
    setPassword('demo123');
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4\">\n      <div className=\"w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center\">\n        {/* Login Form */}\n        <Card className=\"w-full max-w-md mx-auto shadow-xl\">\n          <CardHeader className=\"space-y-4 text-center\">\n            <div className=\"flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mx-auto\">\n              <Hospital className=\"w-8 h-8\" weight=\"fill\" />\n            </div>\n            <div>\n              <CardTitle className=\"text-2xl font-bold\">MedCare Rural</CardTitle>\n              <p className=\"text-muted-foreground\">Hospital Management System</p>\n            </div>\n          </CardHeader>\n          \n          <CardContent className=\"space-y-6\">\n            <form onSubmit={handleSubmit} className=\"space-y-4\">\n              <div className=\"space-y-2\">\n                <Label htmlFor=\"email\">Email Address</Label>\n                <Input\n                  id=\"email\"\n                  type=\"email\"\n                  placeholder=\"Enter your email\"\n                  value={email}\n                  onChange={(e) => setEmail(e.target.value)}\n                  className=\"h-11\"\n                  required\n                />\n              </div>\n              \n              <div className=\"space-y-2\">\n                <Label htmlFor=\"password\">Password</Label>\n                <div className=\"relative\">\n                  <Input\n                    id=\"password\"\n                    type={showPassword ? 'text' : 'password'}\n                    placeholder=\"Enter your password\"\n                    value={password}\n                    onChange={(e) => setPassword(e.target.value)}\n                    className=\"h-11 pr-10\"\n                    required\n                  />\n                  <Button\n                    type=\"button\"\n                    variant=\"ghost\"\n                    size=\"sm\"\n                    className=\"absolute right-0 top-0 h-11 px-3\"\n                    onClick={() => setShowPassword(!showPassword)}\n                  >\n                    {showPassword ? <EyeSlash className=\"w-4 h-4\" /> : <Eye className=\"w-4 h-4\" />}\n                  </Button>\n                </div>\n              </div>\n              \n              <Button \n                type=\"submit\" \n                className=\"w-full h-11\" \n                disabled={isLoading}\n              >\n                {isLoading ? (\n                  <div className=\"flex items-center gap-2\">\n                    <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-white\"></div>\n                    Signing in...\n                  </div>\n                ) : (\n                  <div className=\"flex items-center gap-2\">\n                    <SignIn className=\"w-4 h-4\" />\n                    Sign In\n                  </div>\n                )}\n              </Button>\n            </form>\n          </CardContent>\n        </Card>\n\n        {/* Demo Accounts */}\n        <Card className=\"shadow-xl\">\n          <CardHeader>\n            <CardTitle className=\"text-xl\">Demo Accounts</CardTitle>\n            <p className=\"text-muted-foreground\">\n              Try different user roles to explore the system features\n            </p>\n          </CardHeader>\n          \n          <CardContent className=\"space-y-4\">\n            <div className=\"grid gap-3\">\n              {demoAccounts.map((account) => {\n                const roleConfig = ROLE_CONFIGS.find(r => r.role === account.role);\n                return (\n                  <div\n                    key={account.email}\n                    className=\"flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors\"\n                  >\n                    <div className=\"flex items-center gap-3\">\n                      <Badge \n                        variant={account.role === 'super_admin' ? 'destructive' : 'secondary'}\n                        className=\"min-w-fit\"\n                      >\n                        {account.label}\n                      </Badge>\n                      <div>\n                        <p className=\"text-sm font-medium\">{account.email}</p>\n                        <p className=\"text-xs text-muted-foreground\">\n                          Access Level: {roleConfig?.accessLevel}/10\n                        </p>\n                      </div>\n                    </div>\n                    <Button\n                      variant=\"outline\"\n                      size=\"sm\"\n                      onClick={() => fillDemoCredentials(account.email)}\n                    >\n                      Use Account\n                    </Button>\n                  </div>\n                );\n              })}\n            </div>\n            \n            <div className=\"pt-4 border-t\">\n              <p className=\"text-xs text-muted-foreground text-center\">\n                All demo accounts use password: <span className=\"font-mono font-semibold\">demo123</span>\n              </p>\n            </div>\n          </CardContent>\n        </Card>\n      </div>\n    </div>\n  );\n}