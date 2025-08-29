import React, { useState, useEffect } from 'react'
import { db } from '@/lib/database'
import { useNavigation } from '@/hooks/useNavigation'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import { useSyncManager } from '@/hooks/useSyncManager'
import LoginForm from '@/components/auth/LoginForm'
import RoleBasedAccess from '@/components/auth/RoleBasedAccess'
import LandingPage from '@/components/landing/LandingPage'
import { SyncStatusCard } from '@/components/common/SyncStatus'
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

// Hospital components
import Dashboard from '@/components/hospital/Dashboard'
import PatientManagement from '@/components/hospital/PatientManagement'
import AppointmentScheduling from '@/components/hospital/AppointmentScheduling'
import MedicalRecords from '@/components/hospital/MedicalRecords'
import EnhancedBillingSystem from '@/components/hospital/EnhancedBillingSystem'
import InventoryManagement from '@/components/hospital/InventoryManagement'
import DoctorSchedule from '@/components/hospital/DoctorSchedule'
import LabManagement from '@/components/hospital/LabManagement'
import BedManagement from '@/components/hospital/BedManagement'
import UserManagement from '@/components/auth/UserManagement'
import NotificationCenter from '@/components/hospital/NotificationCenter'

function App() {
  const { user, isAuthenticated, logout, hasPermission } = useAuth()
  const { activeTab, setActiveTab, navigateToDashboard } = useNavigation()
  const { syncState } = useSyncManager()

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

  // Debug authentication state changes
  useEffect(() => {
    console.log('App component - Auth state changed:', {
      isAuthenticated,
      user: user?.name,
      role: user?.role,
      activeTab
    });
  }, [isAuthenticated, user, activeTab])

  // Show login form when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <LoginForm onLogin={() => {
          console.log('Login callback triggered, navigating to dashboard');
          navigateToDashboard();
        }} />
      </div>
    )
  }

  // Filter tabs based on user permissions
  const availableTabs = [
    { id: 'landing', label: 'Home', icon: HouseIcon, module: 'dashboard' },
    { id: 'dashboard', label: 'Dashboard', icon: PulseIcon, module: 'dashboard' },
    { id: 'patients', label: 'Patients', icon: UsersIcon, module: 'patients' },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon, module: 'appointments' },
    { id: 'doctors', label: 'Doctors', icon: UserCircleIcon, module: 'doctors' },
    { id: 'records', label: 'Records', icon: FileTextIcon, module: 'medical_records' },
    { id: 'lab', label: 'Lab', icon: TestTubeIcon, module: 'lab_tests' },
    { id: 'beds', label: 'Beds', icon: BedIcon, module: 'beds' },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon, module: 'billing' },
    { id: 'inventory', label: 'Inventory', icon: PackageIcon, module: 'inventory' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, module: 'notifications' },
    { id: 'users', label: 'Users', icon: ShieldIcon, module: 'user_management', requiresRole: 'super_admin' }
  ].filter(tab => {
    // Always show landing page
    if (tab.id === 'landing') return true;

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

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />
      case 'dashboard':
        return <Dashboard />
      case 'patients':
        return (
          <RoleBasedAccess requiredModule="patients">
            <PatientManagement />
          </RoleBasedAccess>
        )
      case 'appointments':
        return (
          <RoleBasedAccess requiredModule="appointments">
            <AppointmentScheduling />
          </RoleBasedAccess>
        )
      case 'records':
        return (
          <RoleBasedAccess requiredModule="medical_records">
            <MedicalRecords />
          </RoleBasedAccess>
        )
      case 'doctors':
        return (
          <RoleBasedAccess requiredModule="doctors">
            <DoctorSchedule />
          </RoleBasedAccess>
        )
      case 'lab':
        return (
          <RoleBasedAccess requiredModule="lab_tests">
            <LabManagement />
          </RoleBasedAccess>
        )
      case 'beds':
        return (
          <RoleBasedAccess requiredModule="beds">
            <BedManagement />
          </RoleBasedAccess>
        )
      case 'billing':
        return (
          <RoleBasedAccess requiredModule="billing">
            <EnhancedBillingSystem />
          </RoleBasedAccess>
        )
      case 'inventory':
        return (
          <RoleBasedAccess requiredModule="inventory">
            <InventoryManagement />
          </RoleBasedAccess>
        )
      case 'notifications':
        return <NotificationCenter />
      case 'users':
        return <UserManagement />
      default:
        return <Dashboard />
    }
  }

  const getPageTitle = () => {
    const currentTab = availableTabs.find(tab => tab.id === activeTab)
    if (!currentTab) return 'Dashboard'

    switch (activeTab) {
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
      default: return currentTab.label
    }
  }

  const getPageDescription = () => {
    switch (activeTab) {
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
                            isActive={activeTab === item.id}
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
            <SidebarMenu>
              <SidebarMenuItem>
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
                  {/* <SyncStatusCard /> */}
                  <Button variant="outline" size="sm" onClick={logout} className="w-full">
                    <SignOutIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
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
                  : 'bg-orange-100 text-orange-800'
                  }`}>
                  {syncState.isOnline ? (
                    <>
                      <CloudArrowUpIcon className="w-3 h-3" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiSlashIcon className="w-3 h-3" />
                      Offline
                    </>
                  )}
                  {syncState.pendingSync > 0 && (
                    <span className="ml-1">({syncState.pendingSync} pending)</span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Offline Warning Banner */}
          {!syncState.isOnline && (
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
              <div className="flex items-center gap-2 text-orange-800">
                <WifiSlashIcon className="w-4 h-4" />
                <p className="text-sm">
                  Working offline - Your changes are saved locally and will sync when connection is restored.
                </p>
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </SidebarProvider>
  )
}

export default App