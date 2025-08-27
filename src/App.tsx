import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Stethoscope
} from '@phosphor-icons/react'

import PatientManagement from '@/components/hospital/PatientManagement'
import AppointmentScheduling from '@/components/hospital/AppointmentScheduling'
import MedicalRecords from '@/components/hospital/MedicalRecords'
import BillingSystem from '@/components/hospital/BillingSystem'
import InventoryManagement from '@/components/hospital/InventoryManagement'
import Dashboard from '@/components/hospital/Dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [patients] = useKV('hospital-patients', [])
  const [appointments] = useKV('hospital-appointments', [])
  const [todayAppointments] = useKV('today-appointments', [])

  const stats = {
    totalPatients: patients.length,
    todayAppointments: todayAppointments.length,
    pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
    activeConsultations: appointments.filter(apt => apt.status === 'in-progress').length
  }

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
                <p className="text-sm font-medium">Dr. Sarah Patel</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                SP
              </div>
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
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Patients</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Records</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
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

          <TabsContent value="billing" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Billing & Invoicing</h2>
                <p className="text-muted-foreground">Manage billing, payments and financial records</p>
              </div>
            </div>
            <BillingSystem />
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