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
    router.get('/verify', '#controllers/auth_controller.verify').use(middleware.auth())
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
      router.put('/:id', '#controllers/users_controller.update')
      router.delete('/:id', '#controllers/users_controller.destroy')
    }).prefix('/users')

    // Patient management routes
    router.group(() => {
      router.get('/', '#controllers/patients_controller.index')
      router.get('/search', '#controllers/patients_controller.search')
      router.get('/:id', '#controllers/patients_controller.show')
      router.post('/', '#controllers/patients_controller.store')
      router.put('/:id', '#controllers/patients_controller.update')
      router.delete('/:id', '#controllers/patients_controller.destroy')
      router.get('/:id/medical-history', '#controllers/patients_controller.medicalHistory')
      router.get('/:id/appointments', '#controllers/patients_controller.appointments')
    }).prefix('/patients')

    // Doctor management routes
    router.group(() => {
      router.get('/', '#controllers/doctors_controller.index')
      router.get('/:id', '#controllers/doctors_controller.show')
      router.post('/', '#controllers/doctors_controller.store')
      router.put('/:id', '#controllers/doctors_controller.update')
      router.delete('/:id', '#controllers/doctors_controller.destroy')
      router.get('/:id/schedule', '#controllers/doctors_controller.schedule')
      router.get('/:id/availability', '#controllers/doctors_controller.availability')
      router.get('/:id/appointments', '#controllers/doctors_controller.appointments')
    }).prefix('/doctors')

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
      router.get('/:id', '#controllers/medical_records_controller.show')
      router.post('/', '#controllers/medical_records_controller.store')
      router.put('/:id', '#controllers/medical_records_controller.update')
      router.delete('/:id', '#controllers/medical_records_controller.destroy')
      router.get('/patient/:patientId', '#controllers/medical_records_controller.byPatient')
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
      router.get('/stats', '#controllers/dashboard_controller.stats')
      router.get('/recent-activity', '#controllers/dashboard_controller.recentActivity')
      router.get('/alerts', '#controllers/dashboard_controller.alerts')
    }).prefix('/dashboard')

    // Role management routes (Super Admin only)
    router.group(() => {
      router.get('/', '#controllers/roles_controller.index')
      router.get('/permissions', '#controllers/roles_controller.permissions')
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

  }).use(middleware.auth()) // Apply auth middleware to all protected routes

}).prefix('/api')
