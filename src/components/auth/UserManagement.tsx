import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { User, UserRole, Permission, ROLE_CONFIGS } from '@/types/auth';
import { toast } from 'sonner';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';
import {
  Users,
  Plus,
  Edit,
  Trash,
  Shield,
  UserCircle,
  Key,
  Eye,
  EyeSlash,
  Search
} from '@phosphor-icons/react';

export default function UserManagement() {
  const [users, setUsers] = useKV<User[]>('hospital-users', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<User>>({
    role: 'receptionist',
    isActive: true,
    permissions: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const { user: currentUser, hasPermission } = useAuth();

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      role: 'receptionist',
      isActive: true,
      permissions: []
    });
    setPassword('');
    setSelectedUser(null);
  };

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    const roleConfig = ROLE_CONFIGS.find(r => r.role === role);
    setFormData({
      ...formData,
      role,
      permissions: roleConfig?.permissions || []
    });
  };

  // Handle custom permission toggle
  const togglePermission = (module: string, action: 'create' | 'read' | 'update' | 'delete') => {
    const permissions = [...(formData.permissions || [])];
    const existingPermIndex = permissions.findIndex(p => p.module === module);
    
    if (existingPermIndex >= 0) {
      const existingPerm = permissions[existingPermIndex];
      if (existingPerm.actions.includes(action)) {
        // Remove action
        existingPerm.actions = existingPerm.actions.filter(a => a !== action);
        if (existingPerm.actions.length === 0) {
          permissions.splice(existingPermIndex, 1);
        }
      } else {
        // Add action
        existingPerm.actions.push(action);
      }
    } else {
      // Create new permission
      permissions.push({ module, actions: [action] });
    }
    
    setFormData({ ...formData, permissions });
  };

  // Check if user has specific permission
  const hasModulePermission = (module: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    const permissions = formData.permissions || [];
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  // Handle add/edit user
  const handleSubmit = () => {
    if (!formData.name || !formData.email || (!selectedUser && !password)) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if email already exists (for new users)
    if (!selectedUser && users.some(u => u.email === formData.email)) {
      toast.error('Email address already exists');
      return;
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: selectedUser?.id || crypto.randomUUID(),
      email: formData.email!,
      name: formData.name!,
      role: formData.role as UserRole,
      department: formData.department,
      isActive: formData.isActive ?? true,
      permissions: formData.permissions || [],
      createdAt: selectedUser?.createdAt || now,
      lastLogin: selectedUser?.lastLogin
    };

    if (selectedUser) {
      setUsers(currentUsers => 
        currentUsers.map(u => u.id === selectedUser.id ? newUser : u)
      );
      toast.success('User updated successfully');
    } else {
      setUsers(currentUsers => [...currentUsers, newUser]);
      toast.success(`User created successfully. Password: ${password}`);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own account');
      return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  // Toggle user status
  const toggleUserStatus = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot deactivate your own account');
      return;
    }

    setUsers(currentUsers =>
      currentUsers.map(u =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    );
    toast.success('User status updated');
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modules = [
    'dashboard', 'patients', 'appointments', 'medical_records', 'doctors',
    'lab_tests', 'beds', 'billing', 'inventory', 'reports'
  ];

  return (
    <div className="space-y-6">
      <RoleBasedAccess requiredRole="super_admin">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                generatePassword();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser ? 'Update user information and permissions' : 'Add a new staff member to the system'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                        disabled={!!selectedUser}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => handleRoleChange(value as UserRole)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_CONFIGS.map((config) => (
                            <SelectItem key={config.role} value={config.role}>
                              {config.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  {!selectedUser && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Generated Password</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-20"
                          />
                          <div className="absolute right-0 top-0 flex">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          <Key className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
                    />
                    <Label htmlFor="isActive">Active user account</Label>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Module Permissions</h3>
                  <div className="space-y-3">
                    {modules.map((module) => (
                      <div key={module} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium capitalize">{module.replace('_', ' ')}</h4>
                          <Badge variant="outline" className="text-xs">
                            {formData.permissions?.find(p => p.module === module)?.actions.length || 0} permissions
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {['create', 'read', 'update', 'delete'].map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${module}-${action}`}
                                checked={hasModulePermission(module, action as any)}
                                onCheckedChange={() => togglePermission(module, action as any)}
                              />
                              <Label htmlFor={`${module}-${action}`} className="text-xs capitalize">
                                {action}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {selectedUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.isActive).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctors</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'doctor').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'super_admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>
              Manage hospital staff access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first user'}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIGS.find(r => r.role === user.role);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{user.name}</h3>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {roleConfig?.displayName || user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{user.email}</span>
                            {user.department && <span>• {user.department}</span>}
                            <span>• Level {roleConfig?.accessLevel}/10</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.permissions.length} module permissions
                            {user.lastLogin && ` • Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedUser(user);
                            setFormData(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </RoleBasedAccess>
    </div>
  );
}