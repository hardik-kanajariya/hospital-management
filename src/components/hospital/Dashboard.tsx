import { useKV } from '@/hooks/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Patient, Appointment, Bill, InventoryItem } from '@/types/hospital'
import {
  UsersIcon,
  CalendarIcon,
  CreditCardIcon,
  HeartIcon,
  ClockIcon,
  WarningIcon,
  BellIcon,
  StethoscopeIcon,
  TestTubeIcon,
} from '@phosphor-icons/react';

export default function Dashboard() {
  const { user, hasPermission } = useAuth()
  const { getNotificationHistory } = useNotifications()
  const [patients] = useKV<Patient[]>('hospital-patients', [])
  const [appointments] = useKV<Appointment[]>('hospital-appointments', [])
  const [bills] = useKV<Bill[]>('hospital-bills', [])
  const [inventory] = useKV<InventoryItem[]>('hospital-inventory', [])

  const notifications = getNotificationHistory()
  const recentNotifications = notifications.slice(0, 5)

  // Calculate dashboard statistics
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(apt =>
    apt.appointmentDate === today
  )

  const todayBills = bills.filter(bill =>
    bill.billDate?.startsWith(today)
  )

  const todayRevenue = todayBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)

  const lowStockItems = inventory.filter(item =>
    item.quantity <= item.reorderLevel
  )

  const upcomingAppointments = appointments
    .filter(apt => apt.appointmentDate >= today && apt.status === 'scheduled')
    .sort((a, b) => new Date(a.appointmentDate + ' ' + a.appointmentTime).getTime() -
      new Date(b.appointmentDate + ' ' + b.appointmentTime).getTime())
    .slice(0, 5)

  const recentPatients = patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Role-specific welcome messages
  const getRoleSpecificWelcome = () => {
    switch (user?.role) {
      case 'super_admin':
        return "Monitor and manage all hospital operations from here."
      case 'doctor':
        return "Check your appointments and patient records for today."
      case 'billing_manager':
        return "Track billing, payments and financial operations."
      case 'nurse':
        return "Monitor patient care and upcoming appointments."
      case 'lab_technician':
        return "Check lab orders and manage test results."
      case 'pharmacist':
        return "Monitor inventory and prescription orders."
      case 'receptionist':
        return "Manage appointments and patient check-ins."
      default:
        return "Here's what's happening at your hospital today."
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">
            {getRoleSpecificWelcome()}
          </p>
        </div>
        <div className="text-right">
          <Badge variant={user?.role === 'super_admin' ? 'destructive' : 'secondary'} className="mb-2">
            {user?.role?.replace('_', ' ').toUpperCase()}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Key Metrics - Role Based */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Patients - Always show for most roles */}
        {hasPermission('patients', 'read') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>
        )}

        {/* Appointments - Show for doctors, nurses, receptionists, admins */}
        {hasPermission('appointments', 'read') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {appointments.filter(apt => apt.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>
        )}

        {/* Revenue - Show for billing managers and admins */}
        {hasPermission('billing', 'read') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{todayRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {todayBills.length} bills
              </p>
            </CardContent>
          </Card>
        )}

        {/* Inventory - Show for pharmacists, store managers, admins */}
        {hasPermission('inventory', 'read') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <WarningIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats for Role-Specific Information */}
      {user?.role === 'doctor' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Appointments Today</CardTitle>
              <StethoscopeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt =>
                  apt.appointmentDate === today && apt.doctorId === user.id
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Lab Results</CardTitle>
              <TestTubeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
              <HeartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Manager specific stats */}
      {user?.role === 'billing_manager' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bills.filter(bill => bill.status === 'pending' || bill.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <WarningIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{bills.filter(bill => bill.status === 'pending' || bill.status === 'overdue')
                  .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Unpaid bills
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pharmacist specific stats */}
      {user?.role === 'pharmacist' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
              <WarningIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Items need reorder
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                To be dispensed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventory.filter(item => {
                  const expiryDate = new Date(item.expiryDate || '');
                  const thirtyDaysFromNow = new Date();
                  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                  return expiryDate <= thirtyDaysFromNow;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Within 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Recent Patients
            </CardTitle>
            <CardDescription>Latest patient registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No patients registered yet
                </p>
              ) : (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{patient.mrNumber}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming appointments
                </p>
              ) : (
                upcomingAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.appointmentTime} • {appointment.type}
                        </p>
                      </div>
                      <Badge variant={
                        appointment.status === 'scheduled' ? 'default' :
                          appointment.status === 'in_progress' ? 'destructive' : 'secondary'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Latest system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications yet
                </p>
              ) : (
                recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      notification.status === 'sent' ? 'default' :
                        notification.status === 'failed' ? 'destructive' : 'secondary'
                    } className="text-xs">
                      {notification.status}
                    </Badge>
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
              <WarningIcon className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              Items that need immediate restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {item.quantity} / Reorder at: {item.reorderLevel}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Low
                  </Badge>
                </div>
              ))}
            </div>
            {lowStockItems.length > 6 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                +{lowStockItems.length - 6} more items need restocking
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
