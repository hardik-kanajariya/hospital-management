import type { HttpContext } from '@adonisjs/core/http'
import Bed from '#models/bed'
import Patient from '#models/patient'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { bedValidator, updateBedValidator } from '#validators/bed'
import Database from '@adonisjs/lucid/services/db'

export default class BedsController {
    /**
     * Get all beds with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const ward = request.input('ward', '')
            const status = request.input('status', '')
            const bedType = request.input('bedType', '')

            let query = Bed.query()
                .preload('patient')

            if (ward) {
                query = query.where('ward', 'like', `%${ward}%`)
            }

            if (status) {
                query = query.where('status', status)
            }

            if (bedType) {
                query = query.where('type', bedType)
            }

            query = query.orderBy('room_number', 'asc').orderBy('bed_number', 'asc')

            const beds = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: beds,
                message: 'Beds retrieved successfully'
            })

        } catch (error) {
            console.error('Beds index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving beds'
            })
        }
    }

    /**
     * Get single bed by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const bed = await Bed.query()
                .where('id', params.id)
                .preload('patient')
                .first()

            if (!bed) {
                return response.status(404).json({
                    success: false,
                    message: 'Bed not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: bed,
                message: 'Bed retrieved successfully'
            })

        } catch (error) {
            console.error('Bed show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving bed'
            })
        }
    }

    /**
     * Create new bed
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(bedValidator)

            // Check if bed number already exists in the same room
            const existingBed = await Bed.query()
                .where('room_number', payload.roomNumber)
                .where('bed_number', payload.bedNumber)
                .first()

            if (existingBed) {
                return response.status(400).json({
                    success: false,
                    message: 'Bed number already exists in this room'
                })
            }

            const bed = new Bed()
            bed.id = uuid()
            bed.roomNumber = payload.roomNumber
            bed.bedNumber = payload.bedNumber
            bed.ward = payload.ward
            bed.type = payload.type
            bed.status = payload.status || 'available'
            bed.floor = payload.floor
            bed.features = payload.features || []
            bed.dailyRate = payload.dailyRate
            bed.notes = payload.notes || null

            await bed.save()

            return response.status(201).json({
                success: true,
                data: bed,
                message: 'Bed created successfully'
            })

        } catch (error) {
            console.error('Bed store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating bed'
            })
        }
    }

    /**
     * Update bed
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const bed = await Bed.find(params.id)

            if (!bed) {
                return response.status(404).json({
                    success: false,
                    message: 'Bed not found'
                })
            }

            const payload = await request.validateUsing(updateBedValidator)

            bed.merge(payload)
            await bed.save()

            await bed.load('patient')

            return response.status(200).json({
                success: true,
                data: bed,
                message: 'Bed updated successfully'
            })

        } catch (error) {
            console.error('Bed update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating bed'
            })
        }
    }

    /**
     * Delete bed
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const bed = await Bed.find(params.id)

            if (!bed) {
                return response.status(404).json({
                    success: false,
                    message: 'Bed not found'
                })
            }

            if (bed.status === 'occupied') {
                return response.status(400).json({
                    success: false,
                    message: 'Cannot delete an occupied bed'
                })
            }

            await bed.delete()

            return response.status(200).json({
                success: true,
                message: 'Bed deleted successfully'
            })

        } catch (error) {
            console.error('Bed destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting bed'
            })
        }
    }

    /**
     * Assign patient to bed
     */
    async assignPatient({ params, request, response }: HttpContext) {
        try {
            const bed = await Bed.find(params.id)

            if (!bed) {
                return response.status(404).json({
                    success: false,
                    message: 'Bed not found'
                })
            }

            if (bed.status !== 'available') {
                return response.status(400).json({
                    success: false,
                    message: 'Bed is not available for assignment'
                })
            }

            const patientId = request.input('patientId')
            const admissionDate = request.input('admissionDate', DateTime.now())

            if (!patientId) {
                return response.status(400).json({
                    success: false,
                    message: 'Patient ID is required'
                })
            }

            const patient = await Patient.find(patientId)
            if (!patient) {
                return response.status(400).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            bed.patientId = patientId
            bed.status = 'occupied'
            bed.admissionDate = admissionDate

            await bed.save()
            await bed.load('patient')

            return response.status(200).json({
                success: true,
                data: bed,
                message: 'Patient assigned to bed successfully'
            })

        } catch (error) {
            console.error('Bed assign patient error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while assigning patient to bed'
            })
        }
    }

