import React, { useState, useEffect } from 'react'
import { db } from '@/lib/database'
import { initializeOfflineDB } from '@/hooks/useDatabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'
import RoleBasedAccess from '@/components/auth/RoleBasedAccess'
import LandingPage from '@/components/landing/LandingPage'
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  Package,
  Pulse,
  Heart,
  UserCircle,
  TestTube,
  Bed,
  SignOut,
  Shield,
  Gear,
  Bell,
  House,
  WifiSlash,
  CloudArrowUp
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
  const [activeTab, setActiveTab] = useState('landing')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { user, isAuthenticated, logout, hasPermission } = useAuth()

  // Initialize database on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.initialize()
        await initializeOfflineDB()
        console.log('Database initialized successfully')
      } catch (error) {
        console.error('Failed to initialize database:', error)
      }
    }

    initializeApp()

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    if (activeTab === 'landing') {
      return (
        <div>
          <LandingPage />
          <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={() => setActiveTab('login')} size="lg">
              <Heart className="w-4 h-4 mr-2" />
              Access Hospital System
            </Button>
          </div>
        </div>
      )
    }
    return <LoginForm onLogin={() => {
      // After successful login, redirect to dashboard
      setActiveTab('dashboard')
    }} />
  }

  // Auto-redirect to dashboard on first login if on landing
  useEffect(() => {
    if (isAuthenticated && activeTab === 'landing') {
      setActiveTab('dashboard')
    }
  }, [isAuthenticated, activeTab])

  // Filter tabs based on user permissions
  const availableTabs = [
    { id: 'landing', label: 'Home', icon: House, module: 'dashboard' },
    { id: 'dashboard', label: 'Dashboard', icon: Pulse, module: 'dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, module: 'patients' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, module: 'appointments' },
    { id: 'doctors', label: 'Doctors', icon: UserCircle, module: 'doctors' },
    { id: 'records', label: 'Records', icon: FileText, module: 'medical_records' },
    { id: 'lab', label: 'Lab', icon: TestTube, module: 'lab_tests' },
    { id: 'beds', label: 'Beds', icon: Bed, module: 'beds' },
    { id: 'billing', label: 'Billing', icon: CreditCard, module: 'billing' },
    { id: 'inventory', label: 'Inventory', icon: Package, module: 'inventory' },
    { id: 'notifications', label: 'Notifications', icon: Bell, module: 'notifications' },
    { id: 'users', label: 'Users', icon: Shield, module: 'user_management', requiresRole: 'super_admin' }
  ].filter(tab => {
    // Always show landing page
    if (tab.id === 'landing') return true;

    // Check module permission
    if (!hasPermission(tab.module, 'read')) return false;

    // Check role requirement if specified
    if (tab.requiresRole && user?.role !== tab.requiresRole) return false;

    return true;
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
                <Heart className="w-6 h-6" weight="fill" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MedCare Rural</h1>
                <p className="text-sm text-muted-foreground">Hospital Management System</p>
              </div>
            </div>

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
                }`}>
                {isOnline ? (
                  <>
                    <CloudArrowUp className="w-3 h-3" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiSlash className="w-3 h-3" />
                    Offline
                  </>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'USER'}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <SignOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">-</span>
              <span className="text-muted-foreground">Total Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="font-medium">-</span>
              <span className="text-muted-foreground">Today's Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <Pulse className="w-4 h-4 text-destructive" />
              <span className="font-medium">-</span>
              <span className="text-muted-foreground">Active Consultations</span>
            </div>
            {!isOnline && (
              <div className="flex items-center gap-2 text-orange-600">
                <WifiSlash className="w-4 h-4" />
                <span className="text-muted-foreground">Working Offline - Changes will sync when online</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-12 lg:w-fit">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="landing" className="space-y-6">
            <LandingPage />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of hospital operations</p>
              </div>
            </div>
            <Dashboard />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Patient Management</h2>
                <p className="text-muted-foreground">Manage patient records and information</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="patients">
              <PatientManagement />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Appointment Scheduling</h2>
                <p className="text-muted-foreground">Schedule and manage patient appointments</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="appointments">
              <AppointmentScheduling />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Medical Records</h2>
                <p className="text-muted-foreground">Electronic medical records and consultation notes</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="medical_records">
              <MedicalRecords />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Doctor Schedule Management</h2>
                <p className="text-muted-foreground">Manage doctor schedules, availability and shifts</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="doctors">
              <DoctorSchedule />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="lab" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Laboratory Management</h2>
                <p className="text-muted-foreground">Order tests, track results and generate reports</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="lab_tests">
              <LabManagement />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="beds" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Bed Management</h2>
                <p className="text-muted-foreground">Track bed occupancy and room assignments</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="beds">
              <BedManagement />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Billing & Invoicing</h2>
                <p className="text-muted-foreground">Manage billing, payments and financial records</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="billing">
              <EnhancedBillingSystem />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
                <p className="text-muted-foreground">Track medical supplies and medications</p>
              </div>
            </div>
            <RoleBasedAccess requiredModule="inventory">
              <InventoryManagement />
            </RoleBasedAccess>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground">Manage hospital staff access and permissions</p>
              </div>
            </div>
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default App