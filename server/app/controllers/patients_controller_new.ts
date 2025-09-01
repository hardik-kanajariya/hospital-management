import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Patient from '#models/patient'
import { v4 as uuid } from 'uuid'
import { patientValidator, updatePatientValidator } from '#validators/patient'

export default class PatientsController {
    /**
     * Get all patients with pagination and search
     * Optimized for frontend expectations and performance
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = Math.min(request.input('limit', 20), 100) // Limit max to 100 for performance
            const search = request.input('search', '')
            const include = request.input('include', '')
            const sortBy = request.input('sort_by', 'created_at')
            const sortOrder = request.input('sort_order', 'desc')
            const bloodGroup = request.input('blood_group', '')
            const gender = request.input('gender', '')

            // Base query with only essential fields for list view (performance optimization)
            let query = Patient.query()
                .select([
                    'id',
                    'patient_id',
                    'name',
                    'phone',
                    'email',
                    'date_of_birth',
                    'gender',
                    'blood_group',
                    'created_at',
                    'updated_at'
                ])
                .whereNull('deleted_at')

            // Search functionality
            if (search) {
                query = query.where((builder) => {
                    builder
                        .where('name', 'like', `%${search}%`)
                        .orWhere('phone', 'like', `%${search}%`)
                        .orWhere('email', 'like', `%${search}%`)
                        .orWhere('patient_id', 'like', `%${search}%`)
                })
            }

            // Additional filters
            if (bloodGroup) {
                query = query.where('blood_group', bloodGroup)
            }

            if (gender) {
                query = query.where('gender', gender)
            }

            // Sorting
            const validSortFields = ['name', 'created_at', 'patient_id', 'date_of_birth']
            if (validSortFields.includes(sortBy)) {
                query = query.orderBy(sortBy, sortOrder === 'asc' ? 'asc' : 'desc')
            }

            // Include relationships if requested (for detailed views)
            if (include) {
                const relations = include.split(',').filter((rel: string) =>
                    ['appointments', 'medicalRecords', 'bills'].includes(rel.trim())
                )
                relations.forEach((relation: string) => {
                    query = query.preload(relation.trim() as any)
                })
            }

            const patients = await query.paginate(page, limit)

            // Format response to match frontend expectations
            return response.status(200).json({
                success: true,
                data: {
                    data: patients.data,
                    meta: {
                        current_page: patients.currentPage,
                        per_page: patients.perPage,
                        total: patients.total,
                        last_page: patients.lastPage,
                        from: (patients.currentPage - 1) * patients.perPage + 1,
                        to: Math.min(patients.currentPage * patients.perPage, patients.total)
                    }
                },
                message: 'Patients retrieved successfully'
            })

        } catch (error) {
            console.error('Patients index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patients',
                error: error.message
            })
        }
    }

    /**
     * Get single patient by ID with optional relationships
     */
    async show({ params, request, response }: HttpContext) {
        try {
            const include = request.input('include', '')

            let query = Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')

            // Include relationships if requested
            if (include) {
                const relations = include.split(',').filter((rel: string) =>
                    ['appointments', 'medicalRecords', 'bills'].includes(rel.trim())
                )
                relations.forEach((relation: string) => {
                    query = query.preload(relation.trim() as any, (subQuery) => {
                        // Only get recent records for performance
                        if (relation === 'appointments') {
                            subQuery.orderBy('appointment_date', 'desc').limit(10)
                        } else if (relation === 'medicalRecords') {
                            subQuery.orderBy('visit_date', 'desc').limit(10)
                        } else if (relation === 'bills') {
                            subQuery.orderBy('bill_date', 'desc').limit(10)
                        }
                    })
                })
            }

            const patient = await query.first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: patient,
                message: 'Patient retrieved successfully'
            })

        } catch (error) {
            console.error('Patient show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient',
                error: error.message
            })
        }
    }

    /**
     * Create new patient
     * Properly handles all form fields from frontend
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(patientValidator)

            // Generate unique patient ID
            let patientId = ''
            let patientNumber = 1
            let isUnique = false

            // Find next available patient ID (excluding soft deleted)
            while (!isUnique) {
                patientId = `PAT${String(patientNumber).padStart(6, '0')}`
                const existingPatient = await Patient.query()
                    .where('patient_id', patientId)
                    .whereNull('deleted_at')
                    .first()

                if (!existingPatient) {
                    isUnique = true
                } else {
                    patientNumber++
                }
            }

            // Validate required fields
            if (!payload.date_of_birth) {
                return response.status(400).json({
                    success: false,
                    message: 'Date of birth is required'
                })
            }

            // Process optional fields with proper defaults
            const emergencyContact = payload.emergency_contact || {
                name: '',
                relationship: '',
                phone: '',
                email: '',
                address: ''
            }

            // Validate and process blood group
            let bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null = null
            if (payload.blood_group && payload.blood_group.trim() !== '') {
                const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                const trimmedBloodGroup = payload.blood_group.trim()
                if (validBloodGroups.includes(trimmedBloodGroup)) {
                    bloodGroup = trimmedBloodGroup as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
                } else {
                    return response.status(400).json({
                        success: false,
                        message: 'Invalid blood group. Valid values are: A+, A-, B+, B-, AB+, AB-, O+, O-'
                    })
                }
            }

            // Clean arrays - remove empty strings
            const allergies = (payload.allergies || []).filter(allergy => allergy && allergy.trim() !== '')
            const chronicConditions = (payload.chronic_conditions || []).filter(condition => condition && condition.trim() !== '')

            // Clean vaccination records - remove empty ones
            const vaccinationRecords = (payload.vaccination_records || []).filter((vac: any) =>
                vac && vac.vaccine_name && vac.vaccine_name.trim() !== ''
            )

            // Process insurance info
            const insuranceInfo = payload.insurance_info && Object.keys(payload.insurance_info).length > 0
                ? payload.insurance_info
                : {}

            // Create patient record
            const patient = new Patient()
            patient.id = uuid()
            patient.patientId = patientId
            patient.name = payload.name.trim()
            patient.phone = payload.phone.trim()
            patient.email = payload.email?.trim() || null
            patient.dateOfBirth = DateTime.fromJSDate(new Date(payload.date_of_birth))
            patient.gender = payload.gender
            patient.address = payload.address.trim()
            patient.emergencyContact = emergencyContact
            patient.bloodGroup = bloodGroup
            patient.allergies = allergies
            patient.chronicConditions = chronicConditions
            patient.vaccinationRecords = vaccinationRecords
            patient.insuranceInfo = insuranceInfo

            await patient.save()

            return response.status(201).json({
                success: true,
                data: patient,
                message: 'Patient created successfully'
            })

        } catch (error) {
            console.error('Patient store error:', error)

            // Handle validation errors
            if (error.code === 'E_VALIDATION_FAILURE') {
                return response.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.messages
                })
            }

            return response.status(500).json({
                success: false,
                message: 'Server error while creating patient',
                error: error.message
            })
        }
    }

    /**
     * Update patient
     * Handles partial updates and maintains data integrity
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const patient = await Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            const payload = await request.validateUsing(updatePatientValidator)

            // Update basic fields
            if (payload.name !== undefined) patient.name = payload.name.trim()
            if (payload.email !== undefined) patient.email = payload.email?.trim() || null
            if (payload.phone !== undefined) patient.phone = payload.phone.trim()
            if (payload.address !== undefined) patient.address = payload.address.trim()
            if (payload.gender !== undefined) patient.gender = payload.gender

            // Update date of birth
            if (payload.date_of_birth !== undefined) {
                patient.dateOfBirth = DateTime.fromJSDate(new Date(payload.date_of_birth))
            }

            // Update emergency contact
            if (payload.emergency_contact !== undefined) {
                patient.emergencyContact = payload.emergency_contact || {
                    name: '',
                    relationship: '',
                    phone: '',
                    email: '',
                    address: ''
                }
            }

            // Update blood group with validation
            if (payload.blood_group !== undefined) {
                if (payload.blood_group && payload.blood_group.trim() !== '') {
                    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                    const trimmedBloodGroup = payload.blood_group.trim()
                    if (validBloodGroups.includes(trimmedBloodGroup)) {
                        patient.bloodGroup = trimmedBloodGroup as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
                    } else {
                        return response.status(400).json({
                            success: false,
                            message: 'Invalid blood group. Valid values are: A+, A-, B+, B-, AB+, AB-, O+, O-'
                        })
                    }
                } else {
                    patient.bloodGroup = null
                }
            }

            // Update arrays with cleaning
            if (payload.allergies !== undefined) {
                patient.allergies = (payload.allergies || []).filter(allergy => allergy && allergy.trim() !== '')
            }

            if (payload.chronic_conditions !== undefined) {
                patient.chronicConditions = (payload.chronic_conditions || []).filter(condition => condition && condition.trim() !== '')
            }

            if (payload.vaccination_records !== undefined) {
                patient.vaccinationRecords = (payload.vaccination_records || []).filter((vac: any) =>
                    vac && vac.vaccine_name && vac.vaccine_name.trim() !== ''
                )
            }

            // Update insurance info
            if (payload.insurance_info !== undefined) {
                patient.insuranceInfo = payload.insurance_info && Object.keys(payload.insurance_info).length > 0
                    ? payload.insurance_info
                    : {}
            }

            await patient.save()

            return response.status(200).json({
                success: true,
                data: patient,
                message: 'Patient updated successfully'
            })

        } catch (error) {
            console.error('Patient update error:', error)

            // Handle validation errors
            if (error.code === 'E_VALIDATION_FAILURE') {
                return response.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.messages
                })
            }

            return response.status(500).json({
                success: false,
                message: 'Server error while updating patient',
                error: error.message
            })
        }
    }

    /**
     * Delete patient (soft delete)
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const patient = await Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            // Soft delete by setting deleted_at timestamp
            patient.deletedAt = DateTime.now()
            await patient.save()

            return response.status(200).json({
                success: true,
                message: 'Patient deleted successfully'
            })

        } catch (error) {
            console.error('Patient destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting patient',
                error: error.message
            })
        }
    }

    /**
     * Search patients with improved performance
     */
    async search({ request, response }: HttpContext) {
        try {
            const query = request.input('q', '')
            const limit = Math.min(request.input('limit', 20), 50) // Limit for performance

            if (!query || query.trim().length < 2) {
                return response.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters long'
                })
            }

            const patients = await Patient.query()
                .select(['id', 'patient_id', 'name', 'phone', 'email', 'date_of_birth', 'gender'])
                .whereNull('deleted_at')
                .where((builder) => {
                    builder
                        .where('name', 'like', `%${query}%`)
                        .orWhere('phone', 'like', `%${query}%`)
                        .orWhere('patient_id', 'like', `%${query}%`)
                        .orWhere('email', 'like', `%${query}%`)
                })
                .orderBy('name', 'asc')
                .limit(limit)

            return response.status(200).json({
                success: true,
                data: patients,
                message: 'Search results retrieved successfully'
            })

        } catch (error) {
            console.error('Patient search error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while searching patients',
                error: error.message
            })
        }
    }

    /**
     * Get patient's medical history
     */
    async medicalHistory({ params, response }: HttpContext) {
        try {
            const patient = await Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .preload('medicalRecords', (query) => {
                    query
                        .orderBy('visit_date', 'desc')
                        .preload('doctor', (doctorQuery) => {
                            doctorQuery.select(['id', 'name', 'specialization'])
                        })
                        .limit(50) // Performance limit
                })
                .first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: patient.medicalRecords,
                message: 'Medical history retrieved successfully'
            })

        } catch (error) {
            console.error('Patient medical history error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical history',
                error: error.message
            })
        }
    }

    /**
     * Get patient's appointments
     */
    async appointments({ params, request, response }: HttpContext) {
        try {
            const status = request.input('status', '')
            const limit = request.input('limit', 20)

            const patient = await Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .preload('appointments', (query) => {
                    query
                        .orderBy('appointment_date', 'desc')
                        .orderBy('appointment_time', 'desc')
                        .preload('doctor', (doctorQuery) => {
                            doctorQuery.select(['id', 'name', 'specialization', 'department'])
                        })
                        .limit(limit)

                    if (status) {
                        query.where('status', status)
                    }
                })
                .first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: patient.appointments,
                message: 'Appointments retrieved successfully'
            })

        } catch (error) {
            console.error('Patient appointments error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving appointments',
                error: error.message
            })
        }
    }

    /**
     * Get patient's bills
     */
    async bills({ params, request, response }: HttpContext) {
        try {
            const status = request.input('status', '')
            const limit = request.input('limit', 20)

            const patient = await Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .preload('bills', (query) => {
                    query
                        .orderBy('bill_date', 'desc')
                        .limit(limit)

                    if (status) {
                        query.where('status', status)
                    }
                })
                .first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: patient.bills,
                message: 'Bills retrieved successfully'
            })

        } catch (error) {
            console.error('Patient bills error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving bills',
                error: error.message
            })
        }
    }

    /**
     * Get patient statistics
     * Optimized for dashboard performance
     */
    async stats({ response }: HttpContext) {
        try {
            // Use parallel queries for better performance
            const [
                totalPatientsResult,
                newTodayResult,
                newThisWeekResult,
                newThisMonthResult,
                genderStatsResult
            ] = await Promise.all([
                // Total patients count
                Patient.query()
                    .whereNull('deleted_at')
                    .count('* as total'),

                // New patients today
                Patient.query()
                    .whereNull('deleted_at')
                    .where('created_at', '>=', DateTime.now().startOf('day').toSQL())
                    .count('* as total'),

                // New patients this week
                Patient.query()
                    .whereNull('deleted_at')
                    .where('created_at', '>=', DateTime.now().startOf('week').toSQL())
                    .count('* as total'),

                // New patients this month
                Patient.query()
                    .whereNull('deleted_at')
                    .where('created_at', '>=', DateTime.now().startOf('month').toSQL())
                    .count('* as total'),

                // Gender distribution
                Patient.query()
                    .whereNull('deleted_at')
                    .select('gender')
                    .count('* as count')
                    .groupBy('gender')
            ])

            // Process results
            const totalPatients = parseInt(totalPatientsResult[0]?.$extras.total || '0')
            const newToday = parseInt(newTodayResult[0]?.$extras.total || '0')
            const newThisWeek = parseInt(newThisWeekResult[0]?.$extras.total || '0')
            const newThisMonth = parseInt(newThisMonthResult[0]?.$extras.total || '0')

            const genderDistribution = genderStatsResult.reduce((acc, stat) => {
                acc[stat.gender] = parseInt(stat.$extras.count)
                return acc
            }, {} as Record<string, number>)

            // Get age distribution
            const patients = await Patient.query()
                .whereNull('deleted_at')
                .select('date_of_birth')

            const ageGroups = {
                '0-18': 0,
                '19-35': 0,
                '36-50': 0,
                '51-65': 0,
                '65+': 0
            }

            patients.forEach(patient => {
                if (patient.dateOfBirth) {
                    const age = DateTime.now().diff(patient.dateOfBirth, 'years').years
                    if (age <= 18) ageGroups['0-18']++
                    else if (age <= 35) ageGroups['19-35']++
                    else if (age <= 50) ageGroups['36-50']++
                    else if (age <= 65) ageGroups['51-65']++
                    else ageGroups['65+']++
                }
            })

            // Get additional stats
            const [allergiesResult, chronicResult] = await Promise.all([
                Patient.query()
                    .whereNull('deleted_at')
                    .whereRaw("JSON_LENGTH(allergies) > 0")
                    .count('* as total'),

                Patient.query()
                    .whereNull('deleted_at')
                    .whereRaw("JSON_LENGTH(chronic_conditions) > 0")
                    .count('* as total')
            ])

            const patientsWithAllergies = parseInt(allergiesResult[0]?.$extras.total || '0')
            const patientsWithChronicConditions = parseInt(chronicResult[0]?.$extras.total || '0')

            return response.status(200).json({
                success: true,
                data: {
                    total_patients: totalPatients,
                    new_patients_today: newToday,
                    new_patients_this_week: newThisWeek,
                    new_patients_this_month: newThisMonth,
                    patients_by_gender: {
                        male: genderDistribution.male || 0,
                        female: genderDistribution.female || 0,
                        other: genderDistribution.other || 0
                    },
                    patients_by_age_group: ageGroups,
                    patients_with_allergies: patientsWithAllergies,
                    patients_with_chronic_conditions: patientsWithChronicConditions,
                    growth: {
                        daily: newToday,
                        weekly: newThisWeek,
                        monthly: newThisMonth
                    }
                },
                message: 'Patient statistics retrieved successfully'
            })

        } catch (error) {
            console.error('Patient stats error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient statistics',
                error: error.message
            })
        }
    }
}