    /**
     * Discharge patient from bed
     */
    async dischargePatient({ params, request, response }: HttpContext) {
        try {
            const bed = await Bed.find(params.id)

            if (!bed) {
                return response.status(404).json({
                    success: false,
                    message: 'Bed not found'
                })
            }

            if (bed.status !== 'occupied') {
                return response.status(400).json({
                    success: false,
                    message: 'Bed is not occupied'
                })
            }

            const dischargeDate = request.input('dischargeDate', DateTime.now())

            bed.patientId = null
            bed.status = 'maintenance' // Require cleaning before next patient
            bed.dischargeDate = dischargeDate

            await bed.save()

            return response.status(200).json({
                success: true,
                data: bed,
                message: 'Patient discharged from bed successfully'
            })

        } catch (error) {
            console.error('Bed discharge patient error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while discharging patient from bed'
            })
        }
    }

    /**
     * Get available beds
     */
    async available({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const ward = request.input('ward', '')
            const bedType = request.input('bedType', '')

            let query = Bed.query()
                .where('status', 'available')

            if (ward) {
                query = query.where('ward', 'like', `%${ward}%`)
            }

            if (bedType) {
                query = query.where('type', bedType)
            }

            query = query.orderBy('room_number', 'asc').orderBy('bed_number', 'asc')

            const availableBeds = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: availableBeds,
                message: 'Available beds retrieved successfully'
            })

        } catch (error) {
            console.error('Available beds error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving available beds'
            })
        }
    }

    /**
     * Get bed occupancy summary/statistics
     */
    async summary({ response }: HttpContext) {
        try {
            const totalBeds = await Bed.query().count('* as total')
            const occupiedBeds = await Bed.query().where('status', 'occupied').count('* as total')
            const availableBeds = await Bed.query().where('status', 'available').count('* as total')
            const maintenanceBeds = await Bed.query().where('status', 'maintenance').count('* as total')

            const summary = {
                totalBeds: totalBeds[0].$extras.total,
                occupiedBeds: occupiedBeds[0].$extras.total,
                availableBeds: availableBeds[0].$extras.total,
                maintenanceBeds: maintenanceBeds[0].$extras.total,
                occupancyRate: totalBeds[0].$extras.total > 0
                    ? ((occupiedBeds[0].$extras.total / totalBeds[0].$extras.total) * 100).toFixed(2)
                    : 0
            }

            return response.status(200).json({
                success: true,
                data: summary,
                message: 'Bed occupancy summary retrieved successfully'
            })

        } catch (error) {
            console.error('Bed summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving bed summary'
            })
        }
    }

    /**
     * Mark bed as cleaned
     */
    async clean({ params, response }: HttpContext) {
        try {
            const bed = await Bed.findOrFail(params.id)

            await bed.markAsCleaned()

            return response.ok({
                success: true,
                data: bed,
                message: 'Bed marked as cleaned'
            })

        } catch (error) {
            console.error('Bed clean error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error marking bed as cleaned'
            })
        }
    }

    /**
     * Mark bed for maintenance
     */
    async maintain({ params, response }: HttpContext) {
        try {
            const bed = await Bed.findOrFail(params.id)

            if (bed.status === 'occupied') {
                return response.badRequest({
                    success: false,
                    message: 'Cannot mark occupied bed for maintenance'
                })
            }

            bed.status = 'maintenance'
            await bed.markAsMaintained()

            return response.ok({
                success: true,
                data: bed,
                message: 'Bed marked for maintenance'
            })

        } catch (error) {
            console.error('Bed maintain error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error marking bed for maintenance'
            })
        }
    }

    /**
     * Get bed occupancy statistics
     */
    async occupancyStats({ request, response }: HttpContext) {
        try {
            const { department_id, floor } = request.qs()

            let query = Database
                .from('beds')
                .join('rooms', 'beds.room_id', 'rooms.id')
                .join('master_data', 'rooms.department_id', 'master_data.id')
                .select('master_data.name as department_name', 'beds.status')
                .count('beds.id as count')
                .groupBy('master_data.id', 'master_data.name', 'beds.status')

            if (department_id) {
                query = query.where('rooms.department_id', department_id)
            }

            if (floor) {
                query = query.where('rooms.floor', floor)
            }

            const stats = await query

            // Process stats by department
            const departmentStats: any = {}

            for (const stat of stats) {
                const deptName = stat.department_name
                if (!departmentStats[deptName]) {
                    departmentStats[deptName] = {
                        department_name: deptName,
                        total: 0,
                        available: 0,
                        occupied: 0,
                        maintenance: 0,
                        cleaning: 0,
                        reserved: 0,
                        occupancy_rate: 0
                    }
                }

                const count = Number(stat.count)
                departmentStats[deptName].total += count
                departmentStats[deptName][stat.status] = count
            }

            // Calculate occupancy rates
            for (const deptName in departmentStats) {
                const stats = departmentStats[deptName]
                if (stats.total > 0) {
                    stats.occupancy_rate = Math.round((stats.occupied / stats.total) * 100)
                }
            }

            return response.ok({
                success: true,
                data: Object.values(departmentStats),
                message: 'Bed occupancy statistics fetched successfully'
            })

        } catch (error) {
            console.error('Bed occupancy stats error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error fetching bed occupancy statistics'
            })
        }
    }
}