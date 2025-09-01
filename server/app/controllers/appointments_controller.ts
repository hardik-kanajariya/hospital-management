import type { HttpContext } from '@adonisjs/core/http'
import Appointment from '#models/appointment'
import Patient from '#models/patient'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { appointmentValidator, updateAppointmentValidator } from '#validators/appointment'
import User from '#models/user'

export default class AppointmentsController {
    /**
     * Get all appointments with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const status = request.input('status', '')
            const doctorId = request.input('doctorId', '')
            const patientId = request.input('patientId', '')
            const date = request.input('date', '')

            let query = Appointment.query()
                .preload('patient', (patientQuery) => {
                    patientQuery.select(['id', 'patient_id', 'name', 'phone', 'email'])
                })
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.select(['id', 'name', 'department', 'phone', 'email'])
                })

            if (status) {
                query = query.where('status', status)
            }

            if (doctorId) {
                query = query.where('doctor_id', doctorId)
            }

            if (patientId) {
                query = query.where('patient_id', patientId)
            }

            if (date) {
                query = query.whereRaw('DATE(appointment_date) = ?', [date])
            }

            query = query.orderBy('appointment_date', 'desc')

            const appointments = await query.paginate(page, limit)

            // Transform the response to include flattened data and formatted dates/times
            const transformedData = appointments.serialize().data.map((appointment: any) => ({
                id: appointment.id,
                appointmentId: appointment.appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : null, // Extract date part
                appointmentTime: appointment.appointmentTime ? appointment.appointmentTime.split('T')[1].substring(0, 5) : null, // Extract time part (HH:MM)
                duration: appointment.duration,
                status: appointment.status,
                type: appointment.type,
                priority: appointment.priority,
                reason: appointment.reason,
                notes: appointment.notes,
                symptoms: appointment.symptoms,
                vitals: appointment.vitals,
                roomNumber: appointment.roomNumber,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
                // Flattened patient data
                patient_name: appointment.patient?.name || null,
                patient_id_display: appointment.patient?.patientId || null,
                patient_phone: appointment.patient?.phone || null,
                patient_email: appointment.patient?.email || null,
                // Flattened doctor data
                doctor_name: appointment.doctor?.name || null,
                doctor_department: appointment.doctor?.department || null,
                doctor_phone: appointment.doctor?.phone || null,
                doctor_email: appointment.doctor?.email || null
            }))

            return response.status(200).json({
                success: true,
                data: {
                    data: transformedData,
                    meta: appointments.serialize().meta
                },
                message: 'Appointments retrieved successfully'
            })

        } catch (error) {
            console.error('Appointments index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving appointments'
            })
        }
    }

    /**
     * Get single appointment by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const appointment = await Appointment.query()
                .where('id', params.id)
                .preload('patient')
                .preload('doctor')
                .first()

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: appointment,
                message: 'Appointment retrieved successfully'
            })

        } catch (error) {
            console.error('Appointment show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving appointment'
            })
        }
    }

    /**
     * Create new appointment
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(appointmentValidator)

            // Verify patient and doctor exist
            const patient = await Patient.find(payload.patientId)
            const doctor = await User.find(payload.doctorId)

            if (!patient) {
                return response.status(400).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            if (!doctor) {
                return response.status(400).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            // Generate appointment ID
            const appointmentCount = await Appointment.query().count('* as total')
            const appointmentId = `APT${String(Number(appointmentCount[0].$extras.total) + 1).padStart(6, '0')}`

            // Combine date and time strings into DateTime objects
            const appointmentDateTime = DateTime.fromISO(`${payload.appointmentDate}T${payload.appointmentTime}:00`)

            if (!appointmentDateTime.isValid) {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid date or time format'
                })
            }

            const appointment = new Appointment()
            appointment.id = uuid()
            appointment.appointmentId = appointmentId
            appointment.patientId = payload.patientId
            appointment.doctorId = payload.doctorId
            appointment.appointmentDate = DateTime.fromISO(payload.appointmentDate)
            appointment.appointmentTime = appointmentDateTime
            appointment.duration = payload.duration || 30
            appointment.type = payload.type
            appointment.status = payload.status || 'scheduled'
            appointment.priority = payload.priority || 'normal'
            appointment.reason = payload.reason
            appointment.notes = payload.notes || null
            appointment.symptoms = payload.symptoms || []
            appointment.vitals = payload.vitals || {}

            await appointment.save()

            // Load relationships with selected fields
            await appointment.load('patient', (patientQuery) => {
                patientQuery.select(['id', 'patient_id', 'name', 'phone', 'email'])
            })
            await appointment.load('doctor', (doctorQuery) => {
                doctorQuery.select(['id', 'name', 'department', 'phone', 'email'])
            })

            // Return flattened response format
            const transformedAppointment = {
                id: appointment.id,
                appointmentId: appointment.appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.toISODate() : null,
                appointmentTime: appointment.appointmentTime ? appointment.appointmentTime.toFormat('HH:mm') : null,
                duration: appointment.duration,
                status: appointment.status,
                type: appointment.type,
                priority: appointment.priority,
                reason: appointment.reason,
                notes: appointment.notes,
                symptoms: appointment.symptoms,
                vitals: appointment.vitals,
                roomNumber: appointment.roomNumber,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
                // Flattened patient data
                patient_name: appointment.patient?.name || null,
                patient_id_display: appointment.patient?.patientId || null,
                patient_phone: appointment.patient?.phone || null,
                patient_email: appointment.patient?.email || null,
                // Flattened doctor data
                doctor_name: appointment.doctor?.name || null,
                doctor_department: appointment.doctor?.department || null,
                doctor_phone: appointment.doctor?.phone || null,
                doctor_email: appointment.doctor?.email || null
            }

            return response.status(201).json({
                success: true,
                data: transformedAppointment,
                message: 'Appointment created successfully'
            })

        } catch (error) {
            console.error('Appointment store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating appointment'
            })
        }
    }

    /**
     * Update appointment
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const appointment = await Appointment.find(params.id)

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            const payload = await request.validateUsing(updateAppointmentValidator)

            if (payload.appointmentDate !== undefined) appointment.appointmentDate = DateTime.fromISO(payload.appointmentDate)
            if (payload.appointmentTime !== undefined) {
                // Combine with existing date or use the date being updated
                const dateToUse = payload.appointmentDate || appointment.appointmentDate.toISODate()
                const appointmentDateTime = DateTime.fromISO(`${dateToUse}T${payload.appointmentTime}:00`)

                if (!appointmentDateTime.isValid) {
                    return response.status(400).json({
                        success: false,
                        message: 'Invalid time format'
                    })
                }

                appointment.appointmentTime = appointmentDateTime
            }
            if (payload.duration !== undefined) appointment.duration = payload.duration
            if (payload.type !== undefined) appointment.type = payload.type
            if (payload.status !== undefined) appointment.status = payload.status
            if (payload.priority !== undefined) appointment.priority = payload.priority
            if (payload.reason !== undefined) appointment.reason = payload.reason
            if (payload.notes !== undefined) appointment.notes = payload.notes || null
            if (payload.symptoms !== undefined) appointment.symptoms = payload.symptoms
            if (payload.vitals !== undefined) appointment.vitals = payload.vitals
            if (payload.roomNumber !== undefined) appointment.roomNumber = payload.roomNumber || null

            await appointment.save()

            await appointment.load('patient')
            await appointment.load('doctor')

            return response.status(200).json({
                success: true,
                data: appointment,
                message: 'Appointment updated successfully'
            })

        } catch (error) {
            console.error('Appointment update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating appointment'
            })
        }
    }

    /**
     * Delete appointment
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const appointment = await Appointment.find(params.id)

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            await appointment.delete()

            return response.status(200).json({
                success: true,
                message: 'Appointment deleted successfully'
            })

        } catch (error) {
            console.error('Appointment destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting appointment'
            })
        }
    }

    /**
     * Check-in appointment
     */
    async checkin({ params, request, response }: HttpContext) {
        try {
            const appointment = await Appointment.find(params.id)

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            if (appointment.status !== 'scheduled') {
                return response.status(400).json({
                    success: false,
                    message: 'Only scheduled appointments can be checked in'
                })
            }

            const vitals = request.input('vitals', {})

            appointment.status = 'confirmed'
            appointment.checkedInAt = DateTime.now()
            if (Object.keys(vitals).length > 0) {
                appointment.vitals = vitals
            }

            await appointment.save()

            await appointment.load('patient')
            await appointment.load('doctor')

            return response.status(200).json({
                success: true,
                data: appointment,
                message: 'Patient checked in successfully'
            })

        } catch (error) {
            console.error('Appointment checkin error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while checking in appointment'
            })
        }
    }

    /**
     * Check-out appointment
     */
    async checkout({ params, response }: HttpContext) {
        try {
            const appointment = await Appointment.find(params.id)

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            if (appointment.status !== 'in_progress' && appointment.status !== 'confirmed') {
                return response.status(400).json({
                    success: false,
                    message: 'Only in-progress or confirmed appointments can be checked out'
                })
            }

            appointment.status = 'completed'
            appointment.checkedOutAt = DateTime.now()

            await appointment.save()

            await appointment.load('patient')
            await appointment.load('doctor')

            return response.status(200).json({
                success: true,
                data: appointment,
                message: 'Patient checked out successfully'
            })

        } catch (error) {
            console.error('Appointment checkout error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while checking out appointment'
            })
        }
    }

    /**
     * Cancel appointment
     */
    async cancel({ params, request, response }: HttpContext) {
        try {
            const appointment = await Appointment.find(params.id)

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            if (appointment.status === 'completed' || appointment.status === 'cancelled') {
                return response.status(400).json({
                    success: false,
                    message: 'Cannot cancel completed or already cancelled appointments'
                })
            }

            const cancellationReason = request.input('cancellationReason', '')

            appointment.status = 'cancelled'
            if (cancellationReason) {
                appointment.notes = cancellationReason
            }

            await appointment.save()

            await appointment.load('patient')
            await appointment.load('doctor')

            return response.status(200).json({
                success: true,
                data: appointment,
                message: 'Appointment cancelled successfully'
            })

        } catch (error) {
            console.error('Appointment cancel error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while cancelling appointment'
            })
        }
    }

    /**
     * Reschedule appointment
     */
    async reschedule({ params, request, response }: HttpContext) {
        try {
            const appointment = await Appointment.find(params.id)

            if (!appointment) {
                return response.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                })
            }

            if (appointment.status !== 'scheduled') {
                return response.status(400).json({
                    success: false,
                    message: 'Only scheduled appointments can be rescheduled'
                })
            }

            const appointmentDate = request.input('appointmentDate')
            const appointmentTime = request.input('appointmentTime')

            if (!appointmentDate || !appointmentTime) {
                return response.status(400).json({
                    success: false,
                    message: 'New appointment date and time are required'
                })
            }

            appointment.appointmentDate = appointmentDate
            appointment.appointmentTime = appointmentTime

            await appointment.save()

            await appointment.load('patient')
            await appointment.load('doctor')

            return response.status(200).json({
                success: true,
                data: appointment,
                message: 'Appointment rescheduled successfully'
            })

        } catch (error) {
            console.error('Appointment reschedule error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while rescheduling appointment'
            })
        }
    }
}