import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MasterData from '#models/master_data'

export default class extends BaseSeeder {
    async run() {
        // Schedule types for doctor schedules
        const scheduleTypes = [
            {
                category: 'schedule_types',
                name: 'regular',
                description: 'Regular outpatient department schedule',
                value: 'regular',
                displayOrder: 1,
                isSystem: true,
                metadata: { color: '#2563eb', priority: 1 }
            },
            {
                category: 'schedule_types',
                name: 'emergency',
                description: 'Emergency department schedule',
                value: 'emergency',
                displayOrder: 3,
                isSystem: true,
                metadata: { color: '#dc2626', priority: 3 }
            },
            {
                category: 'schedule_types',
                name: 'surgery',
                description: 'Surgical procedures schedule',
                value: 'surgery',
                displayOrder: 2,
                isSystem: true,
                metadata: { color: '#7c3aed', priority: 2 }
            },
            {
                category: 'schedule_types',
                name: 'consultation',
                description: 'Special consultation schedule',
                value: 'consultation',
                displayOrder: 1,
                isSystem: true,
                metadata: { color: '#059669', priority: 1 }
            },
            {
                category: 'schedule_types',
                name: 'rounds',
                description: 'Hospital ward rounds schedule',
                value: 'rounds',
                displayOrder: 2,
                isSystem: true,
                metadata: { color: '#ea580c', priority: 2 }
            }
        ]

        // Availability types for doctor availability overrides
        const availabilityTypes = [
            {
                category: 'availability_types',
                name: 'override',
                description: 'General schedule override',
                value: 'override',
                displayOrder: 1,
                isSystem: true,
                metadata: { allowCustomTiming: true }
            },
            {
                category: 'availability_types',
                name: 'leave',
                description: 'Planned leave or vacation',
                value: 'leave',
                displayOrder: 2,
                isSystem: true,
                metadata: { requiresReplacement: false, notifyPatients: true }
            },
            {
                category: 'availability_types',
                name: 'sick_leave',
                description: 'Medical leave due to illness',
                value: 'sick_leave',
                displayOrder: 3,
                isSystem: true,
                metadata: { requiresReplacement: true, notifyPatients: true, urgent: true }
            },
            {
                category: 'availability_types',
                name: 'emergency_leave',
                description: 'Unplanned emergency leave',
                value: 'emergency_leave',
                displayOrder: 4,
                isSystem: true,
                metadata: { requiresReplacement: true, notifyPatients: true, urgent: true }
            },
            {
                category: 'availability_types',
                name: 'conference',
                description: 'Medical conference or training attendance',
                value: 'conference',
                displayOrder: 5,
                isSystem: true,
                metadata: { requiresReplacement: false, notifyPatients: true }
            },
            {
                category: 'availability_types',
                name: 'emergency_duty',
                description: 'Special emergency duty assignment',
                value: 'emergency_duty',
                displayOrder: 6,
                isSystem: true,
                metadata: { allowCustomTiming: true, priority: 3 }
            },
            {
                category: 'availability_types',
                name: 'holiday',
                description: 'Public or institutional holiday',
                value: 'holiday',
                displayOrder: 7,
                isSystem: true,
                metadata: { requiresReplacement: false, notifyPatients: false }
            }
        ]

        // Hospital locations/departments
        const scheduleLocations = [
            {
                category: 'schedule_locations',
                name: 'general_opd',
                description: 'General Outpatient Department',
                value: 'General OPD',
                displayOrder: 1,
                isSystem: true,
                metadata: { capacity: 30, type: 'outpatient' }
            },
            {
                category: 'schedule_locations',
                name: 'cardiology_opd',
                description: 'Cardiology Outpatient Department',
                value: 'Cardiology OPD',
                displayOrder: 2,
                isSystem: true,
                metadata: { capacity: 20, type: 'specialized' }
            },
            {
                category: 'schedule_locations',
                name: 'neurology_opd',
                description: 'Neurology Outpatient Department',
                value: 'Neurology OPD',
                displayOrder: 3,
                isSystem: true,
                metadata: { capacity: 15, type: 'specialized' }
            },
            {
                category: 'schedule_locations',
                name: 'pediatrics_opd',
                description: 'Pediatrics Outpatient Department',
                value: 'Pediatrics OPD',
                displayOrder: 4,
                isSystem: true,
                metadata: { capacity: 25, type: 'specialized' }
            },
            {
                category: 'schedule_locations',
                name: 'orthopedics_opd',
                description: 'Orthopedics Outpatient Department',
                value: 'Orthopedics OPD',
                displayOrder: 5,
                isSystem: true,
                metadata: { capacity: 20, type: 'specialized' }
            },
            {
                category: 'schedule_locations',
                name: 'emergency_dept',
                description: 'Emergency Department',
                value: 'Emergency Department',
                displayOrder: 6,
                isSystem: true,
                metadata: { capacity: 50, type: 'emergency', available24x7: true }
            },
            {
                category: 'schedule_locations',
                name: 'icu',
                description: 'Intensive Care Unit',
                value: 'ICU',
                displayOrder: 7,
                isSystem: true,
                metadata: { capacity: 10, type: 'critical', available24x7: true }
            },
            {
                category: 'schedule_locations',
                name: 'operation_theater_1',
                description: 'Main operation theater',
                value: 'Operation Theater 1',
                displayOrder: 8,
                isSystem: true,
                metadata: { capacity: 1, type: 'surgery' }
            },
            {
                category: 'schedule_locations',
                name: 'operation_theater_2',
                description: 'Secondary operation theater',
                value: 'Operation Theater 2',
                displayOrder: 9,
                isSystem: true,
                metadata: { capacity: 1, type: 'surgery' }
            },
            {
                category: 'schedule_locations',
                name: 'consultation_room_1',
                description: 'Private consultation room 1',
                value: 'Consultation Room 1',
                displayOrder: 10,
                isSystem: true,
                metadata: { capacity: 1, type: 'consultation' }
            },
            {
                category: 'schedule_locations',
                name: 'consultation_room_2',
                description: 'Private consultation room 2',
                value: 'Consultation Room 2',
                displayOrder: 11,
                isSystem: true,
                metadata: { capacity: 1, type: 'consultation' }
            },
            {
                category: 'schedule_locations',
                name: 'ward_general',
                description: 'General patient ward',
                value: 'General Ward',
                displayOrder: 12,
                isSystem: true,
                metadata: { capacity: 40, type: 'inpatient' }
            },
            {
                category: 'schedule_locations',
                name: 'ward_private',
                description: 'Private patient rooms',
                value: 'Private Ward',
                displayOrder: 13,
                isSystem: true,
                metadata: { capacity: 10, type: 'inpatient' }
            }
        ]

        // Time slot durations
        const slotDurations = [
            {
                category: 'slot_durations',
                name: '10_minutes',
                description: '10-minute appointment slots',
                value: '10',
                displayOrder: 1,
                isSystem: true,
                metadata: { minutes: 10, suitable_for: ['quick_check', 'follow_up'] }
            },
            {
                category: 'slot_durations',
                name: '15_minutes',
                description: '15-minute appointment slots',
                value: '15',
                displayOrder: 2,
                isSystem: true,
                metadata: { minutes: 15, suitable_for: ['routine_check', 'consultation'] }
            },
            {
                category: 'slot_durations',
                name: '20_minutes',
                description: '20-minute appointment slots',
                value: '20',
                displayOrder: 3,
                isSystem: true,
                metadata: { minutes: 20, suitable_for: ['detailed_consultation'] }
            },
            {
                category: 'slot_durations',
                name: '30_minutes',
                description: '30-minute appointment slots',
                value: '30',
                displayOrder: 4,
                isSystem: true,
                metadata: { minutes: 30, suitable_for: ['comprehensive_check', 'new_patient'] }
            },
            {
                category: 'slot_durations',
                name: '45_minutes',
                description: '45-minute appointment slots',
                value: '45',
                displayOrder: 5,
                isSystem: true,
                metadata: { minutes: 45, suitable_for: ['complex_consultation', 'therapy'] }
            },
            {
                category: 'slot_durations',
                name: '60_minutes',
                description: '1-hour appointment slots',
                value: '60',
                displayOrder: 6,
                isSystem: true,
                metadata: { minutes: 60, suitable_for: ['surgery_consultation', 'psychiatric'] }
            }
        ]

        // Schedule statuses
        const scheduleStatuses = [
            {
                category: 'schedule_statuses',
                name: 'active',
                description: 'Currently active schedule',
                value: 'active',
                displayOrder: 1,
                isSystem: true,
                metadata: { color: '#22c55e', allowBooking: true }
            },
            {
                category: 'schedule_statuses',
                name: 'inactive',
                description: 'Temporarily inactive schedule',
                value: 'inactive',
                displayOrder: 2,
                isSystem: true,
                metadata: { color: '#6b7280', allowBooking: false }
            },
            {
                category: 'schedule_statuses',
                name: 'suspended',
                description: 'Suspended due to administrative reasons',
                value: 'suspended',
                displayOrder: 3,
                isSystem: true,
                metadata: { color: '#ef4444', allowBooking: false }
            },
            {
                category: 'schedule_statuses',
                name: 'draft',
                description: 'Draft schedule not yet activated',
                value: 'draft',
                displayOrder: 4,
                isSystem: true,
                metadata: { color: '#f59e0b', allowBooking: false }
            }
        ]

        // Combine all master data
        const allMasterData = [
            ...scheduleTypes,
            ...availabilityTypes,
            ...scheduleLocations,
            ...slotDurations,
            ...scheduleStatuses
        ]

        // Create master data entries
        for (const item of allMasterData) {
            await MasterData.updateOrCreate(
                { category: item.category, name: item.name },
                {
                    ...item,
                    isActive: true
                }
            )
        }

        console.log('✅ Doctor schedule master data seeded successfully!')
    }
}
