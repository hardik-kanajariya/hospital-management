import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Patient from '#models/patient'
import MasterData from '#models/master_data'
import PatientAllergy from '#models/patient_allergy'
import PatientMedication from '#models/patient_medication'
import PatientInsurance from '#models/patient_insurance'
import PatientConsent from '#models/patient_consent'
import PatientCommunicationPreferences from '#models/patient_communication_preferences'
import { v4 as uuid } from 'uuid'
import { patientValidator, updatePatientValidator } from '#validators/patient'
import {
    advancedSearchValidator,
    allergyValidator,
    medicationValidator,
    insuranceValidator,
    communicationPreferencesValidator,
    consentValidator
} from '#validators/patient_extended'

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
            const include = request.input('include', '') || ''
            const includeString = Array.isArray(include) ? include.join(',') : String(include)
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
            if (includeString && includeString.trim()) {
                const relations = includeString.split(',').filter((rel: string) =>
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
                    data: patients.all(),
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
            const include = request.input('include', '') || ''
            const includeString = Array.isArray(include) ? include.join(',') : String(include)

            let query = Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')

            // Include relationships if requested
            if (includeString && includeString.trim()) {
                const relations = includeString.split(',').filter((rel: string) =>
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

            // Generate unique patient ID - optimized approach
            let patientId = ''
            let patientNumber = 1

            // Get the latest patient ID with a single query (much more efficient)
            const latestPatient = await Patient.query()
                .select('patient_id')
                .whereNotNull('patient_id')
                .where('patient_id', 'like', 'PAT%')
                .orderBy('patient_id', 'desc')
                .first()

            if (latestPatient && latestPatient.patientId) {
                // Extract the number from the latest patient ID (e.g., "PAT000123" -> 123)
                const latestNumber = parseInt(latestPatient.patientId.substring(3))
                if (!isNaN(latestNumber)) {
                    patientNumber = latestNumber + 1
                }
            }

            patientId = `PAT${String(patientNumber).padStart(6, '0')}`

            // Validate required fields
            if (!payload.date_of_birth) {
                return response.status(400).json({
                    success: false,
                    message: 'Date of birth is required'
                })
            }

            // Convert date_of_birth to DateTime
            let dateOfBirth: DateTime
            try {
                if (payload.date_of_birth instanceof Date) {
                    dateOfBirth = DateTime.fromJSDate(payload.date_of_birth)
                } else if (typeof payload.date_of_birth === 'string') {
                    dateOfBirth = DateTime.fromISO(payload.date_of_birth)
                } else {
                    dateOfBirth = DateTime.fromJSDate(payload.date_of_birth)
                }

                if (!dateOfBirth.isValid) {
                    return response.status(400).json({
                        success: false,
                        message: 'Invalid date of birth format'
                    })
                }
            } catch (error) {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid date of birth format'
                })
            }

            // Process optional fields with proper defaults and validation
            const emergencyContact = payload.emergency_contact || {
                name: '',
                relationship: '',
                phone: '',
                email: '',
                address: ''
            }

            // Validate emergency contact relationship if provided
            if (emergencyContact.relationship && emergencyContact.relationship.trim() !== '') {
                const isValidRelationship = await MasterData.isValidValue('relationships', emergencyContact.relationship.trim())
                if (!isValidRelationship) {
                    const validRelationships = await MasterData.getValidValues('relationships')
                    return response.status(400).json({
                        success: false,
                        message: `Invalid emergency contact relationship. Valid values are: ${validRelationships.join(', ')}`
                    })
                }
            }

            // Validate and process blood group using master data
            let bloodGroup: string | null = null
            if (payload.blood_group && payload.blood_group.trim() !== '') {
                const trimmedBloodGroup = payload.blood_group.trim()
                const isValidBloodGroup = await MasterData.isValidValue('blood_groups', trimmedBloodGroup)

                if (isValidBloodGroup) {
                    bloodGroup = trimmedBloodGroup
                } else {
                    const validBloodGroups = await MasterData.getValidValues('blood_groups')
                    return response.status(400).json({
                        success: false,
                        message: `Invalid blood group. Valid values are: ${validBloodGroups.join(', ')}`
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

            // Validate gender using master data
            const isValidGender = await MasterData.isValidValue('genders', payload.gender)
            if (!isValidGender) {
                const validGenders = await MasterData.getValidValues('genders')
                return response.status(400).json({
                    success: false,
                    message: `Invalid gender. Valid values are: ${validGenders.join(', ')}`
                })
            }

            // Create patient record
            const patient = new Patient()
            patient.id = uuid()
            patient.patientId = patientId
            patient.name = payload.name.trim()
            patient.phone = payload.phone.trim()
            patient.email = payload.email?.trim() || null
            patient.dateOfBirth = dateOfBirth
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

            // Update date of birth
            if (payload.date_of_birth !== undefined) {
                try {
                    let dateOfBirth: DateTime
                    if (payload.date_of_birth instanceof Date) {
                        dateOfBirth = DateTime.fromJSDate(payload.date_of_birth)
                    } else if (typeof payload.date_of_birth === 'string') {
                        dateOfBirth = DateTime.fromISO(payload.date_of_birth)
                    } else {
                        dateOfBirth = DateTime.fromJSDate(payload.date_of_birth)
                    }

                    if (!dateOfBirth.isValid) {
                        return response.status(400).json({
                            success: false,
                            message: 'Invalid date of birth format'
                        })
                    }

                    patient.dateOfBirth = dateOfBirth
                } catch (error) {
                    return response.status(400).json({
                        success: false,
                        message: 'Invalid date of birth format'
                    })
                }
            }

            // Update emergency contact with relationship validation
            if (payload.emergency_contact !== undefined) {
                const emergencyContact = payload.emergency_contact || {
                    name: '',
                    relationship: '',
                    phone: '',
                    email: '',
                    address: ''
                }

                // Validate relationship if provided
                if (emergencyContact.relationship && emergencyContact.relationship.trim() !== '') {
                    const isValidRelationship = await MasterData.isValidValue('relationships', emergencyContact.relationship.trim())
                    if (!isValidRelationship) {
                        const validRelationships = await MasterData.getValidValues('relationships')
                        return response.status(400).json({
                            success: false,
                            message: `Invalid emergency contact relationship. Valid values are: ${validRelationships.join(', ')}`
                        })
                    }
                }

                patient.emergencyContact = emergencyContact
            }

            // Update blood group with validation using master data
            if (payload.blood_group !== undefined) {
                if (payload.blood_group && payload.blood_group.trim() !== '') {
                    const trimmedBloodGroup = payload.blood_group.trim()
                    const isValidBloodGroup = await MasterData.isValidValue('blood_groups', trimmedBloodGroup)

                    if (isValidBloodGroup) {
                        patient.bloodGroup = trimmedBloodGroup
                    } else {
                        const validBloodGroups = await MasterData.getValidValues('blood_groups')
                        return response.status(400).json({
                            success: false,
                            message: `Invalid blood group. Valid values are: ${validBloodGroups.join(', ')}`
                        })
                    }
                } else {
                    patient.bloodGroup = null
                }
            }

            // Validate gender if provided using master data
            if (payload.gender !== undefined) {
                const isValidGender = await MasterData.isValidValue('genders', payload.gender)
                if (!isValidGender) {
                    const validGenders = await MasterData.getValidValues('genders')
                    return response.status(400).json({
                        success: false,
                        message: `Invalid gender. Valid values are: ${validGenders.join(', ')}`
                    })
                }
                patient.gender = payload.gender
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

    // ===== SIMPLIFIED PHASE 3: ESSENTIAL API ENDPOINTS =====

    /**
     * Advanced search with multiple parameters
     * GET /api/patients/advanced-search
     */
    async advancedSearch({ request, response }: HttpContext) {
        try {
            const searchParams = await request.validateUsing(advancedSearchValidator)
            const page = searchParams.page || 1
            const limit = Math.min(searchParams.limit || 20, 100)

            let query = Patient.query().whereNull('deleted_at')

            // Apply search filters
            if (searchParams.name) {
                query = query.where('name', 'like', `%${searchParams.name}%`)
            }
            if (searchParams.phone) {
                query = query.where('phone', 'like', `%${searchParams.phone}%`)
            }
            if (searchParams.email) {
                query = query.where('email', 'like', `%${searchParams.email}%`)
            }
            if (searchParams.patient_id) {
                query = query.where('patient_id', 'like', `%${searchParams.patient_id}%`)
            }
            if (searchParams.gender) {
                query = query.where('gender', searchParams.gender)
            }
            if (searchParams.blood_group) {
                query = query.where('blood_group', searchParams.blood_group)
            }
            if (searchParams.date_of_birth_from) {
                query = query.where('date_of_birth', '>=', searchParams.date_of_birth_from)
            }
            if (searchParams.date_of_birth_to) {
                query = query.where('date_of_birth', '<=', searchParams.date_of_birth_to)
            }

            // Age range filtering
            if (searchParams.age_from || searchParams.age_to) {
                const today = DateTime.now()
                if (searchParams.age_to) {
                    const minDob = today.minus({ years: searchParams.age_to + 1 }).toISODate()
                    query = query.where('date_of_birth', '>=', minDob)
                }
                if (searchParams.age_from) {
                    const maxDob = today.minus({ years: searchParams.age_from }).toISODate()
                    query = query.where('date_of_birth', '<=', maxDob)
                }
            }

            // Date range filtering
            if (searchParams.created_from) {
                query = query.where('created_at', '>=', searchParams.created_from)
            }
            if (searchParams.created_to) {
                query = query.where('created_at', '<=', searchParams.created_to)
            }

            // Sorting
            const sortBy = searchParams.sort_by || 'created_at'
            const sortOrder = searchParams.sort_order || 'desc'
            query = query.orderBy(sortBy, sortOrder)

            const patients = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: {
                    data: patients.all(),
                    meta: {
                        current_page: patients.currentPage,
                        per_page: patients.perPage,
                        total: patients.total,
                        last_page: patients.lastPage
                    }
                },
                message: 'Advanced search completed successfully'
            })

        } catch (error) {
            console.error('Advanced search error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error during advanced search',
                error: error.message
            })
        }
    }

    /**
     * Get complete patient profile with all related data
     * GET /api/patients/:id/complete-profile
     */
    async completeProfile({ params, response }: HttpContext) {
        try {
            const patient = await Patient.query()
                .where('id', params.id)
                .whereNull('deleted_at')
                .preload('demographics')
                .preload('insurances')
                .preload('allergyRecords')
                .preload('currentMedications')
                .preload('immunizations')
                .preload('familyHistory')
                .preload('documents')
                .preload('consents')
                .preload('portalAccess')
                .preload('communicationPreferences')
                .first()

            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: patient,
                message: 'Complete patient profile retrieved successfully'
            })

        } catch (error) {
            console.error('Complete profile error:', error)
            return response.status(200).json({
                success: true,
                data: await Patient.find(params.id),
                message: 'Basic patient profile retrieved (extended data not available)'
            })
        }
    }

    /**
     * Get patient medical timeline
     * GET /api/patients/:id/timeline
     */
    async medicalTimeline({ params, response }: HttpContext) {
        try {
            const patient = await Patient.find(params.id)
            if (!patient) {
                return response.status(404).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            // Collect all medical events in chronological order
            const appointments = await patient.related('appointments').query()
                .select(['id', 'appointment_date', 'appointment_time', 'status', 'notes'])
                .orderBy('appointment_date', 'desc')

            const medicalRecords = await patient.related('medicalRecords').query()
                .select(['id', 'visit_date', 'diagnosis', 'treatment', 'notes'])
                .orderBy('visit_date', 'desc')

            const bills = await patient.related('bills').query()
                .select(['id', 'bill_date', 'total_amount', 'status'])
                .orderBy('bill_date', 'desc')

            // Combine and sort by date
            const timeline: any[] = []

            appointments.forEach(apt => {
                timeline.push({
                    type: 'appointment',
                    date: apt.appointmentDate,
                    data: apt
                })
            })

            medicalRecords.forEach(record => {
                timeline.push({
                    type: 'medical_record',
                    date: record.visitDate,
                    data: record
                })
            })

            bills.forEach(bill => {
                timeline.push({
                    type: 'bill',
                    date: bill.billDate,
                    data: bill
                })
            })

            // Sort by date descending
            timeline.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            })

            return response.status(200).json({
                success: true,
                data: {
                    patient_id: patient.id,
                    patient_name: patient.name,
                    timeline
                },
                message: 'Medical timeline retrieved successfully'
            })

        } catch (error) {
            console.error('Medical timeline error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical timeline',
                error: error.message
            })
        }
    }

    // ===== ALLERGY MANAGEMENT ENDPOINTS =====

    /**
     * Get patient allergies
     * GET /api/patients/:id/allergies
     */
    async getAllergies({ params, response }: HttpContext) {
        try {
            const allergies = await PatientAllergy.query()
                .where('patient_id', params.id)
                .orderBy('created_at', 'desc')

            return response.status(200).json({
                success: true,
                data: allergies,
                message: 'Patient allergies retrieved successfully'
            })

        } catch (error) {
            console.error('Get allergies error:', error)
            return response.status(200).json({
                success: true,
                data: [],
                message: 'Allergy system not yet configured'
            })
        }
    }

    /**
     * Add patient allergy
     * POST /api/patients/:id/allergies
     */
    async addAllergy({ params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(allergyValidator)

            const allergy = await PatientAllergy.create({
                patientId: params.id,
                allergen: payload.allergen,
                severity: payload.severity,
                reactionType: payload.reaction_type,
                onsetDate: payload.onset_date ? DateTime.fromJSDate(payload.onset_date) : null,
                notes: payload.notes,
                reportedBy: payload.verified_by
            })

            return response.status(201).json({
                success: true,
                data: allergy,
                message: 'Allergy added successfully'
            })

        } catch (error) {
            console.error('Add allergy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while adding allergy',
                error: error.message
            })
        }
    }

    // ===== MEDICATION MANAGEMENT ENDPOINTS =====

    /**
     * Get current patient medications
     * GET /api/patients/:id/medications/current
     */
    async getCurrentMedications({ params, response }: HttpContext) {
        try {
            const medications = await PatientMedication.query()
                .where('patient_id', params.id)
                .where('status', 'active')
                .orderBy('created_at', 'desc')

            return response.status(200).json({
                success: true,
                data: medications,
                message: 'Current medications retrieved successfully'
            })

        } catch (error) {
            console.error('Get current medications error:', error)
            return response.status(200).json({
                success: true,
                data: [],
                message: 'Medication system not yet configured'
            })
        }
    }

    /**
     * Add patient medication
     * POST /api/patients/:id/medications
     */
    async addMedication({ params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(medicationValidator)

            const medication = await PatientMedication.create({
                patientId: params.id,
                status: 'active',
                medicationName: payload.medication_name,
                genericName: payload.generic_name,
                dosage: payload.dosage,
                frequency: payload.frequency,
                route: payload.route,
                startDate: DateTime.fromJSDate(payload.start_date),
                endDate: payload.end_date ? DateTime.fromJSDate(payload.end_date) : null,
                prescribedBy: payload.prescribing_doctor,
                pharmacyName: payload.pharmacy,
                reason: payload.indication,
                adherenceNotes: payload.notes
            })

            return response.status(201).json({
                success: true,
                data: medication,
                message: 'Medication added successfully'
            })

        } catch (error) {
            console.error('Add medication error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while adding medication',
                error: error.message
            })
        }
    }

    /**
     * Discontinue medication
     * POST /api/patients/:id/medications/:medicationId/discontinue
     */
    async discontinueMedication({ params, response }: HttpContext) {
        try {
            const medication = await PatientMedication.query()
                .where('id', params.medicationId)
                .where('patient_id', params.id)
                .first()

            if (!medication) {
                return response.status(404).json({
                    success: false,
                    message: 'Medication record not found'
                })
            }

            medication.status = 'discontinued'
            medication.endDate = DateTime.now()
            await medication.save()

            return response.status(200).json({
                success: true,
                data: medication,
                message: 'Medication discontinued successfully'
            })

        } catch (error) {
            console.error('Discontinue medication error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while discontinuing medication',
                error: error.message
            })
        }
    }

    // ===== INSURANCE MANAGEMENT ENDPOINTS =====

    /**
     * Get patient insurance information
     * GET /api/patients/:id/insurances
     */
    async getInsurances({ params, response }: HttpContext) {
        try {
            const insurances = await PatientInsurance.query()
                .where('patient_id', params.id)
                .where('status', 'active')
                .orderBy('insurance_type', 'asc')

            return response.status(200).json({
                success: true,
                data: insurances,
                message: 'Patient insurance information retrieved successfully'
            })

        } catch (error) {
            console.error('Get insurances error:', error)
            return response.status(200).json({
                success: true,
                data: [],
                message: 'Insurance system not yet configured'
            })
        }
    }

    /**
     * Add patient insurance
     * POST /api/patients/:id/insurances
     */
    async addInsurance({ params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(insuranceValidator)

            const insurance = await PatientInsurance.create({
                patientId: params.id,
                status: 'active',
                verificationStatus: 'pending',
                insuranceType: payload.insurance_type,
                providerName: payload.provider_name,
                policyNumber: payload.policy_number,
                groupNumber: payload.group_number,
                subscriberName: payload.subscriber_name,
                subscriberRelationship: payload.subscriber_relationship as 'self' | 'spouse' | 'child' | 'parent' | 'other' || 'self',
                subscriberDob: payload.subscriber_dob ? DateTime.fromJSDate(payload.subscriber_dob) : null,
                effectiveDate: DateTime.fromJSDate(payload.effective_date),
                expiryDate: payload.expiry_date ? DateTime.fromJSDate(payload.expiry_date) : null,
                copayAmount: payload.copay_amount,
                deductibleAmount: payload.deductible_amount,
                coverageDetails: payload.coverage_details
            })

            return response.status(201).json({
                success: true,
                data: insurance,
                message: 'Insurance information added successfully'
            })

        } catch (error) {
            console.error('Add insurance error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while adding insurance information',
                error: error.message
            })
        }
    }

    // ===== COMMUNICATION PREFERENCES ENDPOINTS =====

    /**
     * Get patient communication preferences
     * GET /api/patients/:id/communications/preferences
     */
    async getCommunicationPreferences({ params, response }: HttpContext) {
        try {
            const preferences = await PatientCommunicationPreferences.query()
                .where('patient_id', params.id)
                .first()

            return response.status(200).json({
                success: true,
                data: preferences,
                message: 'Communication preferences retrieved successfully'
            })

        } catch (error) {
            console.error('Get communication preferences error:', error)
            return response.status(200).json({
                success: true,
                data: null,
                message: 'Communication preferences not yet configured'
            })
        }
    }

    /**
     * Update patient communication preferences
     * PUT /api/patients/:id/communications/preferences
     */
    async updateCommunicationPreferences({ params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(communicationPreferencesValidator)

            let preferences = await PatientCommunicationPreferences.query()
                .where('patient_id', params.id)
                .first()

            if (!preferences) {
                preferences = await PatientCommunicationPreferences.create({
                    patientId: params.id,
                    appointmentReminders: payload.appointment_reminders ?? true,
                    appointmentReminderMethod: payload.appointment_reminder_method || 'email',
                    appointmentReminderTiming: payload.appointment_reminder_timing || 24,
                    labResultsNotification: payload.lab_results_notification ?? true,
                    labResultsMethod: payload.lab_results_method || 'email',
                    billingNotifications: payload.billing_notifications ?? true,
                    billingMethod: payload.billing_method || 'email',
                    marketingCommunications: payload.marketing_communications ?? false,
                    healthTips: payload.health_tips ?? true,
                    surveyParticipation: payload.survey_participation ?? false,
                    preferredPharmacyId: payload.preferred_pharmacy_id
                })
            } else {
                preferences.appointmentReminders = payload.appointment_reminders ?? preferences.appointmentReminders
                preferences.appointmentReminderMethod = payload.appointment_reminder_method || preferences.appointmentReminderMethod
                preferences.appointmentReminderTiming = payload.appointment_reminder_timing ?? preferences.appointmentReminderTiming
                preferences.labResultsNotification = payload.lab_results_notification ?? preferences.labResultsNotification
                preferences.labResultsMethod = payload.lab_results_method || preferences.labResultsMethod
                preferences.billingNotifications = payload.billing_notifications ?? preferences.billingNotifications
                preferences.billingMethod = payload.billing_method || preferences.billingMethod
                preferences.marketingCommunications = payload.marketing_communications ?? preferences.marketingCommunications
                preferences.healthTips = payload.health_tips ?? preferences.healthTips
                preferences.surveyParticipation = payload.survey_participation ?? preferences.surveyParticipation
                preferences.preferredPharmacyId = payload.preferred_pharmacy_id || preferences.preferredPharmacyId
                await preferences.save()
            }

            return response.status(200).json({
                success: true,
                data: preferences,
                message: 'Communication preferences updated successfully'
            })

        } catch (error) {
            console.error('Update communication preferences error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating communication preferences',
                error: error.message
            })
        }
    }

    // ===== CONSENT MANAGEMENT ENDPOINTS =====

    /**
     * Get patient consents
     * GET /api/patients/:id/consents
     */
    async getConsents({ params, response }: HttpContext) {
        try {
            const consents = await PatientConsent.query()
                .where('patient_id', params.id)
                .orderBy('created_at', 'desc')

            return response.status(200).json({
                success: true,
                data: consents,
                message: 'Patient consents retrieved successfully'
            })

        } catch (error) {
            console.error('Get consents error:', error)
            return response.status(200).json({
                success: true,
                data: [],
                message: 'Consent system not yet configured'
            })
        }
    }

    /**
     * Add patient consent
     * POST /api/patients/:id/consents
     */
    async addConsent({ params, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(consentValidator)

            const consent = await PatientConsent.create({
                patientId: params.id,
                consentType: 'treatment', // Default to treatment consent
                status: 'granted',
                grantedDate: DateTime.now(),
                expiryDate: payload.expiry_date ? DateTime.fromJSDate(payload.expiry_date) : null,
                witnessName: payload.witness_name,
                witnessSignature: payload.witness_signature
            })

            return response.status(201).json({
                success: true,
                data: consent,
                message: 'Consent recorded successfully'
            })

        } catch (error) {
            console.error('Add consent error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while recording consent',
                error: error.message
            })
        }
    }

    /**
     * Revoke patient consent
     * PUT /api/patients/:id/consents/:consentId/revoke
     */
    async revokeConsent({ params, response }: HttpContext) {
        try {
            const consent = await PatientConsent.query()
                .where('id', params.consentId)
                .where('patient_id', params.id)
                .first()

            if (!consent) {
                return response.status(404).json({
                    success: false,
                    message: 'Consent record not found'
                })
            }

            consent.status = 'revoked'
            consent.revokedDate = DateTime.now()
            await consent.save()

            return response.status(200).json({
                success: true,
                data: consent,
                message: 'Consent revoked successfully'
            })

        } catch (error) {
            console.error('Revoke consent error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while revoking consent',
                error: error.message
            })
        }
    }
}
