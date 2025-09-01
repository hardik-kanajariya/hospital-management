import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import DoctorSchedule from '#models/doctor_schedule'
import DoctorAvailability from '#models/doctor_availability'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
    async run() {
        // Get all active doctors
        const doctors = await User.query()
            .whereHas('role', (roleQuery) => {
                roleQuery.where('name', 'doctor')
            })
            .where('isActive', true)
            .limit(5) // Only seed schedules for first 5 doctors

        if (doctors.length === 0) {
            console.log('No doctors found. Please seed users with doctor role first.')
            return
        }

        console.log(`🏥 Creating schedules for ${doctors.length} doctors...`)

        // Sample schedule templates
        const scheduleTemplates = [
            {
                dayOfWeek: 'Monday',
                startTime: '09:00',
                endTime: '17:00',
                location: 'General OPD',
                maxPatients: 20,
                scheduleType: 'regular',
                slotDurationMinutes: 15,
                breakTimes: [
                    { start_time: '13:00', end_time: '14:00', label: 'Lunch Break' }
                ]
            },
            {
                dayOfWeek: 'Tuesday',
                startTime: '08:00',
                endTime: '16:00',
                location: 'Cardiology OPD',
                maxPatients: 15,
                scheduleType: 'consultation',
                slotDurationMinutes: 30,
                breakTimes: [
                    { start_time: '12:00', end_time: '13:00', label: 'Lunch Break' }
                ]
            },
            {
                dayOfWeek: 'Wednesday',
                startTime: '10:00',
                endTime: '18:00',
                location: 'General OPD',
                maxPatients: 25,
                scheduleType: 'regular',
                slotDurationMinutes: 20,
                breakTimes: [
                    { start_time: '13:00', end_time: '14:00', label: 'Lunch Break' },
                    { start_time: '16:00', end_time: '16:15', label: 'Tea Break' }
                ]
            },
            {
                dayOfWeek: 'Thursday',
                startTime: '09:30',
                endTime: '17:30',
                location: 'Neurology OPD',
                maxPatients: 12,
                scheduleType: 'consultation',
                slotDurationMinutes: 45,
                breakTimes: [
                    { start_time: '13:00', end_time: '14:00', label: 'Lunch Break' }
                ]
            },
            {
                dayOfWeek: 'Friday',
                startTime: '08:30',
                endTime: '16:30',
                location: 'General OPD',
                maxPatients: 18,
                scheduleType: 'regular',
                slotDurationMinutes: 15,
                breakTimes: [
                    { start_time: '12:30', end_time: '13:30', label: 'Lunch Break' }
                ]
            },
            {
                dayOfWeek: 'Saturday',
                startTime: '09:00',
                endTime: '13:00',
                location: 'Emergency Department',
                maxPatients: 30,
                scheduleType: 'emergency',
                slotDurationMinutes: 10,
                breakTimes: []
            }
        ]

        // Create schedules for each doctor
        for (let i = 0; i < doctors.length; i++) {
            const doctor = doctors[i]
            const scheduleCount = 3 + Math.floor(Math.random() * 3) // 3-5 schedules per doctor

            for (let j = 0; j < scheduleCount; j++) {
                const template = scheduleTemplates[j % scheduleTemplates.length]

                try {
                    await DoctorSchedule.create({
                        userId: doctor.id,
                        dayOfWeek: template.dayOfWeek,
                        startTime: template.startTime,
                        endTime: template.endTime,
                        location: template.location,
                        maxPatients: template.maxPatients,
                        slotDurationMinutes: template.slotDurationMinutes,
                        scheduleType: template.scheduleType,
                        status: 'active',
                        notes: `Sample schedule for Dr. ${doctor.name}`,
                        breakTimes: template.breakTimes,
                        isRecurring: true,
                        effectiveFrom: DateTime.now().startOf('week'),
                        priority: 1,
                        createdBy: null
                    })
                } catch (error) {
                    console.log(`⚠️ Schedule conflict for Dr. ${doctor.name} on ${template.dayOfWeek} - skipping`)
                }
            }
        }

        // Create some sample availability overrides
        const today = DateTime.now()

        const sampleAvailability = [
            {
                userId: doctors[0]?.id,
                date: today.plus({ days: 3 }),
                isAvailable: false,
                availabilityType: 'leave',
                reason: 'Medical Conference',
                notifyPatients: true,
                autoReschedule: false
            },
            {
                userId: doctors[1]?.id || doctors[0]?.id,
                date: today.plus({ days: 5 }),
                isAvailable: false,
                availabilityType: 'sick_leave',
                reason: 'Sick Leave',
                replacementDoctorId: doctors[2]?.id || doctors[0]?.id,
                notifyPatients: true,
                autoReschedule: true
            },
            {
                userId: doctors[2]?.id || doctors[0]?.id,
                date: today.plus({ days: 7 }),
                isAvailable: true,
                availabilityType: 'emergency_duty',
                customStartTime: '18:00',
                customEndTime: '22:00',
                customLocation: 'Emergency Department',
                customMaxPatients: 50,
                notes: 'Extended hours for emergency duty',
                notifyPatients: false,
                autoReschedule: false
            }
        ]

        for (const avail of sampleAvailability) {
            if (!avail.userId) continue // Skip if no valid user ID

            try {
                await DoctorAvailability.create(avail)
            } catch (error) {
                console.log(`⚠️ Availability conflict - skipping`)
            }
        }

        console.log('✅ Doctor schedules and availability seeded successfully!')
    }
}
