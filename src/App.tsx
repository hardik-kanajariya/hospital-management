import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { db } from '@/lib/database'
import { useNavigation } from '@/hooks/useNavigation'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import { useSyncManager } from '@/hooks/useSyncManager'
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
  CloudArrowUpIcon
} from '@phosphor-icons/react'

function App() {
  const { user, isAuthenticated, logout, hasPermission } = useAuth()
  const { activeTab, setActiveTab } = useNavigation()
  const { syncState } = useSyncManager()
  const location = useLocation()

  // Initialize database on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the main database instance
        await db.initialize()
        console.log('Database initialized successfully')
      } catch (error) {
        console.error('Failed to initialize database:', error)
      }
    }

    initializeApp()
  }, [])

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

  // Filter tabs based on user permissions
  const availableTabs = [
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
    { id: 'notifications', label: 'Notifications', icon: BellIcon, module: 'notifications', path: '/notifications' },
    { id: 'users', label: 'Users', icon: ShieldIcon, module: 'user_management', path: '/users', requiresRole: 'super_admin' }
  ].filter(tab => {
    // Always show landing and dashboard
    if (['landing', 'dashboard'].includes(tab.id)) return true;

    // Check module permission
    if (!hasPermission(tab.module, 'read')) return false;

    // Check role requirement if specified
    if (tab.requiresRole && user?.role !== tab.requiresRole) return false;

    return true;
  })

  // Group navigation items by category
  const navigationGroups = [
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
      items: availableTabs.filter(tab => ['billing', 'notifications', 'users'].includes(tab.id))
    }
  ].filter(group => group.items.length > 0)

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
      case 'landing': return 'Welcome to MedCare Rural Hospital Management System'
      default: return 'Hospital management system'
    }
  }

  return (
    <SidebarProvider>
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
                            onClick={() => setActiveTab(item.id)}
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
                    {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'USER'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="w-full">
                <SignOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
                  <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
                </div>
              </div>

              {/* Connection Status for larger screens */}
              <div className="hidden sm:flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${syncState.isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {syncState.isOnline ? (
                    <>
                      <CloudArrowUpIcon className="w-3 h-3" />
                      {import.meta.env.VITE_OFFLINE_ENABLED === 'false' ? 'Online-Only Mode' : 'Online'}
                    </>
                  ) : (
                    <>
                      <WifiSlashIcon className="w-3 h-3" />
                      Connection Required
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Offline Warning Banner */}
          {!syncState.isOnline && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3">
              <div className="flex items-center gap-2 text-red-800">
                <WifiSlashIcon className="w-4 h-4" />
                <p className="text-sm">
                  <strong>Internet connection required</strong> - This application requires an active internet connection to function. Please check your connection and refresh the page.
                </p>
              </div>
            </div>
          )}

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