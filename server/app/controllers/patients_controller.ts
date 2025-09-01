import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Patient from '#models/patient'
import { v4 as uuid } from 'uuid'
import { patientValidator, updatePatientValidator } from '#validators/patient'

export default class PatientsController {
    /**
     * Get all patients with pagination and search
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')

            let query = Patient.query().whereNull('deleted_at')

            if (search) {
                query = query.where((builder) => {
                    builder
                        .where('name', 'like', `%${search}%`)
                        .orWhere('phone', 'like', `%${search}%`)
                        .orWhere('patient_id', 'like', `%${search}%`)
                        .orWhere('email', 'like', `%${search}%`)
                })
            }

            const patients = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: patients,
                message: 'Patients retrieved successfully'
            })

        } catch (error) {
            console.error('Patients index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patients'
            })
        }
    }

    /**
     * Get single patient by ID
     */
    async show({ params, response }: HttpContext) {
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

            return response.status(200).json({
                success: true,
                data: patient,
                message: 'Patient retrieved successfully'
            })

        } catch (error) {
            console.error('Patient show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient'
            })
        }
    }

    /**
     * Create new patient
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(patientValidator)

            // Generate patient ID - find next available ID to handle deleted patients
            let patientId = ''
            let patientNumber = 1
            let isUnique = false

            // Start from 1 and find the first available ID (excluding soft deleted)
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

            // Handle snake_case field names consistently
            if (!payload.date_of_birth) {
                return response.status(400).json({
                    success: false,
                    message: 'Date of birth is required'
                })
            }

            const emergencyContact = payload.emergency_contact || {}
            const bloodGroupValue = payload.blood_group || null
            const chronicConditions = payload.chronic_conditions || []
            const vaccinationRecords = payload.vaccination_records || []
            const insuranceInfo = payload.insurance_info || {}

            // Validate blood group if provided
            let bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null = null
            if (bloodGroupValue && bloodGroupValue.trim() !== '') {
                const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                if (validBloodGroups.includes(bloodGroupValue.trim())) {
                    bloodGroup = bloodGroupValue.trim() as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
                }
            }

            const patient = new Patient()
            patient.id = uuid()
            patient.patientId = patientId
            patient.name = payload.name
            patient.phone = payload.phone
            patient.email = payload.email || null
            patient.dateOfBirth = DateTime.fromJSDate(payload.date_of_birth)
            patient.gender = payload.gender
            patient.address = payload.address
            // Emergency contact is optional - set empty object if not provided
            patient.emergencyContact = emergencyContact
            patient.bloodGroup = bloodGroup
            patient.allergies = payload.allergies || []
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
            return response.status(500).json({
                success: false,
                message: 'Server error while creating patient',
                error: error.message
            })
        }
    }

    /**
     * Update patient
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

            // Handle snake_case field names consistently
            if (payload.name !== undefined) patient.name = payload.name
            if (payload.email !== undefined) patient.email = payload.email || null
            if (payload.phone !== undefined) patient.phone = payload.phone

            if (payload.date_of_birth !== undefined) patient.dateOfBirth = DateTime.fromJSDate(payload.date_of_birth)

            if (payload.gender !== undefined) patient.gender = payload.gender
            if (payload.address !== undefined) patient.address = payload.address

            if (payload.emergency_contact !== undefined) patient.emergencyContact = payload.emergency_contact

            // Handle blood group
            if (payload.blood_group !== undefined) {
                if (payload.blood_group && payload.blood_group.trim() !== '') {
                    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                    if (validBloodGroups.includes(payload.blood_group.trim())) {
                        patient.bloodGroup = payload.blood_group.trim() as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
                    } else {
                        patient.bloodGroup = null
                    }
                } else {
                    patient.bloodGroup = null
                }
            }

            if (payload.allergies !== undefined) patient.allergies = payload.allergies
            if (payload.chronic_conditions !== undefined) patient.chronicConditions = payload.chronic_conditions
            if (payload.vaccination_records !== undefined) patient.vaccinationRecords = payload.vaccination_records
            if (payload.insurance_info !== undefined) patient.insuranceInfo = payload.insurance_info

            await patient.save()

            return response.status(200).json({
                success: true,
                data: patient,
                message: 'Patient updated successfully'
            })
        } catch (error) {
            console.error('Patient update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating patient'
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
                message: 'Server error while deleting patient'
            })
        }
    }

    /**
     * Search patients
     */
    async search({ request, response }: HttpContext) {
        try {
            const query = request.input('q', '')
            const limit = request.input('limit', 20)

            if (!query) {
                return response.status(400).json({
                    success: false,
                    message: 'Search query is required'
                })
            }

            const patients = await Patient.query()
                .whereNull('deleted_at')
                .where((builder) => {
                    builder
                        .where('name', 'like', `%${query}%`)
                        .orWhere('phone', 'like', `%${query}%`)
                        .orWhere('patient_id', 'like', `%${query}%`)
                        .orWhere('email', 'like', `%${query}%`)
                })
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
                message: 'Server error while searching patients'
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
                .preload('medicalRecords', (query) => {
                    query.preload('doctor').orderBy('visit_date', 'desc')
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
                message: 'Server error while retrieving medical history'
            })
        }
    }

    /**
     * Get patient's appointments
     */
    async appointments({ params, response }: HttpContext) {
        try {
            const patient = await Patient.query()
                .where('id', params.id)
                .preload('appointments', (query) => {
                    query.preload('doctor').orderBy('appointment_date', 'desc')
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
                message: 'Server error while retrieving appointments'
            })
        }
    }

    /**
     * Get patient statistics
     */
    async stats({ response }: HttpContext) {
        try {
            // Get total patient count (excluding soft deleted)
            const totalPatients = await Patient.query()
                .whereNull('deleted_at')
                .count('* as total')
            const total = parseInt(totalPatients[0]?.$extras.total || '0')

            // Get new patients this month (excluding soft deleted)
            const startOfMonth = DateTime.now().startOf('month')
            const newThisMonth = await Patient.query()
                .whereNull('deleted_at')
                .where('created_at', '>=', startOfMonth.toSQL())
                .count('* as total')
            const newPatients = parseInt(newThisMonth[0]?.$extras.total || '0')

            // Get patients by gender (excluding soft deleted)
            const genderStats = await Patient.query()
                .whereNull('deleted_at')
                .select('gender')
                .count('* as count')
                .groupBy('gender')

            const genderDistribution = genderStats.reduce((acc, stat) => {
                acc[stat.gender || 'unknown'] = parseInt(stat.$extras.count)
                return acc
            }, {} as Record<string, number>)

            // Get patients by age groups (excluding soft deleted)
            const patients = await Patient.query()
                .whereNull('deleted_at')
                .select('date_of_birth')
            const ageGroups = {
                '0-18': 0,
                '19-30': 0,
                '31-50': 0,
                '51-70': 0,
                '71+': 0
            }

            patients.forEach(patient => {
                if (patient.dateOfBirth) {
                    const age = DateTime.now().diff(patient.dateOfBirth, 'years').years
                    if (age <= 18) ageGroups['0-18']++
                    else if (age <= 30) ageGroups['19-30']++
                    else if (age <= 50) ageGroups['31-50']++
                    else if (age <= 70) ageGroups['51-70']++
                    else ageGroups['71+']++
                }
            })

            // Get recent registrations (last 7 days, excluding soft deleted)
            const weekAgo = DateTime.now().minus({ days: 7 })
            const recentRegistrations = await Patient.query()
                .whereNull('deleted_at')
                .where('created_at', '>=', weekAgo.toSQL())
                .count('* as total')
            const recentCount = parseInt(recentRegistrations[0]?.$extras.total || '0')

            return response.status(200).json({
                success: true,
                data: {
                    totalPatients: total,
                    newPatientsThisMonth: newPatients,
                    recentRegistrations: recentCount,
                    genderDistribution,
                    ageDistribution: ageGroups,
                    growth: {
                        monthly: newPatients,
                        weekly: recentCount
                    }
                },
                message: 'Patient statistics retrieved successfully'
            })

        } catch (error) {
            console.error('Patient stats error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient statistics'
            })
        }
    }
}