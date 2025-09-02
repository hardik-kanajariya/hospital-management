/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Health check endpoints
router.get('/health', async () => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  }
})

router.get('/api/health', async () => {
  return {
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    database: 'connected'
  }
})

// API Routes
router.group(() => {

  // Authentication routes (public)
  router.group(() => {
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/refresh', '#controllers/auth_controller.refresh')
    // Add unprotected logout route for expired tokens
    router.post('/logout-force', '#controllers/auth_controller.logoutForce')
    router.get('/verify', '#controllers/auth_controller.verify').use(middleware.auth())
    router.get('/demo-accounts', '#controllers/auth_controller.getDemoAccounts')
  }).prefix('/auth')

  // Protected routes
  router.group(() => {

    // Auth routes (protected)
    router.group(() => {
      router.post('/logout', '#controllers/auth_controller.logout')
      router.get('/me', '#controllers/auth_controller.me')
    }).prefix('/auth')

    // User management routes
    router.group(() => {
      router.get('/', '#controllers/users_controller.index')
      router.get('/:id', '#controllers/users_controller.show')
      router.post('/', '#controllers/users_controller.store')
      router.put('/:id', '#controllers/users_controller.update')
      router.delete('/:id', '#controllers/users_controller.destroy')
    }).prefix('/users')

    // Organization management routes
    router.group(() => {
      router.get('/', '#controllers/organizations_controller.index')
      router.get('/:id', '#controllers/organizations_controller.show')
      router.get('/:id/stats', '#controllers/organizations_controller.stats')
      router.post('/', '#controllers/organizations_controller.store')
      router.put('/:id', '#controllers/organizations_controller.update')
      router.delete('/:id', '#controllers/organizations_controller.destroy')
    }).prefix('/organizations')

    // Patient management routes
    router.group(() => {
      router.get('/', '#controllers/patients_controller.index')
      router.get('/stats', '#controllers/patients_controller.stats')
      router.get('/search', '#controllers/patients_controller.search')
      router.get('/:id', '#controllers/patients_controller.show')
      router.post('/', '#controllers/patients_controller.store')
      router.put('/:id', '#controllers/patients_controller.update')
      router.delete('/:id', '#controllers/patients_controller.destroy')
      router.get('/:id/medical-history', '#controllers/patients_controller.medicalHistory')
      router.get('/:id/appointments', '#controllers/patients_controller.appointments')
      router.get('/:id/bills', '#controllers/patients_controller.bills')
    }).prefix('/patients')

    // Doctor management routes (now handled through users with doctor role)
    router.group(() => {
      // Get all doctors (users with doctor role)
      router.get('/', async ({ response }) => {
        const User = (await import('#models/user')).default
        try {
          const doctors = await User.query()
            .whereHas('role', (roleQuery) => {
              roleQuery.where('name', 'doctor').orWhere('displayName', 'Doctor')
            })
            .preload('role')

          const doctorsWithData = await Promise.all(
            doctors.map(async (doctor) => ({
              ...doctor.serialize(),
              roleData: await doctor.getRoleData()
            }))
          )

          return response.ok({
            success: true,
            data: doctorsWithData
          })
        } catch (error) {
          return response.badRequest({
            success: false,
            message: error.message
          })
        }
      })

      // Get specific doctor by user ID
      router.get('/:userId', async ({ params, response }) => {
        const User = (await import('#models/user')).default
        try {
          const doctor = await User.query()
            .where('id', params.userId)
            .whereHas('role', (roleQuery) => {
              roleQuery.where('name', 'doctor').orWhere('displayName', 'Doctor')
            })
            .preload('role')
            .first()

          if (!doctor) {
            return response.notFound({
              success: false,
              message: 'Doctor not found'
            })
          }

          const doctorProfile = await doctor.getCompleteProfile()

          return response.ok({
            success: true,
            data: doctorProfile
          })
        } catch (error) {
          return response.badRequest({
            success: false,
            message: error.message
          })
        }
      })

      // NOTE: Doctor creation/update is now handled through users controller with roleData
      // NOTE: Schedule and availability can be managed through role fields
    }).prefix('/doctors')

    // Doctor Schedule Management Routes
    router.group(() => {
      router.get('/', '#controllers/doctor_schedules_controller.index')
      router.get('/:id', '#controllers/doctor_schedules_controller.show')
      router.post('/', '#controllers/doctor_schedules_controller.store')
      router.put('/:id', '#controllers/doctor_schedules_controller.update')
      router.delete('/:id', '#controllers/doctor_schedules_controller.destroy')
    }).prefix('/doctor-schedules')

    // Doctor Availability Management Routes
    router.group(() => {
      router.get('/', '#controllers/doctor_availability_controller.index')
      router.get('/:id', '#controllers/doctor_availability_controller.show')
      router.post('/', '#controllers/doctor_availability_controller.store')
      router.put('/:id', '#controllers/doctor_availability_controller.update')
      router.delete('/:id', '#controllers/doctor_availability_controller.destroy')
      router.get('/date-range/check', '#controllers/doctor_availability_controller.getAvailabilityByDateRange')
      router.get('/check/status', '#controllers/doctor_availability_controller.checkAvailability')
    }).prefix('/doctor-availability')

    // Appointment management routes
    router.group(() => {
      router.get('/', '#controllers/appointments_controller.index')
      router.get('/:id', '#controllers/appointments_controller.show')
      router.post('/', '#controllers/appointments_controller.store')
      router.put('/:id', '#controllers/appointments_controller.update')
      router.delete('/:id', '#controllers/appointments_controller.destroy')
      router.get('/patient/:patientId', '#controllers/appointments_controller.byPatient')
      router.get('/doctor/:doctorId', '#controllers/appointments_controller.byDoctor')
      router.get('/date/:date', '#controllers/appointments_controller.byDate')
      router.post('/:id/check-in', '#controllers/appointments_controller.checkIn')
      router.post('/:id/check-out', '#controllers/appointments_controller.checkOut')
      router.post('/:id/cancel', '#controllers/appointments_controller.cancel')
      router.post('/:id/reschedule', '#controllers/appointments_controller.reschedule')
    }).prefix('/appointments')

    // Medical records routes
    router.group(() => {
      router.get('/', '#controllers/medical_records_controller.index')
      router.get('/search', '#controllers/medical_records_controller.search')
      router.post('/validate', '#controllers/medical_records_controller.validate')
      router.get('/:id', '#controllers/medical_records_controller.show')
      router.post('/', '#controllers/medical_records_controller.store')
      router.put('/:id', '#controllers/medical_records_controller.update')
      router.delete('/:id', '#controllers/medical_records_controller.destroy')
      router.get('/patient/:patientId', '#controllers/medical_records_controller.patientHistory')
      router.get('/patient/:patientId/statistics', '#controllers/medical_records_controller.statistics')
      router.get('/patient/:patientId/timeline', '#controllers/medical_records_controller.timeline')
      router.get('/patient/:patientId/vital-signs-trends', '#controllers/medical_records_controller.vitalSignsTrends')
      router.get('/patient/:patientId/alerts', '#controllers/medical_records_controller.alerts')
    }).prefix('/medical-records')

    // Billing routes
    router.group(() => {
      router.get('/', '#controllers/bills_controller.index')
      router.get('/:id', '#controllers/bills_controller.show')
      router.post('/', '#controllers/bills_controller.store')
      router.put('/:id', '#controllers/bills_controller.update')
      router.delete('/:id', '#controllers/bills_controller.destroy')
      router.get('/patient/:patientId', '#controllers/bills_controller.byPatient')
      router.post('/:id/payment', '#controllers/bills_controller.recordPayment')
    }).prefix('/billing')

    // Inventory routes
    router.group(() => {
      router.get('/', '#controllers/inventories_controller.index')
      router.get('/:id', '#controllers/inventories_controller.show')
      router.post('/', '#controllers/inventories_controller.store')
      router.put('/:id', '#controllers/inventories_controller.update')
      router.delete('/:id', '#controllers/inventories_controller.destroy')
      router.get('/low-stock', '#controllers/inventories_controller.lowStock')
      router.get('/expired', '#controllers/inventories_controller.expired')
    }).prefix('/inventory')

    // Lab tests routes
    router.group(() => {
      router.get('/', '#controllers/lab_tests_controller.index')
      router.get('/:id', '#controllers/lab_tests_controller.show')
      router.post('/', '#controllers/lab_tests_controller.store')
      router.put('/:id', '#controllers/lab_tests_controller.update')
      router.delete('/:id', '#controllers/lab_tests_controller.destroy')
      router.get('/patient/:patientId', '#controllers/lab_tests_controller.byPatient')
      router.post('/:id/results', '#controllers/lab_tests_controller.updateResults')
    }).prefix('/lab')

    // Bed management routes
    router.group(() => {
      router.get('/', '#controllers/beds_controller.index')
      router.get('/:id', '#controllers/beds_controller.show')
      router.post('/', '#controllers/beds_controller.store')
      router.put('/:id', '#controllers/beds_controller.update')
      router.delete('/:id', '#controllers/beds_controller.destroy')
      router.get('/available', '#controllers/beds_controller.available')
      router.post('/:id/assign', '#controllers/beds_controller.assign')
      router.post('/:id/discharge', '#controllers/beds_controller.discharge')
    }).prefix('/beds')

    // Prescription routes
    router.group(() => {
      router.get('/', '#controllers/prescriptions_controller.index')
      router.get('/:id', '#controllers/prescriptions_controller.show')
      router.post('/', '#controllers/prescriptions_controller.store')
      router.put('/:id', '#controllers/prescriptions_controller.update')
      router.delete('/:id', '#controllers/prescriptions_controller.destroy')
      router.get('/patient/:patientId', '#controllers/prescriptions_controller.byPatient')
      router.post('/:id/dispense', '#controllers/prescriptions_controller.dispense')
    }).prefix('/prescriptions')

    // Notification routes
    router.group(() => {
      router.get('/', '#controllers/notifications_controller.index')
      router.get('/unread-count', '#controllers/notifications_controller.unreadCount')
      router.post('/', '#controllers/notifications_controller.store')
      router.patch('/:id/read', '#controllers/notifications_controller.markAsRead')
      router.patch('/mark-all-read', '#controllers/notifications_controller.markAllAsRead')
      router.delete('/:id', '#controllers/notifications_controller.destroy')
    }).prefix('/notifications')

    // Dashboard routes
    router.group(() => {
      router.get('/', '#controllers/dashboard_controller.index')
      router.get('/user', '#controllers/dashboard_controller.userDashboard')
      router.get('/stats', '#controllers/dashboard_controller.stats')
      router.get('/recent-activities', '#controllers/dashboard_controller.recentActivities')
      router.get('/alerts', '#controllers/dashboard_controller.alerts')
      router.get('/super-admin', '#controllers/dashboard_controller.superAdminDashboard')
    }).prefix('/dashboard')

    // System management routes
    router.group(() => {
      router.get('/health', '#controllers/system_controller.health')
      router.get('/performance', '#controllers/system_controller.performance')
      router.get('/uptime', '#controllers/system_controller.uptime')
      router.get('/version', '#controllers/system_controller.version')
      router.get('/logs', '#controllers/system_controller.logs')
      router.get('/audit-trail', '#controllers/system_controller.auditTrail')
      router.post('/backup', '#controllers/system_controller.createBackup')
    }).prefix('/system')

    // Hospital settings routes (temporary)
    router.group(() => {
      router.get('/settings', '#controllers/system_controller.hospitalSettings')
      router.put('/settings', '#controllers/system_controller.updateHospitalSettings')
    }).prefix('/hospital')

    // Role management routes (Super Admin only)
    router.group(() => {
      router.get('/', '#controllers/roles_controller.index')
      router.get('/permissions', '#controllers/roles_controller.permissions')
      router.get('/templates', '#controllers/roles_controller.getTemplates')
      router.post('/bulk-operation', '#controllers/roles_controller.bulkOperation')
      router.post('/from-template', '#controllers/roles_controller.createFromTemplate')
      router.get('/:id', '#controllers/roles_controller.show')
      router.post('/', '#controllers/roles_controller.store')
      router.put('/:id', '#controllers/roles_controller.update')
      router.delete('/:id', '#controllers/roles_controller.destroy')
    }).prefix('/roles')

    // Permission management routes (Super Admin only)
    router.group(() => {
      router.get('/', '#controllers/permissions_controller.index')
      router.get('/modules', '#controllers/permissions_controller.modules')
      router.get('/:id', '#controllers/permissions_controller.show')
      router.post('/', '#controllers/permissions_controller.store')
      router.put('/:id', '#controllers/permissions_controller.update')
      router.delete('/:id', '#controllers/permissions_controller.destroy')
    }).prefix('/permissions')

    // Master data routes
    router.group(() => {
      router.get('/', '#controllers/master_data_controller.index')
      router.get('/categories', '#controllers/master_data_controller.getCategories')
      router.post('/categories', '#controllers/master_data_controller.createCategory')
      router.delete('/categories/:category', '#controllers/master_data_controller.deleteCategory')
      router.get('/category/:category', '#controllers/master_data_controller.getByCategory')
      router.post('/', '#controllers/master_data_controller.store')
      router.put('/:id', '#controllers/master_data_controller.update')
      router.post('/:id/toggle-status', '#controllers/master_data_controller.toggleStatus')
      router.delete('/:id', '#controllers/master_data_controller.destroy')
    }).prefix('/master-data')

    // Role fields management routes
    router.group(() => {
      // Role field management
      router.get('/role/:roleId/fields', '#controllers/role_fields_controller.index')
      router.get('/role/:roleId/schema', '#controllers/role_fields_controller.schema')
      router.post('/role/:roleId/fields', '#controllers/role_fields_controller.store')
      router.put('/field/:fieldId', '#controllers/role_fields_controller.update')
      router.delete('/field/:fieldId', '#controllers/role_fields_controller.destroy')
      router.post('/role/:roleId/fields/bulk', '#controllers/role_fields_controller.bulkCreate')
      router.post('/role/:roleId/fields/doctor-template', '#controllers/role_fields_controller.createDoctorTemplate')

      // User role data management
      router.post('/user-data', '#controllers/role_fields_controller.setUserData')
      router.get('/user/:userId/data', '#controllers/role_fields_controller.getUserData')
      router.get('/users-with-data', '#controllers/role_fields_controller.getUsersWithRoleData')
    }).prefix('/role-fields')

  }).use(middleware.auth()) // Apply auth middleware to all protected routes

}).prefix('/api')
