import type { HttpContext } from '@adonisjs/core/http'
import Doctor from '#models/doctor'
import User from '#models/user'
import { v4 as uuid } from 'uuid'
import { doctorValidator, updateDoctorValidator } from '#validators/doctor'

export default class DoctorsController {
    /**
     * Get all doctors with pagination and search
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')
            const specialization = request.input('specialization', '')

            let query = Doctor.query().preload('user')

            if (search) {
                query = query.whereHas('user', (userQuery) => {
                    userQuery.where('name', 'like', `%${search}%`)
                }).orWhere('doctor_id', 'like', `%${search}%`)
            }

            if (specialization) {
                query = query.where('specialization', 'like', `%${specialization}%`)
            }

            const doctors = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: doctors,
                message: 'Doctors retrieved successfully'
            })

        } catch (error) {
            console.error('Doctors index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving doctors'
            })
        }
    }

    /**
     * Get single doctor by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const doctor = await Doctor.query()
                .where('id', params.id)
                .preload('user')
                .first()

            if (!doctor) {
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: doctor,
                message: 'Doctor retrieved successfully'
            })

        } catch (error) {
            console.error('Doctor show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving doctor'
            })
        }
    }

    /**
     * Create new doctor
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(doctorValidator)

            // Check if user exists and is a doctor
            const user = await User.find(payload.userId)
            if (!user || user.role !== 'doctor') {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid user or user is not a doctor'
                })
            }

            // Generate doctor ID
            const doctorCount = await Doctor.query().count('* as total')
            const doctorId = `DOC${String(Number(doctorCount[0].$extras.total) + 1).padStart(6, '0')}`

            const doctor = new Doctor()
            doctor.id = uuid()
            doctor.userId = payload.userId
            doctor.doctorId = doctorId
            doctor.specialization = payload.specialization
            doctor.qualification = payload.qualification
            doctor.experience = payload.experience
            doctor.licenseNumber = payload.licenseNumber
            doctor.department = payload.department
            doctor.availableDays = payload.availableDays || []
            doctor.availableHours = payload.availableHours || {}
            doctor.consultationFee = payload.consultationFee || 0
            doctor.isAvailable = payload.isAvailable ?? true

            await doctor.save()

            // Load the user relationship
            await doctor.load('user')

            return response.status(201).json({
                success: true,
                data: doctor,
                message: 'Doctor created successfully'
            })

        } catch (error) {
            console.error('Doctor store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating doctor'
            })
        }
    }

    /**
     * Update doctor
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const doctor = await Doctor.find(params.id)

            if (!doctor) {
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            const payload = await request.validateUsing(updateDoctorValidator)

            doctor.merge(payload)
            await doctor.save()

            await doctor.load('user')

            return response.status(200).json({
                success: true,
                data: doctor,
                message: 'Doctor updated successfully'
            })

        } catch (error) {
            console.error('Doctor update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating doctor'
            })
        }
    }

    /**
     * Delete doctor
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const doctor = await Doctor.find(params.id)

            if (!doctor) {
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            await doctor.delete()

            return response.status(200).json({
                success: true,
                message: 'Doctor deleted successfully'
            })

        } catch (error) {
            console.error('Doctor destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting doctor'
            })
        }
    }

    /**
     * Get doctor's schedule
     */
    async schedule({ params, request, response }: HttpContext) {
        try {
            const doctor = await Doctor.query()
                .where('id', params.id)
                .preload('appointments', (query) => {
                    const date = request.input('date')
                    if (date) {
                        query.whereRaw('DATE(appointment_date) = ?', [date])
                    }
                    query.orderBy('appointment_time', 'asc')
                })
                .first()

            if (!doctor) {
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: {
                    doctor: {
                        id: doctor.id,
                        doctorId: doctor.doctorId,
                        availableDays: doctor.availableDays,
                        availableHours: doctor.availableHours
                    },
                    appointments: doctor.appointments
                },
                message: 'Doctor schedule retrieved successfully'
            })

        } catch (error) {
            console.error('Doctor schedule error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving doctor schedule'
            })
        }
    }

    /**
     * Get doctor's availability
     */
    async availability({ params, request, response }: HttpContext) {
        try {
            const doctor = await Doctor.find(params.id)

            if (!doctor) {
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            const date = request.input('date')
            if (!date) {
                return response.status(400).json({
                    success: false,
                    message: 'Date parameter is required'
                })
            }

            // Get appointments for the specific date
            const appointments = await doctor.related('appointments').query()
                .whereRaw('DATE(appointment_date) = ?', [date])
                .select(['appointment_time', 'duration'])

            // Calculate available time slots based on doctor's schedule and existing appointments
            // This is a simplified version - you can enhance this logic
            const availability = {
                isAvailable: doctor.isAvailable,
                availableDays: doctor.availableDays,
                availableHours: doctor.availableHours,
                bookedSlots: appointments.map(apt => ({
                    time: apt.appointmentTime,
                    duration: apt.duration
                }))
            }

            return response.status(200).json({
                success: true,
                data: availability,
                message: 'Doctor availability retrieved successfully'
            })

        } catch (error) {
            console.error('Doctor availability error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving doctor availability'
            })
        }
    }

    /**
     * Get doctor's appointments
     */
    async appointments({ params, request, response }: HttpContext) {
        try {
            const status = request.input('status', '')

            let query = Doctor.query()
                .where('id', params.id)
                .preload('appointments', (appointmentQuery) => {
                    appointmentQuery.preload('patient')
                    if (status) {
                        appointmentQuery.where('status', status)
                    }
                    appointmentQuery.orderBy('appointment_date', 'desc')
                })

            const doctor = await query.first()

            if (!doctor) {
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: doctor.appointments,
                message: 'Doctor appointments retrieved successfully'
            })

        } catch (error) {
            console.error('Doctor appointments error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving doctor appointments'
            })
        }
    }
}