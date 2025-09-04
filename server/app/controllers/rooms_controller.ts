import type { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import Bed from '#models/bed'
import { v4 as uuid } from 'uuid'

export default class RoomsController {
    /**
     * Get all rooms with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                department_id,
                floor,
                room_type,
                status,
                available_only
            } = request.qs()

            const query = Room.query()
                .preload('beds', (bedsQuery) => {
                    bedsQuery.preload('currentPatient')
                })
                .preload('department')

            if (search) {
                query.where('room_number', 'like', `%${search}%`)
            }

            if (department_id) {
                query.where('department_id', department_id)
            }

            if (floor) {
                query.where('floor', floor)
            }

            if (room_type) {
                query.where('room_type', room_type)
            }

            if (status) {
                query.where('status', status)
            }

            if (available_only === 'true') {
                query.whereHas('beds', (bedsQuery) => {
                    bedsQuery.where('status', 'available')
                })
            }

            const rooms = await query.paginate(page, limit)

            // Add computed properties
            const roomsData = rooms.toJSON()
            roomsData.data = roomsData.data.map((room: any) => ({
                ...room,
                occupied_beds: room.beds?.filter((bed: any) => bed.status === 'occupied').length || 0,
                available_beds: room.beds?.filter((bed: any) => bed.status === 'available').length || 0,
                maintenance_beds: room.beds?.filter((bed: any) => bed.status === 'maintenance').length || 0,
                cleaning_beds: room.beds?.filter((bed: any) => bed.status === 'cleaning').length || 0,
                reserved_beds: room.beds?.filter((bed: any) => bed.status === 'reserved').length || 0,
                occupancy_rate: room.capacity > 0 ? Math.round(((room.beds?.filter((bed: any) => bed.status === 'occupied').length || 0) / room.capacity) * 100) : 0
            }))

            return response.ok({
                success: true,
                data: roomsData,
                message: 'Rooms fetched successfully'
            })

        } catch (error) {
            console.error('Rooms index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving rooms'
            })
        }
    }

    /**
     * Get room details by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const room = await Room.query()
                .where('id', params.id)
                .preload('beds', (bedsQuery) => {
                    bedsQuery.preload('currentPatient')
                })
                .preload('department')
                .firstOrFail()

            // Add computed properties
            const roomData = room.toJSON()
            roomData.occupied_beds = room.beds?.filter(bed => bed.status === 'occupied').length || 0
            roomData.available_beds = room.beds?.filter(bed => bed.status === 'available').length || 0
            roomData.maintenance_beds = room.beds?.filter(bed => bed.status === 'maintenance').length || 0
            roomData.cleaning_beds = room.beds?.filter(bed => bed.status === 'cleaning').length || 0
            roomData.reserved_beds = room.beds?.filter(bed => bed.status === 'reserved').length || 0
            roomData.occupancy_rate = room.capacity > 0 ? Math.round(((room.beds?.filter(bed => bed.status === 'occupied').length || 0) / room.capacity) * 100) : 0

            return response.ok({
                success: true,
                data: roomData,
                message: 'Room details fetched successfully'
            })

        } catch (error) {
            console.error('Room show error:', error)
            return response.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }
    }

    /**
     * Create a new room with beds
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = request.all()

            // Generate UUID for room
            const roomId = uuid()

            const room = await Room.create({
                id: roomId,
                roomNumber: payload.room_number,
                roomType: payload.room_type,
                departmentId: payload.department_id,
                floor: payload.floor,
                capacity: payload.capacity || 1,
                amenities: payload.amenities || [],
                dailyRate: payload.daily_rate,
                status: payload.status || 'active',
                notes: payload.notes
            })

            // Create beds for the room
            const beds = []
            for (let i = 1; i <= room.capacity; i++) {
                const bed = await Bed.create({
                    id: uuid(),
                    roomId: room.id,
                    bedNumber: `${room.roomNumber}-${i.toString().padStart(2, '0')}`,
                    roomNumber: room.roomNumber, // Keep for backward compatibility
                    ward: payload.ward || 'General',
                    floor: room.floor.toString(),
                    type: room.roomType,
                    status: 'available',
                    dailyRate: room.dailyRate,
                    features: payload.amenities || [],
                    notes: `Bed ${i} in room ${room.roomNumber}`
                })
                beds.push(bed)
            }

            await room.load('beds')
            await room.load('department')

            return response.created({
                success: true,
                data: room,
                message: 'Room created successfully with beds'
            })

        } catch (error) {
            console.error('Room store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error creating room'
            })
        }
    }

    /**
     * Update room details
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const room = await Room.findOrFail(params.id)
            const payload = request.all()

            // If capacity is reduced, check if beds are occupied
            if (payload.capacity && payload.capacity < room.capacity) {
                const occupiedBeds = await Bed.query()
                    .where('room_id', room.id)
                    .where('status', 'occupied')
                    .count('* as total')

                if (occupiedBeds[0].$extras.total > payload.capacity) {
                    return response.badRequest({
                        success: false,
                        message: `Cannot reduce capacity to ${payload.capacity}. There are ${occupiedBeds[0].$extras.total} beds currently occupied.`
                    })
                }
            }

            // Update room
            room.merge({
                roomNumber: payload.room_number || room.roomNumber,
                roomType: payload.room_type || room.roomType,
                departmentId: payload.department_id || room.departmentId,
                floor: payload.floor || room.floor,
                capacity: payload.capacity || room.capacity,
                amenities: payload.amenities || room.amenities,
                dailyRate: payload.daily_rate || room.dailyRate,
                status: payload.status || room.status,
                notes: payload.notes || room.notes
            })
            await room.save()

            // Handle capacity changes
            if (payload.capacity) {
                const currentBeds = await room.related('beds').query()
                const currentBedCount = currentBeds.length

                if (payload.capacity > currentBedCount) {
                    // Add new beds
                    for (let i = currentBedCount + 1; i <= payload.capacity; i++) {
                        await Bed.create({
                            id: uuid(),
                            roomId: room.id,
                            bedNumber: `${room.roomNumber}-${i.toString().padStart(2, '0')}`,
                            roomNumber: room.roomNumber,
                            ward: currentBeds[0]?.ward || 'General',
                            floor: room.floor.toString(),
                            type: room.roomType,
                            status: 'available',
                            dailyRate: room.dailyRate,
                            features: room.amenities || [],
                            notes: `Bed ${i} in room ${room.roomNumber}`
                        })
                    }
                } else if (payload.capacity < currentBedCount) {
                    // Remove excess beds (only if not occupied)
                    const bedsToRemove = currentBeds.slice(payload.capacity)
                    for (const bed of bedsToRemove) {
                        if (bed.status !== 'occupied') {
                            await bed.delete()
                        }
                    }
                }
            }

            await room.load('beds')
            await room.load('department')

            return response.ok({
                success: true,
                data: room,
                message: 'Room updated successfully'
            })

        } catch (error) {
            console.error('Room update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error updating room'
            })
        }
    }

    /**
     * Delete room
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const room = await Room.findOrFail(params.id)

            // Check if any bed is occupied
            const occupiedBeds = await Bed.query()
                .where('room_id', room.id)
                .where('status', 'occupied')
                .first()

            if (occupiedBeds) {
                return response.badRequest({
                    success: false,
                    message: 'Cannot delete room with occupied beds'
                })
            }

            // Delete all beds first
            await Bed.query().where('room_id', room.id).delete()

            // Delete room
            await room.delete()

            return response.ok({
                success: true,
                message: 'Room deleted successfully'
            })

        } catch (error) {
            console.error('Room destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error deleting room'
            })
        }
    }

    /**
     * Get room availability statistics
     */
    async availability({ response }: HttpContext) {
        try {
            // Get room statistics by type
            const roomStats = await Room.query()
                .select('room_type')
                .count('* as total_rooms')
                .groupBy('room_type')

            // Get bed statistics by type and status
            const bedStats = await Bed.query()
                .select('type', 'status')
                .count('* as count')
                .groupBy('type', 'status')

            // Process statistics
            const availability: any = {}

            for (const stat of roomStats) {
                const type = stat.$extras.room_type
                availability[type] = {
                    total_rooms: Number(stat.$extras.total_rooms),
                    total_beds: 0,
                    available: 0,
                    occupied: 0,
                    maintenance: 0,
                    cleaning: 0,
                    reserved: 0,
                    occupancy_rate: 0
                }
            }

            for (const bedStat of bedStats) {
                const type = bedStat.type
                const status = bedStat.status
                const count = Number(bedStat.$extras.count)

                if (!availability[type]) {
                    availability[type] = {
                        total_rooms: 0,
                        total_beds: 0,
                        available: 0,
                        occupied: 0,
                        maintenance: 0,
                        cleaning: 0,
                        reserved: 0,
                        occupancy_rate: 0
                    }
                }

                availability[type].total_beds += count
                availability[type][status] = count
            }

            // Calculate occupancy rates
            for (const type in availability) {
                const data = availability[type]
                if (data.total_beds > 0) {
                    data.occupancy_rate = Math.round((data.occupied / data.total_beds) * 100)
                }
            }

            return response.ok({
                success: true,
                data: availability,
                message: 'Room availability fetched successfully'
            })

        } catch (error) {
            console.error('Room availability error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error fetching room availability'
            })
        }
    }

    /**
     * Get available rooms for admission
     */
    async availableForAdmission({ request, response }: HttpContext) {
        try {
            const { room_type, department_id } = request.qs()

            const query = Room.query()
                .where('status', 'active')
                .whereHas('beds', (bedsQuery) => {
                    bedsQuery.where('status', 'available')
                })
                .preload('beds', (bedsQuery) => {
                    bedsQuery.where('status', 'available').limit(1)
                })
                .preload('department')

            if (room_type) {
                query.where('room_type', room_type)
            }

            if (department_id) {
                query.where('department_id', department_id)
            }

            const rooms = await query

            const availableRooms = rooms.map(room => ({
                id: room.id,
                room_number: room.roomNumber,
                room_type: room.roomType,
                department: room.department,
                floor: room.floor,
                daily_rate: room.dailyRate,
                amenities: room.amenities,
                available_beds: room.beds?.length || 0,
                sample_bed: room.beds?.[0] || null
            }))

            return response.ok({
                success: true,
                data: availableRooms,
                message: 'Available rooms fetched successfully'
            })

        } catch (error) {
            console.error('Available rooms error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error fetching available rooms'
            })
        }
    }
}
