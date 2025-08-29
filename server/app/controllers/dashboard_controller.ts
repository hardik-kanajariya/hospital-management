import type { HttpContext } from '@adonisjs/core/http'
import Patient from '#models/patient'
import Doctor from '#models/doctor'
import Appointment from '#models/appointment'
import MedicalRecord from '#models/medical_record'
import Bill from '#models/bill'
import Inventory from '#models/inventory'
import LabTest from '#models/lab_test'
import Bed from '#models/bed'
import Prescription from '#models/prescription'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

export default class DashboardController {
    /**
     * Get main dashboard statistics
     */
    async index({ response }: HttpContext) {
        try {
            // Patient Statistics
            const totalPatients = await Patient.query().count('* as total')
            const todayPatients = await Patient.query()
                .whereRaw('DATE(created_at) = CURDATE()')
                .count('* as total')

            // Doctor Statistics
            const totalDoctors = await Doctor.query().count('* as total')
            const availableDoctors = await Doctor.query()
                .where('is_available', true)
                .count('* as total')

            // Appointment Statistics
            const totalAppointments = await Appointment.query().count('* as total')
            const todayAppointments = await Appointment.query()
                .whereRaw('DATE(appointment_date) = CURDATE()')
                .count('* as total')
            const pendingAppointments = await Appointment.query()
                .where('status', 'scheduled')
                .count('* as total')

            // Bed Statistics
            const totalBeds = await Bed.query().count('* as total')
            const occupiedBeds = await Bed.query()
                .where('status', 'occupied')
                .count('* as total')
            const availableBeds = await Bed.query()
                .where('status', 'available')
                .count('* as total')

            // Financial Statistics
            const totalRevenue = await Bill.query()
                .sum('total_amount as amount')
            const pendingPayments = await Bill.query()
                .whereIn('status', ['pending', 'partial'])
                .sum('outstanding_amount as amount')

            // Lab Test Statistics
            const pendingLabTests = await LabTest.query()
                .whereIn('status', ['ordered', 'sample_collected', 'in_progress'])
                .count('* as total')

            // Inventory Alerts
            const lowStockItems = await Inventory.query()
                .whereRaw('quantity_in_stock <= minimum_stock_level')
                .count('* as total')

            // Calculate occupancy rate
            const occupancyRate = totalBeds[0].$extras.total > 0
                ? ((occupiedBeds[0].$extras.total / totalBeds[0].$extras.total) * 100).toFixed(2)
                : 0

            const dashboard = {
                patients: {
                    total: totalPatients[0].$extras.total,
                    today: todayPatients[0].$extras.total
                },
                doctors: {
                    total: totalDoctors[0].$extras.total,
                    available: availableDoctors[0].$extras.total
                },
                appointments: {
                    total: totalAppointments[0].$extras.total,
                    today: todayAppointments[0].$extras.total,
                    pending: pendingAppointments[0].$extras.total
                },
                beds: {
                    total: totalBeds[0].$extras.total,
                    occupied: occupiedBeds[0].$extras.total,
                    available: availableBeds[0].$extras.total,
                    occupancyRate: occupancyRate
                },
                financial: {
                    totalRevenue: totalRevenue[0].$extras.amount || 0,
                    pendingPayments: pendingPayments[0].$extras.amount || 0
                },
                alerts: {
                    pendingLabTests: pendingLabTests[0].$extras.total,
                    lowStockItems: lowStockItems[0].$extras.total
                }
            }

            return response.status(200).json({
                success: true,
                data: dashboard,
                message: 'Dashboard statistics retrieved successfully'
            })

        } catch (error) {
            console.error('Dashboard index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving dashboard statistics'
            })
        }
    }

    /**
     * Get recent activities
     */
    async recentActivities({ request, response }: HttpContext) {
        try {
            const limit = request.input('limit', 10)

            // Recent Appointments
            const recentAppointments = await Appointment.query()
                .preload('patient')
                .preload('doctor')
                .orderBy('created_at', 'desc')
                .limit(limit)

            // Recent Medical Records
            const recentMedicalRecords = await MedicalRecord.query()
                .preload('patient')
                .preload('doctor')
                .orderBy('created_at', 'desc')
                .limit(limit)

            // Recent Lab Tests
            const recentLabTests = await LabTest.query()
                .preload('patient')
                .preload('doctor')
                .orderBy('created_at', 'desc')
                .limit(limit)

            // Recent Prescriptions
            const recentPrescriptions = await Prescription.query()
                .preload('patient')
                .preload('doctor')
                .orderBy('created_at', 'desc')
                .limit(limit)

            const activities = {
                appointments: recentAppointments,
                medicalRecords: recentMedicalRecords,
                labTests: recentLabTests,
                prescriptions: recentPrescriptions
            }

            return response.status(200).json({
                success: true,
                data: activities,
                message: 'Recent activities retrieved successfully'
            })

        } catch (error) {
            console.error('Recent activities error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving recent activities'
            })
        }
    }

    /**
     * Get analytics data
     */
    async analytics({ request, response }: HttpContext) {
        try {
            const period = request.input('period', 'week') // week, month, year
            const startDate = request.input('startDate')
            const endDate = request.input('endDate')

            let dateCondition = ''
            if (startDate && endDate) {
                dateCondition = `BETWEEN '${startDate}' AND '${endDate}'`
            } else {
                switch (period) {
                    case 'week':
                        dateCondition = '>= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
                        break
                    case 'month':
                        dateCondition = '>= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
                        break
                    case 'year':
                        dateCondition = '>= DATE_SUB(CURDATE(), INTERVAL 365 DAY)'
                        break
                    default:
                        dateCondition = '>= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
                }
            }

            // Patient registrations over time
            const patientRegistrations = await Patient.query()
                .whereRaw(`DATE(created_at) ${dateCondition}`)
                .groupByRaw('DATE(created_at)')
                .select('created_at')
                .count('* as count')
                .orderBy('created_at', 'asc')

            // Appointments over time
            const appointmentTrends = await Appointment.query()
                .whereRaw(`DATE(appointment_date) ${dateCondition}`)
                .groupByRaw('DATE(appointment_date)')
                .select('appointment_date')
                .count('* as count')
                .orderBy('appointment_date', 'asc')

            // Revenue over time
            const revenueTrends = await Bill.query()
                .whereRaw(`DATE(bill_date) ${dateCondition}`)
                .groupByRaw('DATE(bill_date)')
                .select('bill_date')
                .sum('total_amount as amount')
                .orderBy('bill_date', 'asc')

            // Department-wise appointments
            const departmentStats = await Appointment.query()
                .join('doctors', 'appointments.doctor_id', 'doctors.id')
                .whereRaw(`DATE(appointments.appointment_date) ${dateCondition}`)
                .groupBy('doctors.department')
                .select('doctors.department')
                .count('* as count')

            const analytics = {
                patientRegistrations,
                appointmentTrends,
                revenueTrends,
                departmentStats
            }

            return response.status(200).json({
                success: true,
                data: analytics,
                message: 'Analytics data retrieved successfully'
            })

        } catch (error) {
            console.error('Analytics error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving analytics data'
            })
        }
    }

    /**
     * Get system alerts and notifications
     */
    async alerts({ response }: HttpContext) {
        try {
            // Critical notifications
            const criticalNotifications = await Notification.query()
                .where('priority', 'critical')
                .where('is_read', false)
                .orderBy('created_at', 'desc')
                .limit(5)

            // Low stock items
            const lowStockItems = await Inventory.query()
                .whereRaw('quantity_in_stock <= minimum_stock_level')
                .orderBy('quantity_in_stock', 'asc')
                .limit(10)

            // Overdue appointments
            const overdueAppointments = await Appointment.query()
                .where('status', 'scheduled')
                .where('appointment_date', '<', DateTime.now().toSQLDate()!)
                .preload('patient')
                .preload('doctor')
                .orderBy('appointment_date', 'asc')
                .limit(10)

            // Pending lab results
            const pendingLabResults = await LabTest.query()
                .whereIn('status', ['sample_collected', 'in_progress'])
                .where('ordered_date', '<', DateTime.now().minus({ days: 2 }).toSQLDate()!)
                .preload('patient')
                .orderBy('ordered_date', 'asc')
                .limit(10)

            // Bills overdue
            const overdueBills = await Bill.query()
                .whereIn('status', ['pending', 'partial'])
                .where('due_date', '<', DateTime.now().toSQLDate()!)
                .preload('patient')
                .orderBy('due_date', 'asc')
                .limit(10)

            const alerts = {
                criticalNotifications,
                lowStockItems,
                overdueAppointments,
                pendingLabResults,
                overdueBills
            }

            return response.status(200).json({
                success: true,
                data: alerts,
                message: 'System alerts retrieved successfully'
            })

        } catch (error) {
            console.error('System alerts error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving system alerts'
            })
        }
    }

    /**
     * Get user-specific dashboard
     */
    async userDashboard({ auth, response }: HttpContext) {
        try {
            const user = auth.user!
            let userStats: any = {}

            if (user.role === 'doctor') {
                // Doctor-specific stats
                const doctor = await Doctor.query().where('user_id', user.id).first()
                if (doctor) {
                    const todayAppointments = await Appointment.query()
                        .where('doctor_id', doctor.id)
                        .whereRaw('DATE(appointment_date) = CURDATE()')
                        .count('* as total')

                    const pendingAppointments = await Appointment.query()
                        .where('doctor_id', doctor.id)
                        .where('status', 'scheduled')
                        .count('* as total')

                    const thisMonthPatients = await Appointment.query()
                        .where('doctor_id', doctor.id)
                        .whereRaw('MONTH(appointment_date) = MONTH(CURDATE())')
                        .countDistinct('patient_id as total')

                    userStats = {
                        role: 'doctor',
                        todayAppointments: todayAppointments[0].$extras.total,
                        pendingAppointments: pendingAppointments[0].$extras.total,
                        thisMonthPatients: thisMonthPatients[0].$extras.total
                    }
                }
            } else if (user.role === 'nurse' || user.role === 'receptionist') {
                // Nurse/Receptionist stats
                const todayAppointments = await Appointment.query()
                    .whereRaw('DATE(appointment_date) = CURDATE()')
                    .count('* as total')

                const pendingLabTests = await LabTest.query()
                    .whereIn('status', ['ordered', 'sample_collected'])
                    .count('* as total')

                userStats = {
                    role: user.role,
                    todayAppointments: todayAppointments[0].$extras.total,
                    pendingLabTests: pendingLabTests[0].$extras.total
                }
            } else {
                // Admin or other roles - full system stats
                userStats = {
                    role: user.role,
                    message: 'Access to full dashboard statistics'
                }
            }

            // Common notifications for all users
            const notifications = await Notification.query()
                .where('user_id', user.id)
                .where('is_read', false)
                .orderBy('created_at', 'desc')
                .limit(5)

            const dashboard = {
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role
                },
                stats: userStats,
                notifications
            }

            return response.status(200).json({
                success: true,
                data: dashboard,
                message: 'User dashboard retrieved successfully'
            })

        } catch (error) {
            console.error('User dashboard error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving user dashboard'
            })
        }
    }
}