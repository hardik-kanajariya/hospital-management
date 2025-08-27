import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react'

export default function Dashboard() {
  const [patients] = useKV('hospital-patients', [])
  const [appointments] = useKV('hospital-appointments', [])
  const [todayAppointments] = useKV('today-appointments', [])
  const [bills] = useKV('hospital-bills', [])
  const [inventory] = useKV('hospital-inventory', [])

  // Calculate dashboard statistics
  const today = new Date().toISOString().split('T')[0]
  const todayBills = bills.filter(bill => bill.date && bill.date.startsWith(today))
  const todayRevenue = todayBills.reduce((sum, bill) => sum + (bill.total || 0), 0)
  
  const lowStockItems = inventory.filter(item => 
    item.quantity !== undefined && 
    item.reorderLevel !== undefined && 
    item.quantity <= item.reorderLevel
  )
  
  const upcomingAppointments = appointments
    .filter(apt => apt.date && apt.date >= today && apt.status === 'scheduled')
    .sort((a, b) => new Date((a.date || '') + ' ' + (a.time || '')) - new Date((b.date || '') + ' ' + (b.time || '')))
    .slice(0, 5)

  const recentPatients = patients
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              +{patients.filter(p => p.createdAt && p.createdAt >= today).length} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {appointments.filter(apt => apt.status === 'completed' && apt.date === today).length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayBills.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          Dr. {appointment.doctor} • {appointment.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{appointment.type}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Patients
            </CardTitle>
            <CardDescription>Newly registered patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent patients</p>
              ) : (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-3 p-2 border rounded">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Age {patient.age} • {patient.gender}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Items that need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <Badge variant="destructive">{item.quantity} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              New Patient
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Heart className="h-6 w-6" />
              Start Consultation
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              Generate Bill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}