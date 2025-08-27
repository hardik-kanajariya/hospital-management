import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Package, 
  UserPlus, 
  CalendarPlus,
  Activity,
  Heart,
  Stethoscope,
  UserCircle,
  TestTube,
  Bed,
  SignOut
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [patients] = useKV('hospital-patients', [])
  const [appointments] = useKV('hospital-appointments', [])
  const [todayAppointments] = useKV('today-appointments', [])
  const { user, isAuthenticated, logout, canAccessModule } = useAuth()

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm onLogin={() => {}} />
  }

  const stats = {
    totalPatients: patients.length,
    todayAppointments: todayAppointments.length,
    pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
    activeConsultations: appointments.filter(apt => apt.status === 'in-progress').length
  }

  // Filter tabs based on user permissions
  const availableTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, module: 'dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, module: 'patients' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, module: 'appointments' },
    { id: 'doctors', label: 'Doctors', icon: UserCircle, module: 'doctors' },
    { id: 'records', label: 'Records', icon: FileText, module: 'medical_records' },
    { id: 'lab', label: 'Lab', icon: TestTube, module: 'lab_tests' },
    { id: 'beds', label: 'Beds', icon: Bed, module: 'beds' },
    { id: 'billing', label: 'Billing', icon: CreditCard, module: 'billing' },
    { id: 'inventory', label: 'Inventory', icon: Package, module: 'inventory' }
  ].filter(tab => canAccessModule(tab.module))

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
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role.replace('_', ' ')}</p>
              </div>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
              <span className="font-medium">{stats.totalPatients}</span>
              <span className="text-muted-foreground">Total Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="font-medium">{stats.todayAppointments}</span>
              <span className="text-muted-foreground">Today's Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-destructive" />
              <span className="font-medium">{stats.activeConsultations}</span>
              <span className="text-muted-foreground">Active Consultations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 lg:w-fit">
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

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Patient Management</h2>
                <p className="text-muted-foreground">Manage patient records and information</p>
              </div>
            </div>
            <PatientManagement />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Appointment Scheduling</h2>
                <p className="text-muted-foreground">Schedule and manage patient appointments</p>
              </div>
            </div>
            <AppointmentScheduling />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Medical Records</h2>
                <p className="text-muted-foreground">Electronic medical records and consultation notes</p>
              </div>
            </div>
            <MedicalRecords />
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Doctor Schedule Management</h2>
                <p className="text-muted-foreground">Manage doctor schedules, availability and shifts</p>
              </div>
            </div>
            <DoctorSchedule />
          </TabsContent>

          <TabsContent value="lab" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Laboratory Management</h2>
                <p className="text-muted-foreground">Order tests, track results and generate reports</p>
              </div>
            </div>
            <LabManagement />
          </TabsContent>

          <TabsContent value="beds" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Bed Management</h2>
                <p className="text-muted-foreground">Track bed occupancy and room assignments</p>
              </div>
            </div>
            <BedManagement />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Billing & Invoicing</h2>
                <p className="text-muted-foreground">Manage billing, payments and financial records</p>
              </div>
            </div>
            <EnhancedBillingSystem />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
                <p className="text-muted-foreground">Track medical supplies and medications</p>
              </div>
            </div>
            <InventoryManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App