import type { HttpContext } from '@adonisjs/core/http'
import DoctorAvailability from '#models/doctor_availability'
import User from '#models/user'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class DoctorAvailabilityController {

    /**
     * Get doctor availability with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 20)
            const userId = request.input('userId')
            const fromDate = request.input('fromDate')
            const toDate = request.input('toDate')
            const availabilityType = request.input('availabilityType')
            const isAvailable = request.input('isAvailable')

            let query = DoctorAvailability.query()
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .preload('replacementDoctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .whereNull('deleted_at')

            // Apply filters
            if (userId) {
                query = query.where('userId', userId)
            }

            if (fromDate) {
                query = query.where('date', '>=', fromDate)
            }

            if (toDate) {
                query = query.where('date', '<=', toDate)
            }

            if (availabilityType) {
                query = query.where('availabilityType', availabilityType)
            }

            if (isAvailable !== undefined) {
                query = query.where('isAvailable', isAvailable === 'true')
            }

            // Order by date descending
            query = query.orderBy('date', 'desc')

            const availability = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: availability,
                message: 'Doctor availability retrieved successfully'
            })
        } catch (error) {
            console.error('Error fetching doctor availability:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch doctor availability',
                error: error.message
            })
        }
    }

    /**
     * Get availability for a specific doctor and date
     */
    async show({ params, response }: HttpContext) {
        try {
            const availability = await DoctorAvailability.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .preload('replacementDoctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            if (!availability) {
                return response.status(404).json({
                    success: false,
                    message: 'Availability record not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: availability,
                message: 'Availability retrieved successfully'
            })
        } catch (error) {
            console.error('Error fetching availability:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch availability',
                error: error.message
            })
        }
    }

    /**
     * Create or update doctor availability
     */
    async store({ request, response, auth }: HttpContext) {
        const trx = await Database.transaction()

        try {
            const data = request.only([
                'userId',
                'date',
                'isAvailable',
                'availabilityType',
                'reason',
                'replacementDoctorId',
                'customStartTime',
                'customEndTime',
                'customLocation',
                'customMaxPatients',
                'notes',
                'notifyPatients',
                'autoReschedule'
            ])

            // Validate doctor exists and has doctor role
            const doctor = await User.query()
                .where('id', data.userId)
                .preload('role')
                .first()

            if (!doctor) {
                await trx.rollback()
                return response.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            if (doctor.role?.name !== 'doctor') {
                await trx.rollback()
                return response.status(400).json({
                    success: false,
                    message: 'User is not a doctor'
                })
            }

            // Validate replacement doctor if provided
            if (data.replacementDoctorId) {
                const replacementDoctor = await User.query()
                    .where('id', data.replacementDoctorId)
                    .preload('role')
                    .first()

                if (!replacementDoctor || replacementDoctor.role?.name !== 'doctor') {
                    await trx.rollback()
                    return response.status(400).json({
                        success: false,
                        message: 'Invalid replacement doctor'
                    })
                }
            }

            // Validate custom time logic
            if (data.customStartTime && data.customEndTime && data.customStartTime >= data.customEndTime) {
                await trx.rollback()
                return response.status(400).json({
                    success: false,
                    message: 'Custom end time must be after start time'
                })
            }

            // Check if availability already exists for this doctor and date
            const existingAvailability = await DoctorAvailability.query()
                .where('userId', data.userId)
                .where('date', data.date)
                .whereNull('deleted_at')
                .first()

            let availability: DoctorAvailability

            const availabilityData = {
                ...data,
                date: DateTime.fromISO(data.date),
                availabilityType: data.availabilityType || 'override',
                notifyPatients: data.notifyPatients !== undefined ? data.notifyPatients : true,
                autoReschedule: data.autoReschedule !== undefined ? data.autoReschedule : false,
                createdBy: auth.user?.id || null,
                updatedBy: auth.user?.id || null
            }

            if (existingAvailability) {
                // Update existing availability
                existingAvailability.merge(availabilityData)
                availability = await existingAvailability.save()
            } else {
                // Create new availability
                availability = await DoctorAvailability.create(availabilityData, { client: trx })
            }

            await trx.commit()

            // If this availability affects appointments and auto-reschedule is enabled
            if (!data.isAvailable && data.autoReschedule) {
                // This would trigger a background job to reschedule appointments
                // For now, we'll just log the requirement
                console.log(`Auto-reschedule requested for doctor ${data.userId} on ${data.date}`)
            }

            // Load the created/updated availability with relationships
            const result = await DoctorAvailability.query()
                .where('id', availability.id)
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .preload('replacementDoctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            return response.status(existingAvailability ? 200 : 201).json({
                success: true,
                data: result,
                message: existingAvailability ? 'Availability updated successfully' : 'Availability created successfully'
            })
        } catch (error) {
            await trx.rollback()
            console.error('Error creating/updating availability:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to create/update availability',
                error: error.message
            })
        }
    }

    /**
     * Update doctor availability
     */
    async update({ params, request, response, auth }: HttpContext) {
        const trx = await Database.transaction()

        try {
            const availability = await DoctorAvailability.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .first()

            if (!availability) {
                await trx.rollback()
                return response.status(404).json({
                    success: false,
                    message: 'Availability record not found'
                })
            }

            const data = request.only([
                'isAvailable',
                'availabilityType',
                'reason',
                'replacementDoctorId',
                'customStartTime',
                'customEndTime',
                'customLocation',
                'customMaxPatients',
                'notes',
                'notifyPatients',
                'autoReschedule'
            ])

            // Validate replacement doctor if provided
            if (data.replacementDoctorId) {
                const replacementDoctor = await User.query()
                    .where('id', data.replacementDoctorId)
                    .preload('role')
                    .first()

                if (!replacementDoctor || replacementDoctor.role?.name !== 'doctor') {
                    await trx.rollback()
                    return response.status(400).json({
                        success: false,
                        message: 'Invalid replacement doctor'
                    })
                }
            }

            // Validate custom time logic
            if (data.customStartTime && data.customEndTime && data.customStartTime >= data.customEndTime) {
                await trx.rollback()
                return response.status(400).json({
                    success: false,
                    message: 'Custom end time must be after start time'
                })
            }

            const updateData = {
                ...data,
                updatedBy: auth.user?.id || null
            }

            availability.merge(updateData)
            await availability.save()

            await trx.commit()

            // Load updated availability with relationships
            const updatedAvailability = await DoctorAvailability.query()
                .where('id', availability.id)
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .preload('replacementDoctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            return response.status(200).json({
                success: true,
                data: updatedAvailability,
                message: 'Availability updated successfully'
            })
        } catch (error) {
            await trx.rollback()
            console.error('Error updating availability:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to update availability',
                error: error.message
            })
        }
    }

    /**
     * Delete doctor availability
     */
    async destroy({ params, response, auth }: HttpContext) {
        try {
            const availability = await DoctorAvailability.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .first()

            if (!availability) {
                return response.status(404).json({
                    success: false,
                    message: 'Availability record not found'
                })
            }

            availability.deletedAt = DateTime.now()
            availability.updatedBy = auth.user?.id || null
            await availability.save()

            return response.status(200).json({
                success: true,
                message: 'Availability record deleted successfully'
            })
        } catch (error) {
            console.error('Error deleting availability:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to delete availability',
                error: error.message
            })
        }
    }

    /**
     * Get doctor availability for a specific date range
     */
    async getAvailabilityByDateRange({ request, response }: HttpContext) {
        try {
            const userId = request.input('userId')
            const fromDate = request.input('fromDate')
            const toDate = request.input('toDate')

            if (!userId || !fromDate || !toDate) {
                return response.status(400).json({
                    success: false,
                    message: 'userId, fromDate, and toDate are required'
                })
            }

            const availability = await DoctorAvailability.query()
                .where('userId', userId)
                .whereBetween('date', [fromDate, toDate])
                .whereNull('deleted_at')
                .preload('replacementDoctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .orderBy('date', 'asc')

            return response.status(200).json({
                success: true,
                data: availability,
                message: 'Doctor availability retrieved successfully'
            })
        } catch (error) {
            console.error('Error fetching availability by date range:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch availability',
                error: error.message
            })
        }
    }

    /**
     * Check doctor availability for a specific date
     */
    async checkAvailability({ request, response }: HttpContext) {
        try {
            const userId = request.input('userId')
            const date = request.input('date')

            if (!userId || !date) {
                return response.status(400).json({
                    success: false,
                    message: 'userId and date are required'
                })
            }

            const availability = await DoctorAvailability.query()
                .where('userId', userId)
                .where('date', date)
                .whereNull('deleted_at')
                .preload('replacementDoctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            const isAvailable = availability ? availability.isAvailable : true // Default to available if no override

            return response.status(200).json({
                success: true,
                data: {
                    userId,
                    date,
                    isAvailable,
                    availability: availability || null
                },
                message: 'Availability status retrieved successfully'
            })
        } catch (error) {
            console.error('Error checking availability:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to check availability',
                error: error.message
            })
        }
    }
}
