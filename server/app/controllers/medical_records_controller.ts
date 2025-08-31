import type { HttpContext } from '@adonisjs/core/http'
import MedicalRecord from '#models/medical_record'
import Patient from '#models/patient'
import User from '#models/user'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { medicalRecordValidator, updateMedicalRecordValidator } from '#validators/medical_record'

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
}