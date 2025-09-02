import React, { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useNavigation } from '@/hooks/useNavigation'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@phosphor-icons/react'

interface TabItem {
  id: string
  label: string
  icon: Icon
  module: string
  path: string
  requiresRole?: string
}
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  PackageIcon,
  PulseIcon,
  HeartIcon,
  UserCircleIcon,
  TestTubeIcon,
  BedIcon,
  SignOutIcon,
  ShieldIcon,
  BellIcon,
  HouseIcon,
  WifiSlashIcon,
  CloudArrowUpIcon,
  StackIcon,
  KeyIcon
} from '@phosphor-icons/react'

function App() {
  const { user, isAuthenticated, logout, hasPermission } = useAuth()
  const { activeTab, setActiveTab } = useNavigation()
  const location = useLocation()
  const navigate = useNavigate()

  // Handle logout with page refresh
  const handleLogout = async () => {
    await logout(); // This will trigger page refresh automatically
  };

  // Filter tabs based on user permissions (memoized for performance)
  // Always define this hook, even if user is not authenticated
  const availableTabs = useMemo(() => {
    if (!isAuthenticated || !user) return [];

    // Check if user is super admin
    const isSuperAdmin = typeof user.role === 'object'
      ? user.role?.name === 'super_admin'
      : user.role === 'super_admin';

    const tabs: TabItem[] = [
      { id: 'landing', label: 'Home', icon: HouseIcon, module: 'dashboard', path: '/landing' },
      { id: 'dashboard', label: 'Dashboard', icon: PulseIcon, module: 'dashboard', path: '/dashboard' },
      { id: 'patients', label: 'Patients', icon: UsersIcon, module: 'patients', path: '/patients' },
      { id: 'appointments', label: 'Appointments', icon: CalendarIcon, module: 'appointments', path: '/appointments' },
      { id: 'doctors', label: 'Doctors', icon: UserCircleIcon, module: 'doctors', path: '/doctors' },
      { id: 'records', label: 'Records', icon: FileTextIcon, module: 'medical_records', path: '/records' },
      { id: 'lab', label: 'Lab', icon: TestTubeIcon, module: 'lab_tests', path: '/lab' },
      { id: 'beds', label: 'Beds', icon: BedIcon, module: 'beds', path: '/beds' },
      { id: 'billing', label: 'Billing', icon: CreditCardIcon, module: 'billing', path: '/billing' },
      { id: 'inventory', label: 'Inventory', icon: PackageIcon, module: 'inventory', path: '/inventory' },
      { id: 'notifications', label: 'Notifications', icon: BellIcon, module: 'notifications', path: '/notifications' }
    ];

    // Add super admin specific tabs
    if (isSuperAdmin) {
      tabs.push(
        { id: 'admin', label: 'Dashboard', icon: ShieldIcon, module: 'admin', path: '/admin', requiresRole: 'super_admin' },
        { id: 'admin-roles', label: 'Roles', icon: KeyIcon, module: 'roles', path: '/admin/roles', requiresRole: 'super_admin' },
        { id: 'users', label: 'Users', icon: UsersIcon, module: 'user_management', path: '/users', requiresRole: 'super_admin' },
        { id: 'masters', label: 'Masters', icon: StackIcon, module: 'masters', path: '/masters', requiresRole: 'super_admin' }
      );
    }

    return tabs.filter(tab => {
      // Always show landing and dashboard
      if (['landing', 'dashboard'].includes(tab.id)) return true;

      // Check module permission with 'read' action
      console.log('Filtering tab:', tab.id, 'module:', tab.module);
      const hasAccess = hasPermission(tab.module, 'read');
      console.log('Tab access result:', { tabId: tab.id, module: tab.module, hasAccess });

      if (!hasAccess) return false;

      // Check role requirement if specified
      if (tab.requiresRole && !isSuperAdmin) return false;

      return true;
    });
  }, [isAuthenticated, user, hasPermission]);

  // Group navigation items by category (memoized)
  // Always define this hook, even if availableTabs is empty
  const navigationGroups = useMemo(() => {
    const groups = [
      {
        label: 'Overview',
        items: availableTabs.filter(tab => ['landing', 'dashboard'].includes(tab.id))
      },
      {
        label: 'Patient Care',
        items: availableTabs.filter(tab => ['patients', 'appointments', 'records', 'lab'].includes(tab.id))
      },
      {
        label: 'Operations',
        items: availableTabs.filter(tab => ['doctors', 'beds', 'inventory'].includes(tab.id))
      },
      {
        label: 'Administration',
        items: availableTabs.filter(tab => ['billing', 'notifications'].includes(tab.id))
      },
      {
        label: 'Super Admin',
        items: availableTabs.filter(tab => ['users', 'admin', 'admin-roles'].includes(tab.id))
      }
    ];

    return groups.filter(group => group.items.length > 0);
  }, [availableTabs]);

  // Helper functions (also moved before conditional returns)
  const getPageTitle = () => {
    const currentPath = location.pathname.slice(1)
    switch (currentPath) {
      case 'dashboard': return 'Dashboard'
      case 'patients': return 'Patient Management'
      case 'appointments': return 'Appointment Scheduling'
      case 'records': return 'Medical Records'
      case 'doctors': return 'Doctor Schedule Management'
      case 'lab': return 'Laboratory Management'
      case 'beds': return 'Bed Management'
      case 'billing': return 'Billing & Invoicing'
      case 'inventory': return 'Inventory Management'
      case 'notifications': return 'Notification Center'
      case 'users': return 'User Management'
      case 'admin': return 'Super Admin Dashboard'
      case 'admin/roles': return 'Role Management'
      case 'masters': return 'Masters Management'
      case 'landing': return 'Home'
      default: return 'Hospital Management'
    }
  }

  const getPageDescription = () => {
    const currentPath = location.pathname.slice(1)
    switch (currentPath) {
      case 'dashboard': return 'Overview of hospital operations'
      case 'patients': return 'Manage patient records and information'
      case 'appointments': return 'Schedule and manage patient appointments'
      case 'records': return 'Electronic medical records and consultation notes'
      case 'doctors': return 'Manage doctor schedules, availability and shifts'
      case 'lab': return 'Order tests, track results and generate reports'
      case 'beds': return 'Track bed occupancy and room assignments'
      case 'billing': return 'Manage billing, payments and financial records'
      case 'inventory': return 'Track medical supplies and medications'
      case 'notifications': return 'Send and track SMS and email notifications'
      case 'users': return 'Manage hospital staff access and permissions'
      case 'admin': return 'System administration and configuration'
      case 'admin/roles': return 'Configure roles and permissions'
      case 'masters': return ''
      case 'landing': return 'Welcome to MedCare Rural Hospital Management System'
      default: return 'Hospital management system'
    }
  }

  // NOW we can do conditional returns after all hooks are defined

  // Show minimal layout for login page
  if (location.pathname === '/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Outlet />
        <Toaster />
      </div>
    )
  }

  // Show minimal layout for landing page
  if (location.pathname === '/landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Outlet />
        <Toaster />
      </div>
    )
  }

  // If user is not authenticated and tries to access protected routes, 
  // let ProtectedRoute handle the redirect
  if (!isAuthenticated && !['/login', '/landing', '/'].includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Outlet />
        <Toaster />
      </div>
    )
  }

  return (
    <SidebarProvider key={isAuthenticated ? user?.id || 'authenticated' : 'unauthenticated'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar variant="inset">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
                <HeartIcon className="w-5 h-5" weight="fill" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground truncate">MedCare Rural</h1>
                <p className="text-xs text-muted-foreground truncate">Hospital Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => navigate(item.path)}
                            isActive={location.pathname === item.path}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t">
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user ? (
                      typeof user.role === 'object'
                        ? user.role?.displayName || 'USER'
                        : typeof user.role === 'string'
                          ? (user.role as string).replace('_', ' ').toUpperCase()
                          : 'USER'
                    ) : 'USER'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                <SignOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Enhanced Header */}
          <header className="border-b bg-gradient-to-r from-card/80 to-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex items-center justify-between min-h-20 px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center gap-4">
                  {/* Page Icon */}
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl">
                    {(() => {
                      const currentPath = location.pathname.slice(1)
                      switch (currentPath) {
                        case 'dashboard': return <PulseIcon className="w-6 h-6" />
                        case 'patients': return <UsersIcon className="w-6 h-6" />
                        case 'appointments': return <CalendarIcon className="w-6 h-6" />
                        case 'records': return <FileTextIcon className="w-6 h-6" />
                        case 'doctors': return <UserCircleIcon className="w-6 h-6" />
                        case 'lab': return <TestTubeIcon className="w-6 h-6" />
                        case 'beds': return <BedIcon className="w-6 h-6" />
                        case 'billing': return <CreditCardIcon className="w-6 h-6" />
                        case 'inventory': return <PackageIcon className="w-6 h-6" />
                        case 'notifications': return <BellIcon className="w-6 h-6" />
                        case 'users': return <UsersIcon className="w-6 h-6" />
                        case 'admin': return <ShieldIcon className="w-6 h-6" />
                        case 'admin/roles': return <KeyIcon className="w-6 h-6" />
                        case 'masters': return <StackIcon className="w-6 h-6" />
                        case 'landing': return <HouseIcon className="w-6 h-6" />
                        default: return <HouseIcon className="w-6 h-6" />
                      }
                    })()}
                  </div>

                  {/* Page Title and Description */}
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
                    <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
                  </div>
                </div>
              </div>

              {/* Header Actions Area */}
              <div className="flex items-center gap-3">
                {/* Current Date & Time */}
                <div className="hidden md:flex flex-col items-end text-right">
                  <p className="text-sm font-medium text-foreground">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* User Info Badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user ? (
                        typeof user.role === 'object'
                          ? user.role?.displayName || 'USER'
                          : typeof user.role === 'string'
                            ? (user.role as string).replace('_', ' ').toUpperCase()
                            : 'USER'
                      ) : 'USER'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </SidebarProvider>
  )
}

export default App