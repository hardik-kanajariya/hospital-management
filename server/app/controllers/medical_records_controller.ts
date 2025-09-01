import type { HttpContext } from '@adonisjs/core/http'
import MedicalRecord from '#models/medical_record'
import Patient from '#models/patient'
import User from '#models/user'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { medicalRecordValidator, updateMedicalRecordValidator } from '#validators/medical_record'
import MedicalDataService from '#services/medical_data_service'

export default class MedicalRecordsController {
    /**
     * Get all medical records with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const patientId = request.input('patientId', '')
            const doctorId = request.input('doctorId', '')

            let query = MedicalRecord.query()
                .preload('patient')
                .preload('doctor')

            if (patientId) {
                query = query.where('patient_id', patientId)
            }

            if (doctorId) {
                query = query.where('doctor_id', doctorId)
            }

            query = query.orderBy('visit_date', 'desc')

            const medicalRecords = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: medicalRecords,
                message: 'Medical records retrieved successfully'
            })

        } catch (error) {
            console.error('Medical records index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical records'
            })
        }
    }

    /**
     * Get single medical record by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const medicalRecord = await MedicalRecord.query()
                .where('id', params.id)
                .preload('patient')
                .preload('doctor')
                .first()

            if (!medicalRecord) {
                return response.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: medicalRecord,
                message: 'Medical record retrieved successfully'
            })

        } catch (error) {
            console.error('Medical record show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical record'
            })
        }
    }

    /**
     * Create new medical record
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(medicalRecordValidator)

            // Verify patient and doctor exist
            const patient = await Patient.find(payload.patientId)
            const doctor = await User.find(payload.doctorId)

            if (!patient) {
                return response.status(400).json({
                    success: false,
                    message: 'Patient not found'
                })
            }

            if (!doctor) {
                return response.status(400).json({
                    success: false,
                    message: 'Doctor not found'
                })
            }

            // Generate record ID
            const recordCount = await MedicalRecord.query().count('* as total')
            const recordId = `MR${String(Number(recordCount[0].$extras.total) + 1).padStart(6, '0')}`

            const medicalRecord = new MedicalRecord()
            medicalRecord.id = uuid()
            medicalRecord.recordId = recordId
            medicalRecord.patientId = payload.patientId
            medicalRecord.doctorId = payload.doctorId
            medicalRecord.appointmentId = payload.appointmentId || null
            medicalRecord.visitDate = payload.visitDate ? DateTime.fromJSDate(new Date(payload.visitDate)) : DateTime.now()
            medicalRecord.diagnosis = payload.diagnosis
            medicalRecord.treatment = payload.treatment
            medicalRecord.medications = payload.medications || []
            medicalRecord.labResults = payload.labResults || []
            medicalRecord.followUpInstructions = payload.followUpInstructions || []
            medicalRecord.nextVisitDate = payload.nextVisitDate ? DateTime.fromJSDate(new Date(payload.nextVisitDate)) : null
            medicalRecord.vitalSigns = payload.vitalSigns || {}
            medicalRecord.notes = payload.notes || null
            medicalRecord.attachments = payload.attachments || []

            await medicalRecord.save()

            // Load relationships
            await medicalRecord.load('patient')
            await medicalRecord.load('doctor')

            return response.status(201).json({
                success: true,
                data: medicalRecord,
                message: 'Medical record created successfully'
            })

        } catch (error) {
            console.error('Medical record store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating medical record'
            })
        }
    }

    /**
     * Update medical record
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const medicalRecord = await MedicalRecord.find(params.id)

            if (!medicalRecord) {
                return response.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                })
            }

            const payload = await request.validateUsing(updateMedicalRecordValidator)

            if (payload.visitDate !== undefined) medicalRecord.visitDate = payload.visitDate ? DateTime.fromJSDate(new Date(payload.visitDate)) : DateTime.now()
            if (payload.diagnosis !== undefined) medicalRecord.diagnosis = payload.diagnosis
            if (payload.treatment !== undefined) medicalRecord.treatment = payload.treatment
            if (payload.medications !== undefined) medicalRecord.medications = payload.medications
            if (payload.labResults !== undefined) medicalRecord.labResults = payload.labResults
            if (payload.followUpInstructions !== undefined) medicalRecord.followUpInstructions = payload.followUpInstructions
            if (payload.nextVisitDate !== undefined) medicalRecord.nextVisitDate = payload.nextVisitDate ? DateTime.fromJSDate(new Date(payload.nextVisitDate)) : null
            if (payload.vitalSigns !== undefined) medicalRecord.vitalSigns = payload.vitalSigns
            if (payload.notes !== undefined) medicalRecord.notes = payload.notes || null
            if (payload.attachments !== undefined) medicalRecord.attachments = payload.attachments

            await medicalRecord.save()

            await medicalRecord.load('patient')
            await medicalRecord.load('doctor')

            return response.status(200).json({
                success: true,
                data: medicalRecord,
                message: 'Medical record updated successfully'
            })

        } catch (error) {
            console.error('Medical record update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating medical record'
            })
        }
    }

    /**
     * Delete medical record
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const medicalRecord = await MedicalRecord.find(params.id)

            if (!medicalRecord) {
                return response.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                })
            }

            await medicalRecord.delete()

            return response.status(200).json({
                success: true,
                message: 'Medical record deleted successfully'
            })

        } catch (error) {
            console.error('Medical record destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting medical record'
            })
        }
    }

    /**
     * Get patient's medical history
     */
    async patientHistory({ params, request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)

            let query = MedicalRecord.query()
                .where('patient_id', params.patientId)
                .preload('doctor')

            query = query.orderBy('visit_date', 'desc')

            const medicalRecords = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: medicalRecords,
                message: 'Patient medical history retrieved successfully'
            })

        } catch (error) {
            console.error('Patient history error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving patient medical history'
            })
        }
    }

    /**
     * Get medical statistics for a patient
     */
    async statistics({ params, response }: HttpContext) {
        try {
            const patientId = params.patientId

            // Use the medical data service for comprehensive statistics
            const stats = await MedicalDataService.calculatePatientStatistics(patientId)

            return response.status(200).json({
                success: true,
                data: stats,
                message: 'Medical records statistics retrieved successfully'
            })

        } catch (error) {
            console.error('Medical records statistics error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical records statistics'
            })
        }
    }

    /**
     * Get medical timeline for a patient
     */
    async timeline({ params, request, response }: HttpContext) {
        try {
            const patientId = params.patientId
            const limit = request.input('limit', 50)

            // Get medical records
            const medicalRecords = await MedicalRecord.query()
                .where('patient_id', patientId)
                .preload('doctor')
                .orderBy('visit_date', 'desc')
                .limit(limit)

            // Transform to timeline events
            const timelineEvents = medicalRecords.map(record => ({
                id: record.id,
                type: 'medical_record',
                date: record.visitDate.toString(),
                title: record.diagnosis,
                description: record.treatment,
                status: 'completed',
                data: {
                    recordId: record.recordId,
                    doctor: record.doctor?.name || 'Unknown Doctor',
                    hasMedications: record.medications && record.medications.length > 0,
                    hasLabResults: record.labResults && record.labResults.length > 0,
                    hasVitalSigns: record.vitalSigns && Object.keys(record.vitalSigns).length > 0
                }
            }))

            // TODO: Add other timeline events (appointments, prescriptions, lab tests, etc.)
            // This would require querying other tables and merging the results

            return response.status(200).json({
                success: true,
                data: timelineEvents,
                message: 'Medical timeline retrieved successfully'
            })

        } catch (error) {
            console.error('Medical timeline error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical timeline'
            })
        }
    }

    /**
     * Get vital signs trends for a patient
     */
    async vitalSignsTrends({ params, request, response }: HttpContext) {
        try {
            const patientId = params.patientId
            const days = request.input('days', 30)

            // Use the medical data service for comprehensive trends analysis
            const trends = await MedicalDataService.getVitalSignsTrends(patientId, days)

            return response.status(200).json({
                success: true,
                data: trends,
                message: 'Vital signs trends retrieved successfully'
            })

        } catch (error) {
            console.error('Vital signs trends error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving vital signs trends'
            })
        }
    }

    /**
     * Search medical records
     */
    async search({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')

            if (!search) {
                return response.status(400).json({
                    success: false,
                    message: 'Search term is required'
                })
            }

            const medicalRecords = await MedicalRecord.query()
                .where('diagnosis', 'like', `%${search}%`)
                .orWhere('treatment', 'like', `%${search}%`)
                .orWhere('notes', 'like', `%${search}%`)
                .orWhere('record_id', 'like', `%${search}%`)
                .preload('patient')
                .preload('doctor')
                .orderBy('visit_date', 'desc')
                .paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: medicalRecords,
                message: 'Medical records search completed successfully'
            })

        } catch (error) {
            console.error('Medical records search error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while searching medical records'
            })
        }
    }

    /**
     * Get medical alerts for a patient
     */
    async alerts({ params, response }: HttpContext) {
        try {
            const patientId = params.patientId

            // Generate comprehensive medical alerts
            const alerts = await MedicalDataService.generateMedicalAlerts(patientId)

            return response.status(200).json({
                success: true,
                data: alerts,
                message: 'Medical alerts retrieved successfully'
            })

        } catch (error) {
            console.error('Medical alerts error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving medical alerts'
            })
        }
    }

    /**
     * Validate medical data before saving
     */
    async validate({ request, response }: HttpContext) {
        try {
            const { vitalSigns, medications, labResults } = request.only(['vitalSigns', 'medications', 'labResults'])

            const alerts = []

            // Validate vital signs
            if (vitalSigns) {
                const vitalAlerts = MedicalDataService.validateVitalSigns(vitalSigns)
                alerts.push(...vitalAlerts)
            }

            // Check medication interactions
            if (medications && medications.length > 0) {
                const medicationAlerts = MedicalDataService.checkMedicationInteractions(medications)
                alerts.push(...medicationAlerts)
            }

            // Validate lab results
            if (labResults && labResults.length > 0) {
                const labAlerts = MedicalDataService.validateLabResults(labResults)
                alerts.push(...labAlerts)
            }

            return response.status(200).json({
                success: true,
                data: {
                    isValid: alerts.filter(a => a.type === 'critical').length === 0,
                    alerts,
                    summary: {
                        critical: alerts.filter(a => a.type === 'critical').length,
                        warnings: alerts.filter(a => a.type === 'warning').length,
                        info: alerts.filter(a => a.type === 'info').length
                    }
                },
                message: 'Medical data validation completed'
            })

        } catch (error) {
            console.error('Medical data validation error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while validating medical data'
            })
        }
    }
}