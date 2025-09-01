import type { HttpContext } from '@adonisjs/core/http'
import DoctorSchedule from '#models/doctor_schedule'
import User from '#models/user'
import Appointment from '#models/appointment'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class DoctorScheduleController {

    /**
     * Get all doctor schedules with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 20)
            const userId = request.input('userId')
            const dayOfWeek = request.input('dayOfWeek')
            const scheduleType = request.input('scheduleType')
            const location = request.input('location')
            const status = request.input('status', 'active')

            let query = DoctorSchedule.query()
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .whereNull('deleted_at')

            // Apply filters
            if (userId) {
                query = query.where('userId', userId)
            }

            if (dayOfWeek) {
                query = query.where('dayOfWeek', dayOfWeek)
            }

            if (scheduleType) {
                query = query.where('scheduleType', scheduleType)
            }

            if (location) {
                query = query.where('location', 'like', `%${location}%`)
            }

            if (status) {
                query = query.where('status', status)
            }

            // Order by day of week, then by start time
            const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            query = query.orderByRaw(`FIELD(day_of_week, ${dayOrder.map(() => '?').join(',')})`, dayOrder)
                .orderBy('startTime', 'asc')

            const schedules = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: schedules,
                message: 'Doctor schedules retrieved successfully'
            })
        } catch (error) {
            console.error('Error fetching doctor schedules:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch doctor schedules',
                error: error.message
            })
        }
    }

    /**
     * Get schedule for a specific doctor
     */
    async show({ params, response }: HttpContext) {
        try {
            const schedule = await DoctorSchedule.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            if (!schedule) {
                return response.status(404).json({
                    success: false,
                    message: 'Schedule not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: schedule,
                message: 'Schedule retrieved successfully'
            })
        } catch (error) {
            console.error('Error fetching schedule:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch schedule',
                error: error.message
            })
        }
    }

    /**
     * Create a new doctor schedule
     */
    async store({ request, response, auth }: HttpContext) {
        const trx = await Database.transaction()

        try {
            const data = request.only([
                'userId',
                'dayOfWeek',
                'startTime',
                'endTime',
                'location',
                'maxPatients',
                'slotDurationMinutes',
                'scheduleType',
                'status',
                'notes',
                'breakTimes',
                'isRecurring',
                'effectiveFrom',
                'effectiveUntil',
                'priority'
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

            // Validate time format and logic
            if (data.startTime >= data.endTime) {
                await trx.rollback()
                return response.status(400).json({
                    success: false,
                    message: 'End time must be after start time'
                })
            }

            // Check for schedule conflicts
            const conflictingSchedule = await DoctorSchedule.query()
                .where('userId', data.userId)
                .where('dayOfWeek', data.dayOfWeek)
                .where('status', 'active')
                .whereNull('deleted_at')
                .where((builder) => {
                    builder
                        .whereBetween('startTime', [data.startTime, data.endTime])
                        .orWhereBetween('endTime', [data.startTime, data.endTime])
                        .orWhere((subBuilder) => {
                            subBuilder
                                .where('startTime', '<=', data.startTime)
                                .where('endTime', '>=', data.endTime)
                        })
                })
                .first()

            if (conflictingSchedule) {
                await trx.rollback()
                return response.status(409).json({
                    success: false,
                    message: 'Schedule conflicts with existing schedule',
                    conflictingSchedule: {
                        id: conflictingSchedule.id,
                        dayOfWeek: conflictingSchedule.dayOfWeek,
                        startTime: conflictingSchedule.startTime,
                        endTime: conflictingSchedule.endTime,
                        location: conflictingSchedule.location
                    }
                })
            }

            // Set defaults
            const scheduleData = {
                ...data,
                location: data.location || 'General OPD',
                maxPatients: data.maxPatients || 20,
                slotDurationMinutes: data.slotDurationMinutes || 15,
                scheduleType: data.scheduleType || 'regular',
                status: data.status || 'active',
                isRecurring: data.isRecurring !== undefined ? data.isRecurring : true,
                effectiveFrom: data.effectiveFrom ? DateTime.fromISO(data.effectiveFrom) : DateTime.now(),
                effectiveUntil: data.effectiveUntil ? DateTime.fromISO(data.effectiveUntil) : null,
                priority: data.priority || 1,
                breakTimes: data.breakTimes || [],
                createdBy: auth.user?.id
            }

            const schedule = await DoctorSchedule.create(scheduleData, { client: trx })

            await trx.commit()

            // Load the created schedule with relationships
            const createdSchedule = await DoctorSchedule.query()
                .where('id', schedule.id)
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            return response.status(201).json({
                success: true,
                data: createdSchedule,
                message: 'Schedule created successfully'
            })
        } catch (error) {
            await trx.rollback()
            console.error('Error creating schedule:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to create schedule',
                error: error.message
            })
        }
    }

    /**
     * Update a doctor schedule
     */
    async update({ params, request, response, auth }: HttpContext) {
        const trx = await Database.transaction()

        try {
            const schedule = await DoctorSchedule.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .first()

            if (!schedule) {
                await trx.rollback()
                return response.status(404).json({
                    success: false,
                    message: 'Schedule not found'
                })
            }

            const data = request.only([
                'dayOfWeek',
                'startTime',
                'endTime',
                'location',
                'maxPatients',
                'slotDurationMinutes',
                'scheduleType',
                'status',
                'notes',
                'breakTimes',
                'isRecurring',
                'effectiveFrom',
                'effectiveUntil',
                'priority'
            ])

            // Validate time logic if provided
            if (data.startTime && data.endTime && data.startTime >= data.endTime) {
                await trx.rollback()
                return response.status(400).json({
                    success: false,
                    message: 'End time must be after start time'
                })
            }

            // Check for conflicts if updating time or day
            if (data.dayOfWeek || data.startTime || data.endTime) {
                const checkDay = data.dayOfWeek || schedule.dayOfWeek
                const checkStartTime = data.startTime || schedule.startTime
                const checkEndTime = data.endTime || schedule.endTime

                const conflictingSchedule = await DoctorSchedule.query()
                    .where('userId', schedule.userId)
                    .where('dayOfWeek', checkDay)
                    .where('status', 'active')
                    .whereNot('id', schedule.id)
                    .whereNull('deleted_at')
                    .where((builder) => {
                        builder
                            .whereBetween('startTime', [checkStartTime, checkEndTime])
                            .orWhereBetween('endTime', [checkStartTime, checkEndTime])
                            .orWhere((subBuilder) => {
                                subBuilder
                                    .where('startTime', '<=', checkStartTime)
                                    .where('endTime', '>=', checkEndTime)
                            })
                    })
                    .first()

                if (conflictingSchedule) {
                    await trx.rollback()
                    return response.status(409).json({
                        success: false,
                        message: 'Schedule conflicts with existing schedule',
                        conflictingSchedule: {
                            id: conflictingSchedule.id,
                            dayOfWeek: conflictingSchedule.dayOfWeek,
                            startTime: conflictingSchedule.startTime,
                            endTime: conflictingSchedule.endTime,
                            location: conflictingSchedule.location
                        }
                    })
                }
            }

            // Prepare update data
            const updateData = {
                ...data,
                updatedBy: auth.user?.id
            }

            // Handle date fields
            if (data.effectiveFrom) {
                updateData.effectiveFrom = DateTime.fromISO(data.effectiveFrom)
            }
            if (data.effectiveUntil) {
                updateData.effectiveUntil = DateTime.fromISO(data.effectiveUntil)
            }

            schedule.merge(updateData)
            await schedule.save()

            await trx.commit()

            // Load updated schedule with relationships
            const updatedSchedule = await DoctorSchedule.query()
                .where('id', schedule.id)
                .preload('doctor', (doctorQuery) => {
                    doctorQuery.preload('role')
                })
                .first()

            return response.status(200).json({
                success: true,
                data: updatedSchedule,
                message: 'Schedule updated successfully'
            })
        } catch (error) {
            await trx.rollback()
            console.error('Error updating schedule:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to update schedule',
                error: error.message
            })
        }
    }

    /**
     * Soft delete a doctor schedule
     */
    async destroy({ params, response, auth }: HttpContext) {
        try {
            const schedule = await DoctorSchedule.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .first()

            if (!schedule) {
                return response.status(404).json({
                    success: false,
                    message: 'Schedule not found'
                })
            }

            // Check if there are future appointments affected by this schedule deletion
            const futureAppointments = await Appointment.query()
                .where('doctorId', schedule.userId)
                .where('appointmentDate', '>', DateTime.now().toSQLDate())
                .where('status', 'scheduled')
                .count('* as total')

            schedule.deletedAt = DateTime.now()
            schedule.updatedBy = auth.user?.id || null
            await schedule.save()

            return response.status(200).json({
                success: true,
                message: 'Schedule deleted successfully',
                affectedAppointments: Number(futureAppointments[0].$extras.total) || 0
            })
        } catch (error) {
            console.error('Error deleting schedule:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to delete schedule',
                error: error.message
            })
        }
    }
}
